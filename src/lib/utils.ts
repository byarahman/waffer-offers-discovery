import type {Offer, Partner, Status, Database, Route} from './types';

export const CATEGORIES = [
  {name:'Health & wellness', icon:'heart-pulse', sectors:['Healthcare','Pharmacy','Beauty & Wellness']},
  {name:'Hotels & travel', icon:'plane', sectors:['Hotels & Hospitality','Travel & Tourism']},
  {name:'Food & dining', icon:'utensils', sectors:['Food & Dining','Food & Beverages']},
  {name:'Entertainment', icon:'ticket', sectors:['Entertainment']},
  {name:'Education', icon:'graduation-cap', sectors:['Education & Training']},
  {name:'Shopping', icon:'shopping-bag', sectors:['Online Shopping','Retail & Lifestyle']},
  {name:'Technology', icon:'laptop', sectors:['Electronics & Tech','Technology & IT','Telecommunications']},
  {name:'Automotive', icon:'car-front', sectors:['Automotive']},
  {name:'Home & design', icon:'house', sectors:['Home & Furnishings','Construction & Design']},
  {name:'Fitness', icon:'dumbbell', sectors:['Sports & Fitness']},
  {name:'Professional services', icon:'briefcase-business', sectors:['Professional Services','Banking & Finance']},
];
export function categoryOf(sector: string): string {
  return CATEGORIES.find(c => c.sectors.includes(sector))?.name ?? 'Other';
}
export function normalizeText(input: unknown): string {
  return String(input ?? '').normalize('NFKD').toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g,'').replace(/[إأآٱ]/g,'ا')
    .replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'')
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
export function formatDate(date?: string, locale='en-AE'): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Not provided';
  return new Intl.DateTimeFormat(locale, {day:'numeric',month:'short',year:'numeric', timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
}
export function currentDate(): string {
  // Use UAE's calendar date regardless of the visitor's timezone; offer dates are local UAE dates.
  return new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Dubai'}).format(new Date());
}
export function statusOf(o: Pick<Offer, 'start'|'end'|'specificEnd'>, today = currentDate()): Status {
  const until = [o.end,o.specificEnd].filter((v):v is string=>!!v).sort()[0];
  if (o.start && o.start > today) return 'upcoming';
  if (until && until < today) return 'expired';
  if (!until && !o.start) return 'undated';
  return 'active';
}
export function eligibilityUnconfirmed(o: Offer): boolean {
  return /not confirmed|not expressly|general advertised/i.test(`${o.evidence || ''} ${o.benefitType || ''}`);
}
export function benefitText(o: Offer): string {
  if (o.displayRate && o.displayRate !== '0%') return o.displayRate;
  if (typeof o.offerPrice === 'number') return `AED ${o.offerPrice.toLocaleString('en-AE')}`;
  if (typeof o.discountMin === 'number') return o.discountMin === o.discountMax ? `${o.discountMin}%` : `${o.discountMin}–${o.discountMax}%`;
  if (/complementary|complimentary|free/i.test(o.benefitType)) return 'Complimentary';
  return 'Special offer';
}
export function isSafeUrl(input?: string): string | undefined {
  if (!input || /\s/.test(input.trim())) return;
  const withScheme = /^https?:\/\//i.test(input) ? input : /^www\./i.test(input) ? `https://${input}` : '';
  if (!withScheme) return;
  try {const url = new URL(withScheme); if (!['http:','https:'].includes(url.protocol)) return; return url.href;} catch {return;}
}
export function phoneHref(phone?: string): string | undefined {
  if (!phone) return;
  const num = phone.replace(/[^\d+]/g,'');
  return /\d{6,}/.test(num) ? `tel:${num}` : undefined;
}
export function whatsappHref(phone?: string): string | undefined {
  if (!phone) return;
  let digits = phone.replace(/\D/g,'');
  if (digits.startsWith('00971')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 10) digits = `971${digits.slice(1)}`;
  return /^\d{9,15}$/.test(digits) ? `https://wa.me/${digits}` : undefined;
}
export function findRoute(): Route {
  const raw = window.location.hash.slice(1) || '/';
  const [path, queryStr] = raw.split('?');
  const query = new URLSearchParams(queryStr || '');
  if (path === '/') return {page:'home'};
  if (path === '/explore') return {page:'explore', query:query.get('q')||undefined, category:query.get('category')||undefined};
  if (path === '/directory') return {page:'directory'};
  if (path === '/favorites') return {page:'favorites'};
  if (path === '/compare') return {page:'compare'};
  if (path.startsWith('/offer/')) return {page:'offer',id:decodeURIComponent(path.slice(7))};
  if (path.startsWith('/partner/')) return {page:'partner',id:decodeURIComponent(path.slice(9))};
  return {page:'notFound'};
}
export function offerUrl(id: string): string {return `#/offer/${encodeURIComponent(id)}`;}
export function partnerUrl(id: string): string {return `#/partner/${encodeURIComponent(id)}`;}
export function exploreUrl(query?: string, category?: string): string {
  const q=new URLSearchParams(); if(query)q.set('q',query); if(category)q.set('category',category);
  return `#/explore${q.size ? `?${q}` : ''}`;
}
export function partnerPoster(partner?: Partner): string | undefined {
  if (!partner?.poster) return;
  return `${import.meta.env.BASE_URL}assets/posters/${partner.partnerId.toLowerCase()}.webp`;
}
export function searchable(o: Offer, p?: Partner): string {
  return normalizeText([o.name,o.sector,o.sourceCategory,o.title,o.benefitType,o.conditions,o.exclusions,o.eligibility,o.area,o.emirate,o.address,o.promoCode,p?.description,p?.originalTerms].filter(Boolean).join(' '));
}
export function matchScore(o: Offer, p: Partner | undefined, normalized: string): number {
  const terms = normalized.split(' ').filter(Boolean);
  if (!terms.length) return 0;
  const fields=[normalizeText(o.title),normalizeText(o.name),normalizeText(categoryOf(o.sector)),normalizeText(o.sector),searchable(o,p)];
  if (!terms.every(t=>fields[4].includes(t))) return -1;
  return terms.reduce((score,t)=>score+(fields[0].includes(t)?9:0)+(fields[1].includes(t)?6:0)+(fields[2].includes(t)?5:0)+(fields[3].includes(t)?4:0)+(fields[4].includes(t)?1:0),0);
}
export function validateDatabase(d: Database): boolean {
  if(!d || !Array.isArray(d.offers)||!Array.isArray(d.partners)||!Array.isArray(d.locations))return false;
  if(new Set(d.offers.map(x=>x.id)).size!==d.offers.length)return false;
  if(new Set(d.partners.map(x=>x.partnerId)).size!==d.partners.length)return false;
  const partners=new Set(d.partners.map(x=>x.partnerId));
  return d.offers.every(x=>!!x.id&&!!x.title&&partners.has(x.partnerId))&&d.locations.every(x=>partners.has(x.partnerId));
}
export function getPartner(data: Database, offer: Offer): Partner | undefined {return data.partners.find(p=>p.partnerId===offer.partnerId);}
export function money(n?: number):string{return typeof n === 'number' ? `AED ${n.toLocaleString('en-AE',{maximumFractionDigits:2})}` : 'Not provided';}
export function truncate(str:string, n=170):string{return str.length>n?`${str.slice(0,n).trimEnd()}…`:str;}
