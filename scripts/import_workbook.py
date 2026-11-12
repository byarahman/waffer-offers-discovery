#!/usr/bin/env python3
"""Import the Waffer master XLSX into a GitHub Pages-ready JSON data set.
Uses Python's standard library only; no paid API, server, or external packages.
Usage: python3 scripts/import_workbook.py path/to/workbook.xlsx
"""
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
SHEETS = {
    'Master Offers': 'xl/worksheets/sheet2.xml',
    'Partner Directory': 'xl/worksheets/sheet3.xml',
    'Branches & Locations': 'xl/worksheets/sheet4.xml',
    'Source Register': 'xl/worksheets/sheet5.xml',
    'Review Flags': 'xl/worksheets/sheet6.xml',
}
KEYS = {
 'Offer ID':'id', 'Partner ID':'partnerId', 'Partner Name':'partnerName',
 'Sector':'sector', 'Waffer Category':'sourceCategory',
 'Eligible Product / Service':'title','Benefit Type':'benefitType',
 'Discount Min %':'discountMin', 'Discount Max %':'discountMax',
 'Displayed Rate':'displayRate','Original Price AED':'originalPrice',
 'Offer Price AED':'offerPrice','AED Savings From':'savingsFrom',
 'AED Savings To':'savingsTo','Monthly Fee AED':'monthlyFee',
 'Listed Start':'start','Listed End':'end','Specific Offer End':'specificEnd',
 'Eligibility / Audience':'eligibility','Minimum Spend AED':'minSpend',
 'Promo Code / Corporate ID':'promoCode','How to Redeem':'redemption',
 'Sales Channel':'channel','Can Stack Offers?':'stacking',
 'Exclusions':'exclusions','Conditions / Specific Benefits':'conditions',
 'Academic Year':'academicYear','Age or Grade':'ageGrade',
 'Applicable Season':'season','Emirate':'emirate',
 'Area / Neighbourhood':'area', 'Postal Address':'address',
 'Country':'country','Contact Person':'contactPerson',
 'Telephone':'phone','Other Telephone':'otherPhone',
 'Email':'email','Website':'website',
 'Official Waffer Listing URL':'sourceUrl','Supporting PDF':'attachment',
 'Supporting Image':'poster','Captured Text Source':'textSource',
 'Evidence Level':'evidence','Official Headline Rate':'headlineRate',
 'Data Quality / Clarifications':'caution',
 'Full Original Waffer Offer Wording':'originalTerms',
 'Company Description':'companyDescription','Currency':'currency',
 'Partner Name':'name', 'Listing Start':'start', 'Listing End':'end',
 'Status':'importStatus', 'Current Status':'importStatus', 'Savings AED (formula)':'savings_aed_formula', 'Official Rate Summary':'headlineRate',
 'Full Original Offer (unabridged)':'originalTerms',
 'Company Description (unabridged)':'description',
 'Phone From Listing':'phone','Alternative Phone':'otherPhone',
 'Phone on Artwork':'artworkPhone','Website':'website',
 'Address / Branch':'address','Corporate ID':'corporateId',
 'Booking Contact Email':'bookingEmail','Booking Contact Phone':'bookingPhone',
 'Official Waffer Detail URL':'sourceUrl',
 'Supporting Artwork File':'poster','Attached PDF':'attachment',
 'Website Text Capture':'textSource',
 'Important Supplementary Notes':'notes',
 'Listing Verification':'verification',
 'Partner':'partner', 'Branch / Site':'branch',
 'Address / Location':'address','Contact Phone':'phone',
 'Google Maps URL':'maps', 'Source Notes':'notes',
 'Original Listing URL':'sourceUrl'
}
DATE_FIELDS={'start','end','specificEnd'}
NUM_FIELDS={'discountMin','discountMax','originalPrice','offerPrice','savingsFrom','savingsTo','monthlyFee','minSpend'}


def strings_from(z):
    x=ET.fromstring(z.read('xl/sharedStrings.xml'))
    return [''.join(t.text or '' for t in si.iter(NS+'t')) for si in x.findall(NS+'si')]


def col_index(address):
    s=re.match(r'[A-Z]+',address).group()
    n=0
    for ch in s:n=n*26+ord(ch)-64
    return n-1


def date_from_serial(s):
    try:
        v=float(s)
        return (datetime(1899,12,30,tzinfo=timezone.utc)+timedelta(days=v)).strftime('%Y-%m-%d')
    except (TypeError,ValueError,OverflowError):
        if isinstance(s,str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}',s):return s
        return None


def read_rows(z,path,shared):
    xml=ET.fromstring(z.read(path))
    data=xml.find(NS+'sheetData')
    rows=[]
    for row in data.findall(NS+'row'):
        values={}
        for c in row.findall(NS+'c'):
            i=col_index(c.get('r'))
            typ=c.get('t','')
            v=c.find(NS+'v')
            if typ=='inlineStr':
                inline=c.find(NS+'is')
                value=''.join(t.text or '' for t in inline.iter(NS+'t')) if inline is not None else None
            elif v is None:
                value=None
            elif typ=='s':
                value=shared[int(v.text)]
            elif typ=='b':
                value=(v.text=='1')
            elif typ in ['n','']:
                try:
                    num=float(v.text)
                    value=int(num) if num.is_integer() else num
                except (TypeError,ValueError):value=v.text
            else:value=v.text
            values[i]=value
        rows.append((int(row.get('r')),values))
    return rows


