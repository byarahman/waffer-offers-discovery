"""Structural tests for public dataset. Run: python3 -m unittest discover -s tests -v"""
import json
import re
import unittest
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'public/data/offers.json').read_text(encoding='utf-8'))

class WorkbookIntegrityTests(unittest.TestCase):
    def test_counts_match_metadata(self):
        self.assertEqual(len(D['offers']),D['meta']['offerCount'])
        self.assertEqual(len(D['partners']),D['meta']['partnerCount'])
        self.assertEqual(len(D['locations']),D['meta']['branchCount'])
        self.assertGreater(len(D['offers']),250)
        self.assertGreater(len(D['partners']),90)
    def test_unique_ids_and_correct_joins(self):
        offer_ids=[o['id'] for o in D['offers']]
        partner_ids=[p['partnerId'] for p in D['partners']]
        self.assertEqual(len(offer_ids),len(set(offer_ids)))
        self.assertEqual(len(partner_ids),len(set(partner_ids)))
        partner_ids=set(partner_ids)
        for o in D['offers']: self.assertIn(o['partnerId'],partner_ids)
        for b in D['locations']: self.assertIn(b['partnerId'],partner_ids)
        for flag in D['reviewFlags']:
            if re.fullmatch(r'WAF-\d{3}', flag.get('partnerId','')):self.assertIn(flag['partnerId'],partner_ids)
    def test_fully_preserved_terms(self):
        self.assertTrue(all(p.get('originalTerms') for p in D['partners']))
        self.assertTrue(all(o.get('title') and o.get('benefitType') for o in D['offers']))
    def test_dates_iso_when_present(self):
        pattern=re.compile(r'^\d{4}-\d{2}-\d{2}$')
        for o in D['offers']:
            for key in ('start','end','specificEnd'):
                if o.get(key):self.assertRegex(o[key],pattern)
    def test_source_traceability(self):
        self.assertEqual(len(D['sources']),15)
        self.assertGreaterEqual(sum(bool(x.get('sourceUrl')) for x in D['offers']),300)
        self.assertGreaterEqual(len(D['reviewFlags']),10)
    def test_images_are_bundled(self):
        for p in D['partners']:
            if p.get('poster'):
                path=ROOT/'public/assets/posters'/f"{p['partnerId'].lower()}.webp"
                self.assertTrue(path.is_file(),f'Missing artwork: {path}')
    def test_offers_have_nonzero_benefits(self):
        types=Counter(o['benefitType'] for o in D['offers'])
        self.assertGreater(len(types),2)
        self.assertTrue(any(o.get('discountMin') for o in D['offers']))
    def test_public_references(self):
        for o in D['offers']:
            if o.get('sourceUrl'):self.assertTrue(o['sourceUrl'].startswith('https://'))

if __name__=='__main__':unittest.main()
