export type Status = 'active' | 'expired' | 'upcoming' | 'undated';
export interface Offer {
  id: string; partnerId: string; name: string; sector: string; sourceCategory?: string;
  title: string; benefitType: string; discountMin?: number; discountMax?: number;
  displayRate?: string; originalPrice?: number; offerPrice?: number;
  savingsFrom?: number; savingsTo?: number; monthlyFee?: number;
  start?: string; end?: string; specificEnd?: string;
  eligibility?: string; minSpend?: number; promoCode?: string; redemption?: string;
  channel?: string; stacking?: string; exclusions?: string; conditions?: string;
  academicYear?: string; ageGrade?: string; season?: string; emirate?: string;
  area?: string; address?: string; country?: string; contactPerson?: string;
  phone?: string; otherPhone?: string; email?: string; website?: string;
  sourceUrl?: string; attachment?: string; poster?: string; textSource?: string;
  evidence?: string; headlineRate?: string; caution?: string; currency?: string;
}
export interface Partner {
  partnerId: string; name: string; sector: string; sourceCategory?: string;
  start?: string; end?: string; headlineRate?: string; originalTerms?: string;
  description?: string; contactPerson?: string; phone?: string;
  otherPhone?: string; artworkPhone?: string; email?: string;
  website?: string; sourceUrl?: string; textSource?: string;
  notes?: string; verification?: string; attachment?: string;
  poster?: string; address?: string; corporateId?: string;
  bookingEmail?: string; bookingPhone?: string;
}
export interface Branch {
  partnerId: string; partner?: string; sector?: string; branch?: string;
  address?: string; emirate?: string; country?: string; phone?: string;
  maps?: string; notes?: string; sourceUrl?: string;
}
export interface ReviewFlag {
  priority?: string; partner_scope?: string; issue?: string;
  source_grounded_explanation?: string; partnerId?: string;
  recommended_action?: string; evidence?: string;
}
export interface SourceRow { [key: string]: unknown; }
export interface Database {
  meta: {name: string; source: string; assembledOn: string; offerCount: number; partnerCount: number; branchCount: number; disclaimer: string};
  offers: Offer[]; partners: Partner[]; locations: Branch[];
  sources: SourceRow[]; reviewFlags: ReviewFlag[];
}
export type Language = 'en' | 'ar';
export type Route = {page: 'home'} | {page: 'explore'; query?: string; category?: string} | {page: 'offer'; id: string} |
  {page: 'directory'} | {page: 'partner'; id: string} | {page: 'favorites'} | {page: 'compare'} | {page: 'notFound'};