def structured(rows):
    header=next((v for n,v in rows if n==5),{})
    cols={i:KEYS.get(str(v).strip(),re.sub(r'\W+','_',str(v).strip().lower())) for i,v in header.items() if v is not None}
    out=[]
    for n,row in rows:
        if n<=5:continue
        obj={}
        for i,k in cols.items():
            if k in ['importStatus','savings_aed_formula'] :continue
            v=row.get(i)
            if isinstance(v,str):v=v.strip()
            if v in ('',None):continue
            if k in DATE_FIELDS:
                v=date_from_serial(v)
                if v is None:continue
            if k in NUM_FIELDS and isinstance(v,str):
                try:v=float(v)
                except ValueError:pass
            if k in obj: continue
            obj[k]=v
        if obj:out.append(obj)
    return out


def main():
    if len(sys.argv)!=2:
        raise SystemExit('Usage: python3 scripts/import_workbook.py path/to/workbook.xlsx')
    src=Path(sys.argv[1]); assert src.exists(),f'Workbook missing: {src}'
    with zipfile.ZipFile(src) as z:
        shared=strings_from(z)
        tab={name:structured(read_rows(z,path,shared)) for name,path in SHEETS.items()}
    offers=tab['Master Offers']
    partners=tab['Partner Directory']
    branches=tab['Branches & Locations']
    sources=tab['Source Register']
    flags=tab['Review Flags']
    assert len(offers)>0 and len(partners)>0
    all_offer_ids=[o.get('id') for o in offers]
    all_partner_ids=[p.get('partnerId') for p in partners]
    assert len(set(all_offer_ids))==len(all_offer_ids), 'Duplicate offer IDs'
    assert len(set(all_partner_ids))==len(all_partner_ids), 'Duplicate partner IDs'
    assert all(o.get('partnerId') in set(all_partner_ids) for o in offers), 'Orphan offer records'
    assert all(b.get('partnerId') in set(all_partner_ids) for b in branches), 'Orphan branch records'
    # Keep the genuine original partner-level terms once, not hundreds of repeated copies.
    for o in offers:
        o.pop('originalTerms',None)
        o.pop('companyDescription',None)
        if o.get('sourceUrl') and not str(o['sourceUrl']).startswith('https://'):
            o.pop('sourceUrl',None)
        # Do not render spreadsheet formula/current-status caches as a source of truth.
    for p in partners:
        p.pop('importStatus',None)
        if p.get('sourceUrl') and not str(p['sourceUrl']).startswith('https://'):
            p.pop('sourceUrl',None)
    pack={
        'meta':{
            'name':'Waffer Offers Discovery',
            'source':'User-supplied Waffer Master Offers spreadsheet',
            'assembledOn':datetime.now(timezone(timedelta(hours=4))).strftime('%Y-%m-%d'),
            'offerCount':len(offers),'partnerCount':len(partners),'branchCount':len(branches),
            'disclaimer':'Date status is calculated from supplied listing dates, not a live verification of availability. Confirm terms and eligibility with providers before redeeming.'
        },
        'offers':offers,'partners':partners,'locations':branches,'sources':sources,'reviewFlags':flags
    }
    target=ROOT/'public'/'data'/'offers.json'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(pack,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    with (ROOT/'DATA_AUDIT.md').open('w',encoding='utf-8') as f:
        f.write('# Data import audit\n\n')
        f.write(f'Workbook: `{src.name}`  \nOffers: **{len(offers)}**  \nPartners: **{len(partners)}**  \nDocumented branch locations: **{len(branches)}**  \nSource-register rows: **{len(sources)}**  \nReview-flag rows: **{len(flags)}**\n\n')
        f.write('All offer IDs and partner IDs are unique; every offer/branch maps to an existing partner.\n\n')
        f.write('## Offers by sector\n\n| Sector | Entries |\n|---|---:|\n')
        for name,n in Counter(o.get('sector','Uncategorized') for o in offers).most_common():f.write(f'| {name} | {n} |\n')
        f.write('\n## Data handling\n\n- Original Waffer offer wording is retained unabridged at partner level.\n- Individual benefits retain their own conditions, dates, discount bands, amounts, exclusions, and source references.\n- Spreadsheet formula caches are intentionally excluded; date-based statuses are calculated in the browser.\n- No missing prices or terms are imputed.\n- Public URLs are validated before constructing clickable links.\n- User-supplied documents have not been independently revalidated against the providers.\n')
    print(f'Imported {len(offers)} offers, {len(partners)} partners, {len(branches)} locations, {len(sources)} sources, {len(flags)} flags')
    print(f'JSON: {target.stat().st_size:,} bytes')

if __name__=='__main__':main()
