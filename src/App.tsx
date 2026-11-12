import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {
  Search, ArrowRight, ArrowUpRight, ChevronRight, ChevronDown, Menu, X, Heart,
  SlidersHorizontal, MapPin, Phone, Mail, Globe, ExternalLink,
  Copy, GitCompareArrows, ShieldCheck, BadgePercent, Info, AlertCircle,
  Building2, CheckCircle2, Users, Frown,
  HeartPulse, Plane, Utensils, Ticket, GraduationCap, ShoppingBag, Laptop,
  CarFront, House, Dumbbell, BriefcaseBusiness, Sparkles,
  ArrowLeft, RotateCcw, MessageCircle, FileText
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import type {Database, Offer, Partner, Branch, Language, Route, Status} from './lib/types';
import {
  CATEGORIES, categoryOf, normalizeText, formatDate, statusOf, eligibilityUnconfirmed,
  benefitText, isSafeUrl, phoneHref, whatsappHref, findRoute, offerUrl,
  partnerUrl, exploreUrl, partnerPoster, matchScore, validateDatabase, money
} from './lib/utils';

const ICONS: Record<string, LucideIcon> = {
  'Health & wellness':HeartPulse,'Hotels & travel':Plane,'Food & dining':Utensils,
  'Entertainment':Ticket,'Education':GraduationCap,'Shopping':ShoppingBag,
  'Technology':Laptop,'Automotive':CarFront,'Home & design':House,
  'Fitness':Dumbbell,'Professional services':BriefcaseBusiness,'Other':Sparkles
};
const CAT_AR: Record<string,string> = {
  'Health & wellness':'الصحة والعافية','Hotels & travel':'الفنادق والسفر',
  'Food & dining':'الطعام والمطاعم','Entertainment':'الترفيه','Education':'التعليم',
  'Shopping':'التسوق','Technology':'التكنولوجيا','Automotive':'السيارات',
  'Home & design':'المنزل والتصميم','Fitness':'الرياضة واللياقة',
  'Professional services':'الخدمات المهنية','Other':'أخرى'
};
const TEXT = {
  en: {
    discover:'Discover',explore:'Explore offers',businesses:'Businesses',favorites:'Saved',compare:'Compare',allOffers:'All offers',
    tag:'A simpler way to make the most of Waffer',heroTitle:'More to enjoy. Less to spend.',
    heroSub:'Explore exclusive offers from UAE businesses. Find what fits, check the details, and make the most of your Waffer card.',
    searchPlaceholder:'Search offers, businesses, services…',search:'Search',viewAll:'Explore all offers',
    categories:'Browse by interest',categorySub:'Start with what matters to you.',
    highlights:'Worth exploring',highlightsSub:'A few current offers from different categories.',
    offers:'offers',partners:'businesses',locations:'branch locations',
    viewOffer:'View offer',save:'Save offer',saved:'Saved offer',removeSaved:'Remove from saved',
    compareOffer:'Add to compare',removeCompare:'Remove from compare',
    validTo:'Listed until',listedFrom:'Listed from',active:'Active dates',expired:'Listed period ended',upcoming:'Upcoming',undated:'No dates listed',
    filters:'Filters',clear:'Clear all',apply:'Show results',sort:'Sort by',sortRelevant:'Most relevant',sortDiscount:'Highest discount',sortLatest:'Ends soon',sortAlpha:'Business A–Z',
    category:'Category',business:'Business',location:'Location',benefit:'Offer type',minDiscount:'Minimum discount',status:'Date status',
    allCategories:'All categories',allBusinesses:'All businesses',allLocations:'All locations',allTypes:'All types',allStatuses:'All dates',
    allDiscounts:'Any discount',emptyTitle:'No matching offers',emptySub:'Try another search or clear a few filters.',noSaved:'No saved offers yet',
    noSavedSub:'Keep useful offers close by selecting the heart on an offer card.',
    browseAll:'Browse offers',dataNote:'Dates and offer details come from supplied sources; not live-verified. Always confirm with the business.',
    details:'Offer details',aboutOffer:'About this offer',included:'What you should know',conditions:'Conditions',exclusions:'Exclusions',
    audience:'Who can use this',redeem:'How to redeem',channel:'Where to redeem',minimum:'Minimum spend',
    stacking:'Combining with other offers',academic:'Academic year',ageGrade:'Age / grade',season:'Season',
    exactDate:'Listed validity',verification:'Verification',promo:'Promo code / ID',copy:'Copy',copied:'Copied',
    contact:'Contact the business',contactSub:'Confirm the latest eligibility and price directly before making a purchase.',
    call:'Call business',visit:'Visit website',source:'Official Waffer listing',directions:'Map / directions',
    whatsapp:'WhatsApp',email:'Email',original:'Full original offer wording',originalSub:'Shown as supplied, without rewriting the terms.',
    special:'Important note',related:'More from this business',branches:'Documented locations',
    partnerProfile:'Business profile',allFromBusiness:'All offers from this business',
    noMore:'No more offers',showMore:'Show more',compareYour:'Compare selected offers',
    compareHint:'Select two or three offers to see their terms side by side.',
    compareNow:'Compare selected',remove:'Remove',compareEmpty:'Nothing selected to compare',
    comparisonDetails:'Comparison',field:'Field',price:'Price',value:'Benefit',sourceRecord:'Source reference',
    showAll:'Show all date statuses',clearSearch:'Clear search',close:'Close',savePrompt:'Add to saved',
    unsavedPrompt:'Remove saved offer',notFound:'Page not found',back:'Back to offers',
    loading:'Loading offers…',loadError:'We could not load the offer directory.',retry:'Try again',
    provided:'Not supplied',noteUnconfirmed:'Waffer eligibility for this specific promotion is not confirmed in the supplied materials.',
    statsActive:'Offers within listed dates',statsBusiness:'Participating businesses',statsCategories:'Discovery categories',
    footerTitle:'Good offers. Clear details.',footerText:'An independent discovery interface built from supplied Waffer offer materials. Not an official government portal.',
    upcomingEnd:'Ending soon',sourceDate:'Compiled',terms:'Source terms',review:'Review before using',
    language:'Language',mobileMenu:'Open navigation menu',results:'results',
    noDiscount:'Special benefit',info:'Offer information',benefitDisclaimer:'Discount is not independently verified.',
    mapUnavailable:'Map link not provided',noComparison:'Select offers from the cards, then compare.',
  },
  ar: {
    discover:'اكتشف',explore:'استكشف العروض',businesses:'الشركات',favorites:'المحفوظات',compare:'مقارنة',allOffers:'جميع العروض',
    tag:'طريقة أسهل للاستفادة من وفر',heroTitle:'استمتع أكثر. وأنفق أقل.',
    heroSub:'اكتشف العروض المتاحة لدى شركات الإمارات، واطّلع على التفاصيل واستفد من بطاقة وفر.',
    searchPlaceholder:'ابحث عن العروض أو الشركات أو الخدمات…',search:'بحث',viewAll:'استكشف كل العروض',
    categories:'تصفح حسب الاهتمام',categorySub:'ابدأ بما يناسبك.',
    highlights:'عروض تستحق الاستكشاف',highlightsSub:'مجموعة متنوعة من العروض المدرجة ضمن فترة صلاحيتها.',
    offers:'عرض',partners:'شركة',locations:'فرع',viewOffer:'تفاصيل العرض',save:'حفظ العرض',saved:'تم الحفظ',removeSaved:'إزالة من المحفوظات',
    compareOffer:'أضف للمقارنة',removeCompare:'إزالة من المقارنة',validTo:'مدرج حتى',listedFrom:'مدرج من',
    active:'ضمن فترة الصلاحية',expired:'انتهت الفترة المدرجة',upcoming:'قريباً',undated:'التاريخ غير محدد',
    filters:'التصفية',clear:'مسح الكل',apply:'عرض النتائج',sort:'الترتيب',sortRelevant:'الأكثر صلة',sortDiscount:'أعلى خصم',sortLatest:'الأقرب انتهاءً',sortAlpha:'اسم الشركة',
    category:'الفئة',business:'الشركة',location:'الموقع',benefit:'نوع العرض',minDiscount:'الحد الأدنى للخصم',status:'حالة التاريخ',
    allCategories:'كل الفئات',allBusinesses:'كل الشركات',allLocations:'كل المواقع',allTypes:'كل الأنواع',allStatuses:'كل الحالات',allDiscounts:'أي خصم',
    emptyTitle:'لا توجد عروض مطابقة',emptySub:'جرّب عبارة أخرى أو امسح بعض الفلاتر.',noSaved:'لا توجد عروض محفوظة',
    noSavedSub:'احفظ العروض المفضلة من خلال الضغط على القلب.',browseAll:'تصفح العروض',
    dataNote:'التواريخ والتفاصيل من المواد المقدمة ولم تُتحقق مباشرة. يرجى التأكد من الشركة.',details:'تفاصيل العرض',
    aboutOffer:'عن العرض',included:'معلومات مهمة',conditions:'الشروط',exclusions:'الاستثناءات',audience:'المستفيدون',redeem:'كيفية الاستفادة',
    channel:'طريقة الاستخدام',minimum:'الحد الأدنى للشراء',stacking:'دمج العروض',academic:'السنة الدراسية',ageGrade:'العمر / الصف',season:'الموسم',
    exactDate:'فترة الصلاحية المدرجة',verification:'التحقق',promo:'رمز الخصم / المعرّف',copy:'نسخ',copied:'تم النسخ',
    contact:'التواصل مع الشركة',contactSub:'تحقق من الأهلية والأسعار مباشرة قبل الشراء.',call:'اتصل',visit:'الموقع الإلكتروني',
    source:'عرض وفر الأصلي',directions:'الخريطة',whatsapp:'واتساب',email:'البريد الإلكتروني',original:'نص العرض الأصلي الكامل',
    originalSub:'كما ورد في المصدر دون إعادة صياغة.',special:'ملاحظة مهمة',related:'عروض أخرى لهذه الشركة',branches:'المواقع المدرجة',
    partnerProfile:'ملف الشركة',allFromBusiness:'جميع عروض الشركة',noMore:'لا توجد عروض إضافية',showMore:'عرض المزيد',
    compareYour:'مقارنة العروض المحددة',compareHint:'اختر عرضين أو ثلاثة لعرض التفاصيل جنباً إلى جنب.',compareNow:'قارن المحدد',
    remove:'إزالة',compareEmpty:'لم يتم اختيار عروض للمقارنة',comparisonDetails:'المقارنة',field:'البيان',price:'السعر',value:'الميزة',
    sourceRecord:'المصدر',showAll:'عرض جميع حالات التاريخ',clearSearch:'مسح البحث',close:'إغلاق',savePrompt:'حفظ',unsavedPrompt:'إزالة المحفوظ',
    notFound:'الصفحة غير موجودة',back:'العودة للعروض',loading:'جاري تحميل العروض…',loadError:'تعذّر تحميل دليل العروض.',retry:'إعادة المحاولة',
    provided:'غير مذكور',noteUnconfirmed:'لم يتم تأكيد أهلية هذا العرض ضمن برنامج وفر في المواد المقدمة.',statsActive:'عروض ضمن الفترة المدرجة',
    statsBusiness:'شركات مشاركة',statsCategories:'فئات',footerTitle:'عروض جيدة. معلومات واضحة.',
    footerText:'دليل مستقل مبني على المواد المقدمة لعروض وفر، وليس بوابة حكومية رسمية.',upcomingEnd:'تنتهي قريباً',
    sourceDate:'تاريخ التجميع',terms:'الشروط الأصلية',review:'تحقق قبل الاستخدام',language:'اللغة',mobileMenu:'فتح القائمة',results:'نتيجة',
    noDiscount:'ميزة خاصة',info:'معلومات العرض',benefitDisclaimer:'الخصم لم يتم التحقق منه بصورة مستقلة.',
    mapUnavailable:'رابط الخريطة غير متوفر',noComparison:'اختر العروض من البطاقات ثم قارن.',
  }
};
type Key = keyof typeof TEXT.en;
function useTranslation(lang:Language){return useCallback((key:Key):string => TEXT[lang][key] || TEXT.en[key],[lang]);}
function catLabel(cat:string,lang:Language){return lang==='ar'?CAT_AR[cat]||cat:cat;}
function CategoryIcon({name,size=22}:{name:string;size?:number}){const I=ICONS[name]??Sparkles;return <I size={size} aria-hidden="true"/>;}
function StatusBadge({status, t}:{status:Status;t:(k:Key)=>string}){return <span className={`badge-status ${status}`}>{t(status)}</span>;}
function useHashRoute(){const [route,setRoute]=useState<Route>(()=>findRoute());useEffect(()=>{
  const listen=()=>setRoute(findRoute());window.addEventListener('hashchange',listen);return()=>window.removeEventListener('hashchange',listen);
},[]);useEffect(()=>{window.scrollTo(0,0);},[route.page,(route as {id?:string}).id]);return route;}
function usePersistentIds(key:string){const [items,setItems]=useState<string[]>(()=>{try{const raw=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(raw)?raw.filter((x):x is string=>typeof x==='string'):[]}catch{return [];}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(items));}catch{/* private browsing */}},[items,key]);
  const toggle=useCallback((id:string,max=999)=>setItems(old=>old.includes(id)?old.filter(x=>x!==id):old.length<max?[...old,id]:old),[]);
  return {items,toggle,setItems};
}
function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>}
function ContactLink({href,icon:Icon,children}:{href?:string;icon:LucideIcon;children:ReactNode}){return href?<a className="contact-link" href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined}><Icon size={16} aria-hidden="true"/><span>{children}</span></a>:null;}
function DetailItem({label,value,icon:Icon}:{label:string;value?:ReactNode;icon:LucideIcon}){return value? <div className="detail-item"><Icon size={19} aria-hidden="true"/><div><strong>{label}</strong><span dir="auto">{value}</span></div></div>:null;}
function Fact({label,value}:{label:string;value?:ReactNode}){return value?<div className="fact-box"><span className="muted-label">{label}</span><strong dir="auto">{value}</strong></div>:null;}
function canWhatsApp(p:Partner|undefined):boolean{return !!p && /whatsapp/i.test(`${p.originalTerms||''} ${p.notes||''}`);}
function contactEmail(o:Offer,p?:Partner):string|undefined{const value=o.email||p?.bookingEmail||p?.email;return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?value:undefined;}
function sourceAttachment(p?:Partner):string|undefined{if(!p?.attachment)return;const n=p.attachment.toLowerCase();
  if(n.includes('mas-waffer'))return `${import.meta.env.BASE_URL}assets/documents/MAS-Waffer-Offer-English.pdf`;
  if(n.includes('vallencia'))return `${import.meta.env.BASE_URL}assets/documents/Vallencia-Lighting-Waffer-Offer.pdf`;
  if(n.includes('nest-hotel'))return `${import.meta.env.BASE_URL}assets/documents/Nest-Hotel-Presentation.pdf`;
}
interface Shared {
  data: Database; lang: Language; t: (key:Key)=>string; favoriteIds:string[]; compareIds:string[];
  onFavorite:(id:string)=>void; onCompare:(id:string)=>void; onToast:(s:string)=>void;
}
function Header({route,lang,setLang,t,favoriteCount,menuOpen,setMenuOpen}:{route:Route;lang:Language;setLang:(l:Language)=>void;t:(key:Key)=>string;favoriteCount:number;menuOpen:boolean;setMenuOpen:(v:boolean)=>void}){
  const links:[string,string,Key,LucideIcon][]=[['/','#/','discover',House],['/explore','#/explore','explore',Search],['/directory','#/directory','businesses',Building2],['/favorites','#/favorites','favorites',Heart]];
  const selected=(item:string)=>item==='/'?route.page==='home':route.page===(item.replace('/','') as Route['page']);
  return <header className="site-header"><div className="container nav-wrap">
    <a className="brand" href="#/" aria-label="Waffer Offers home" onClick={()=>setMenuOpen(false)}><span className="brand-icon">w.</span><span className="brand-type"><strong>waffer<span className="brand-accent">.</span></strong><small>OFFERS DISCOVERY</small></span></a>
    <nav className={`nav-links ${menuOpen?'mobile-open':''}`} aria-label="Main navigation">
      {links.map(([id,url,label,Icon])=><a key={id} className={`nav-link ${selected(id)?'active':''}`} href={url} onClick={()=>setMenuOpen(false)} aria-current={selected(id)?'page':undefined}><Icon size={16} aria-hidden="true"/>{t(label)}{label==='favorites'&&favoriteCount>0&&<span className="nav-count">{favoriteCount}</span>}</a>)}
    </nav>
    <div className="nav-right"><button type="button" className="lang-button" onClick={()=>setLang(lang==='en'?'ar':'en')} aria-label={`${t('language')}: ${lang==='en'?'Arabic':'English'}`}>{lang==='en'?'العربية':'EN'}</button><a className="nav-cta" href="#/explore"><BadgePercent size={17}/>{t('allOffers')}</a><button type="button" className="menu-button" aria-label={menuOpen?t('close'):t('mobileMenu')} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button></div>
  </div></header>;
}
function OfferCard({o,shared}:{o:Offer;shared:Shared}){
  const {data,lang,t,favoriteIds,compareIds,onFavorite,onCompare}=shared;
  const p=data.partners.find(x=>x.partnerId===o.partnerId);
  const status=statusOf(o);const saved=favoriteIds.includes(o.id);const selected=compareIds.includes(o.id);
  const unconfirmed=eligibilityUnconfirmed(o);const category=categoryOf(o.sector);const rate=benefitText(o);
  return <article className={`offer-card ${status==='expired'?'is-expired':''}`}>
    <div className="card-top"><div className="card-icon"><CategoryIcon name={category}/></div><div className="card-actions"><StatusBadge status={status} t={t}/><button type="button" className="heart-button" aria-pressed={saved} aria-label={`${saved?t('removeSaved'):t('save')}: ${o.title}`} onClick={()=>onFavorite(o.id)}><Heart size={18} fill={saved?'currentColor':'none'}/></button></div></div>
    <a href={offerUrl(o.id)} className="card-main"><div className="card-rate"><span className="rate-number">{rate}</span></div><h3 dir="auto">{o.title}</h3><div className="card-business">{p?.name||o.name}</div></a>
    <div className="card-tags"><span className="chip">{catLabel(category,lang)}</span>{unconfirmed?<span className="chip chip-warning">{t('review')}</span>:o.emirate?<span className="chip chip-neutral">{o.emirate}</span>:null}</div>
    <div className="card-bottom"><a href={offerUrl(o.id)} className="text-link">{t('viewOffer')} <ArrowRight size={16}/></a><button type="button" className={`card-compare ${selected?'selected':''}`} onClick={()=>onCompare(o.id)} aria-label={`${selected?t('removeCompare'):t('compareOffer')}: ${o.title}`} aria-pressed={selected}><GitCompareArrows size={15} aria-hidden="true"/>{selected?t('remove'):t('compare')}</button></div>
  </article>;
}
function OfferGrid({offers,shared}:{offers:Offer[];shared:Shared}){return <div className="cards-grid">{offers.map(o=><OfferCard key={o.id} o={o} shared={shared}/>)}</div>}
function EmptyState({icon:Icon=Search,title,description,action,link}:{icon?:LucideIcon;title:string;description:string;action?:string;link?:string}){
 return <div className="empty-state"><div className="empty-glyph"><Icon size={28}/></div><h3>{title}</h3><p>{description}</p>{action&&link&&<a className="btn btn-dark" href={link}>{action}<ArrowRight size={17}/></a>}</div>
}
function Home({shared}:{shared:Shared}){
  const {data,lang,t}=shared;const [query,setQuery]=useState('');
  const active=data.offers.filter(o=>statusOf(o)==='active'&&!eligibilityUnconfirmed(o));
  const counts=new Map(CATEGORIES.map(cat=>[cat.name,data.offers.filter(o=>categoryOf(o.sector)===cat.name).length]));
  const currentPartners=new Set(active.map(x=>x.partnerId)).size;
  const picked=useMemo(()=>{const sorted=[...active].sort((a,b)=>(b.discountMax||0)-(a.discountMax||0));const result:Offer[]=[];const used=new Set<string>();for(const o of sorted){const cat=categoryOf(o.sector);if(used.has(cat)||used.has(o.partnerId))continue;result.push(o);used.add(cat);used.add(o.partnerId);if(result.length===6)break;}return result;},[data]);
  return <><section className="hero"><div className="container hero-inner"><div className="hero-content"><span className="eyebrow">{t('tag')}</span><h1>{lang==='en'?<>More to enjoy.<br/><em>Less to spend.</em></>:t('heroTitle')}</h1><p className="hero-description">{t('heroSub')}</p><form className="search-large" onSubmit={(e:{preventDefault:()=>void})=>{e.preventDefault();window.location.hash=exploreUrl(query.trim());}}><Search size={22}/><label htmlFor="home-search" className="sr-only">{t('search')}</label><input id="home-search" type="search" autoComplete="off" value={query} onChange={(e:{target:{value:string}})=>setQuery(e.target.value)} placeholder={t('searchPlaceholder')}/><button type="submit" className="btn btn-dark">{t('search')} <ArrowRight size={18}/></button></form><div className="hero-meta"><span><ShieldCheck size={16}/>{t('dataNote')}</span></div></div><div className="hero-trust"><span className="trust-tiny">{t('statsActive')}</span><strong>{active.length.toLocaleString()}</strong><span>{t('offers')} · {currentPartners} {t('partners')}</span></div></div></section>
    <main className="container" id="main"><div className="metric-bar"><div className="metric"><div><strong>{active.length}</strong><br/><span>{t('statsActive')}</span></div><BadgePercent size={25}/></div><div className="metric"><div><strong>{data.partners.length}</strong><br/><span>{t('statsBusiness')}</span></div><Building2 size={25}/></div><div className="metric"><div><strong>{CATEGORIES.length}</strong><br/><span>{t('statsCategories')}</span></div><Sparkles size={25}/></div></div>
    <div className="section-row"><div><span className="eyebrow">{t('discover')}</span><h2>{t('categories')}</h2><p className="small-copy section-desc">{t('categorySub')}</p></div><a className="text-link" href="#/explore">{t('viewAll')} <ArrowRight size={17}/></a></div>
    <div className="categories-grid">{CATEGORIES.map(cat=><a href={exploreUrl(undefined,cat.name)} className="category-tile" key={cat.name}><span className="category-glyph"><CategoryIcon name={cat.name}/></span><div><span className="category-label">{catLabel(cat.name,lang)}</span><span className="category-count">{counts.get(cat.name)} {t('offers')}</span></div><ChevronRight size={17}/></a>)}</div>
    <div className="section-row"><div><span className="eyebrow">{t('discover')}</span><h2>{t('highlights')}</h2><p className="small-copy section-desc">{t('highlightsSub')}</p></div><a className="text-link" href="#/explore">{t('viewAll')} <ArrowRight size={17}/></a></div><OfferGrid offers={picked} shared={shared}/>
    <div className="feature-note"><div><span className="eyebrow">{t('review')}</span><h3>{t('footerTitle')}</h3><p>{t('dataNote')}</p></div><a className="btn btn-dark" href="#/explore">{t('browseAll')}<ArrowRight size={17}/></a></div>
    </main></>;
}
function emiratesFor(o:Offer,branches:Branch[]):string[]{
  const raw=[o.emirate,o.area,o.address,...branches.filter(x=>x.partnerId===o.partnerId).map(x=>`${x.emirate||''} ${x.address||''}`)].filter(Boolean).join(' ').toLowerCase();
  return ['Sharjah','Dubai','Abu Dhabi','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain'].filter(n=>raw.includes(n.toLowerCase()));
}

function FilterSelect({label,field,value,values,placeholder,onChange}:{label:string;field:string;value:string;values:{value:string;label:string}[];placeholder:string;onChange:(v:string)=>void}){
  return <div className="filter-section"><label className="filter-heading" htmlFor={`filter-${field}`}>{label}</label><select id={`filter-${field}`} value={value} onChange={(e:{target:{value:string}})=>onChange(e.target.value)}><option value="">{placeholder}</option>{values.map(v=><option value={v.value} key={v.value}>{v.label}</option>)}</select></div>;
}

function Explore({shared,route}:{shared:Shared;route:Extract<Route,{page:'explore'}>}){
  const {data,lang,t}=shared;
  const [query,setQuery]=useState(route.query||'');
  const [category,setCategory]=useState(route.category||'');
  const [partner,setPartner]=useState('');const [emirate,setEmirate]=useState('');
  const [kind,setKind]=useState('');const [minDiscount,setMinDiscount]=useState('');
  const [status,setStatus]=useState('active');const [sort,setSort]=useState('relevant');
  const [mobileFilters,setMobileFilters]=useState(false);const [visible,setVisible]=useState(18);
  const partnerMap=useMemo(()=>new Map(data.partners.map(p=>[p.partnerId,p])),[data]);
  const types=useMemo(()=>[...new Set(data.offers.map(o=>o.benefitType).filter(Boolean))].sort(),[data]);
  const resetPage=()=>setVisible(18);
  useEffect(()=>{setQuery(route.query||'');setCategory(route.category||'');setVisible(18);},[route.query,route.category]);
  useEffect(()=>{if(!mobileFilters)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape')setMobileFilters(false)};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[mobileFilters]);
  const q=normalizeText(query);
  const results=useMemo(()=>{
    const ranked=data.offers.map(o=>({o,score:q?matchScore(o,partnerMap.get(o.partnerId),q):0}))
      .filter(({o,score})=>score>=0&&(!category||categoryOf(o.sector)===category)&&(!partner||o.partnerId===partner)&&(!kind||o.benefitType===kind)
         &&(!emirate||emiratesFor(o,data.locations).includes(emirate))&&(!minDiscount||(typeof o.discountMax==='number'&&o.discountMax>=Number(minDiscount)))
         &&(!status||statusOf(o)===status));
    ranked.sort((a,b)=>{
      if(sort==='discount')return (b.o.discountMax??-1)-(a.o.discountMax??-1)||a.o.name.localeCompare(b.o.name);
      if(sort==='ending')return (a.o.specificEnd||a.o.end||'9999').localeCompare(b.o.specificEnd||b.o.end||'9999');
      if(sort==='business')return a.o.name.localeCompare(b.o.name)||a.o.title.localeCompare(b.o.title);
      return b.score-a.score||(b.o.discountMax??-1)-(a.o.discountMax??-1);
    });return ranked.map(x=>x.o);
  },[data,q,category,partner,kind,emirate,minDiscount,status,sort,partnerMap]);
  const clearAll=()=>{setQuery('');setCategory('');setPartner('');setKind('');setEmirate('');setMinDiscount('');setStatus('active');setSort('relevant');resetPage();};
  const hasChanges=!!(query||category||partner||emirate||kind||minDiscount||status!=='active');
  const activeTokens=[category&&catLabel(category,lang),partner&&data.partners.find(p=>p.partnerId===partner)?.name,emirate,kind,minDiscount&&`${minDiscount}%+`,status&&status!=='active'&&t(status as Key)].filter(Boolean);
  const filterContents=<><div className="filters-head"><h2>{t('filters')}</h2><button type="button" className="text-link reset-button" onClick={clearAll}><RotateCcw size={14}/>{t('clear')}</button><button className="filter-mobile-close" type="button" onClick={()=>setMobileFilters(false)} aria-label={t('close')}><X size={20}/></button></div>
    <FilterSelect label={t('status')} field="status" value={status} onChange={v=>{setStatus(v);resetPage();}} placeholder={t('allStatuses')} values={(['active','upcoming','expired','undated'] as Status[]).map(s=>({value:s,label:t(s)}))}/>
    <FilterSelect label={t('category')} field="category" value={category} onChange={v=>{setCategory(v);resetPage();}} placeholder={t('allCategories')} values={CATEGORIES.map(c=>({value:c.name,label:catLabel(c.name,lang)}))}/>
    <FilterSelect label={t('business')} field="partner" value={partner} onChange={v=>{setPartner(v);resetPage();}} placeholder={t('allBusinesses')} values={[...data.partners].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>({value:p.partnerId,label:p.name}))}/>
    <FilterSelect label={t('location')} field="emirate" value={emirate} onChange={v=>{setEmirate(v);resetPage();}} placeholder={t('allLocations')} values={['Sharjah','Dubai','Abu Dhabi','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain'].map(e=>({value:e,label:e}))}/>
    <FilterSelect label={t('benefit')} field="kind" value={kind} onChange={v=>{setKind(v);resetPage();}} placeholder={t('allTypes')} values={types.map(value=>({value,label:value}))}/>
    <FilterSelect label={t('minDiscount')} field="minDiscount" value={minDiscount} onChange={v=>{setMinDiscount(v);resetPage();}} placeholder={t('allDiscounts')} values={[10,20,30,40,50,60,70].map(n=>({value:String(n),label:`${n}%+`}))}/>
    <button className="btn btn-dark filter-apply" type="button" onClick={()=>setMobileFilters(false)}>{t('apply')} · {results.length}</button>
  </>;
  return <main className="container" id="main"><PageHeading eyebrow={t('discover')} title={t('explore')} description={t('dataNote')}/>
    <div className="directory-controls explore-search-row"><label htmlFor="explore-search" className="search-inline"><Search size={19} aria-hidden="true"/><input id="explore-search" value={query} type="search" autoComplete="off" placeholder={t('searchPlaceholder')} onChange={(e:{target:{value:string}})=>{setQuery(e.target.value);resetPage();}}/>{query&&<button aria-label={t('clearSearch')} type="button" onClick={()=>setQuery('')}><X size={16}/></button>}</label></div>
    <div className="category-filters" aria-label={t('category')}><button className={`pill-filter ${!category?'active':''}`} onClick={()=>{setCategory('');resetPage();}} type="button">{t('allCategories')}</button>{CATEGORIES.map(c=><button className={`pill-filter ${category===c.name?'active':''}`} onClick={()=>{setCategory(c.name);resetPage();}} type="button" key={c.name}>{catLabel(c.name,lang)}</button>)}</div>
    <div className="explore-layout"><div className={`filter-backdrop ${mobileFilters?'active':''}`} role="presentation" onClick={()=>setMobileFilters(false)}/><aside className={`filters ${mobileFilters?'mobile-open':''}`} aria-label={t('filters')}>{filterContents}</aside>
      <section className="explore-results"><div className="toolbar"><div className="toolbar-left"><span className="count" aria-live="polite"><strong>{results.length}</strong> {t('results')}</span><button type="button" className="btn btn-sm mobile-filter-toggle" aria-expanded={mobileFilters} onClick={()=>setMobileFilters(true)}><SlidersHorizontal size={16}/>{t('filters')}{activeTokens.length>0&&` (${activeTokens.length})`}</button></div><div className="toolbar-right"><label className="sort-label" htmlFor="sort-by">{t('sort')}</label><select className="select-small" id="sort-by" value={sort} onChange={(e:{target:{value:string}})=>setSort(e.target.value)}><option value="relevant">{t('sortRelevant')}</option><option value="discount">{t('sortDiscount')}</option><option value="ending">{t('sortLatest')}</option><option value="business">{t('sortAlpha')}</option></select></div></div>
      {activeTokens.length>0&&<div className="filter-active">{activeTokens.map((token,i)=><span className="active-token" key={i}>{token}</span>)}<button className="text-link reset-button" onClick={clearAll} type="button">{t('clear')} <X size={14}/></button></div>}
      {results.length?<><OfferGrid offers={results.slice(0,visible)} shared={shared}/>{results.length>visible&&<div className="load-more-wrap"><button type="button" className="btn" onClick={()=>setVisible(n=>n+18)}>{t('showMore')} · {Math.min(18,results.length-visible)} <ChevronDown size={17}/></button></div>}</>:<EmptyState icon={Frown} title={t('emptyTitle')} description={t('emptySub')} action={hasChanges?t('clear'):undefined} link={undefined}/>}
      {results.length===0&&hasChanges&&<div className="empty-reset"><button type="button" className="btn btn-dark" onClick={clearAll}>{t('clear')} <RotateCcw size={15}/></button></div>}
      </section></div><div className="notice"><Info size={16}/><span>{t('dataNote')}</span></div>
    </main>;
}
function Directory({shared}:{shared:Shared}){
  const {data,lang,t}=shared;const [query,setQuery]=useState('');const [category,setCategory]=useState('');const [visible,setVisible]=useState(35);
  const counts=useMemo(()=>new Map(data.partners.map(p=>[p.partnerId,data.offers.filter(o=>o.partnerId===p.partnerId).length])),[data]);
  const results=useMemo(()=>data.partners.filter(p=>(!category||categoryOf(p.sector)===category)&&(!query||normalizeText(`${p.name} ${p.sector} ${p.description||''} ${p.originalTerms||''}`).includes(normalizeText(query)))).sort((a,b)=>a.name.localeCompare(b.name)),[data,query,category]);
  return <main id="main" className="container"><PageHeading eyebrow={t('discover')} title={t('businesses')} description={`${data.partners.length} ${t('partners')} · ${t('dataNote')}`}/>
    <div className="directory-controls"><label className="search-inline" htmlFor="directory-search"><Search size={18}/><input id="directory-search" type="search" value={query} placeholder={t('searchPlaceholder')} onChange={(e:{target:{value:string}})=>{setQuery(e.target.value);setVisible(35)}}/></label><label className="sr-only" htmlFor="directory-category">{t('category')}</label><select className="select-small" id="directory-category" value={category} onChange={(e:{target:{value:string}})=>{setCategory(e.target.value);setVisible(35);}}><option value="">{t('allCategories')}</option>{CATEGORIES.map(c=><option value={c.name} key={c.name}>{catLabel(c.name,lang)}</option>)}</select></div>
    <div className="directory-stats" aria-live="polite">{results.length} {t('businesses')}</div>
    {results.length?<><div className="directory-list">{results.slice(0,visible).map(p=><a key={p.partnerId} className="directory-row" href={partnerUrl(p.partnerId)}><div className="directory-icon">{p.name[0]?.toUpperCase()}</div><div className="directory-main"><strong dir="auto">{p.name}</strong><small>{catLabel(categoryOf(p.sector),lang)}</small></div><div className="directory-meta">{counts.get(p.partnerId)} {t('offers')}</div><ChevronRight size={17}/></a>)}</div>{results.length>visible&&<div className="load-more-wrap"><button type="button" className="btn" onClick={()=>setVisible(x=>x+35)}>{t('showMore')}<ChevronDown size={17}/></button></div>}</>:<EmptyState title={t('emptyTitle')} description={t('emptySub')}/>}
  </main>;
}
function Branches({branches,t}:{branches:Branch[];t:(k:Key)=>string}){
  if(!branches.length)return null;
  return <section className="detail-section"><h2>{t('branches')} <span className="small-count">({branches.length})</span></h2><div className="branch-list">{branches.map((b,i)=><div key={`${b.partnerId}-${i}`} className="branch"><div><strong className="branch-name" dir="auto">{b.branch||b.emirate||'Location'}</strong><span className="branch-address" dir="auto">{b.address||'Address not provided'}</span>{b.phone&&<a href={phoneHref(b.phone)} className="branch-phone"><Phone size={14}/>{b.phone}</a>}</div>{isSafeUrl(b.maps)&&<a className="text-link" href={isSafeUrl(b.maps)} target="_blank" rel="noopener noreferrer">{t('directions')}<ArrowUpRight size={16}/></a>}</div>)}</div></section>;
}
function PartnerContacts({partner:p,offer:o,t}:{partner:Partner;offer?:Offer;t:(k:Key)=>string}){
  const website=isSafeUrl(o?.website||p.website);const source=isSafeUrl(o?.sourceUrl||p.sourceUrl);const email=contactEmail(o||({} as Offer),p);const phone=o?.phone||p.phone;
  return <aside className="contact-panel"><span className="eyebrow">{t('contact')}</span><h2 dir="auto">{p.name}</h2><p>{t('contactSub')}</p>
    {phoneHref(phone)&&<a className="btn btn-dark" href={phoneHref(phone)}><Phone size={17}/>{t('call')}</a>}
    {website&&<a href={website} target="_blank" rel="noopener noreferrer" className="btn"><Globe size={17}/>{t('visit')}</a>}
    <div className="soft-divider"/>
    <ContactLink icon={Phone} href={phoneHref(phone)}>{phone}</ContactLink>
    <ContactLink icon={Mail} href={email?`mailto:${email}`:undefined}>{email}</ContactLink>
    {canWhatsApp(p)&&<ContactLink icon={MessageCircle} href={whatsappHref(phone)}>{t('whatsapp')}</ContactLink>}
    <ContactLink icon={Globe} href={website}>{website?new URL(website).hostname:undefined}</ContactLink>
    <ContactLink icon={ExternalLink} href={source}>{t('source')}</ContactLink>
    {p.contactPerson&&<div className="contact-person"><span className="muted-label">{t('contact')}</span><span dir="auto">{p.contactPerson}</span></div>}
    <p className="contact-disclaimer">{t('benefitDisclaimer')}</p>
  </aside>;
}
function ReviewNotices({o,p,flags,t}:{o?:Offer;p:Partner;flags:Database['reviewFlags'];t:(k:Key)=>string}){
  const relevant=flags.filter(f=>f.partnerId===p.partnerId || (f.partnerId?.startsWith('WAF-036') && p.sector==='Pharmacy'));
  const unconfirmed=o&&eligibilityUnconfirmed(o);
  return <>{unconfirmed&&<div className="caution-banner"><AlertCircle size={21}/><div><strong>{t('special')}</strong><p>{t('noteUnconfirmed')}</p></div></div>}
    {relevant.map((f,i)=><div className="caution-banner" key={i}><AlertCircle size={20}/><div><strong>{f.issue||t('review')}</strong><p dir="auto">{f.source_grounded_explanation}</p></div></div>)}
  </>;
}
function OfferDetail({shared,id}:{shared:Shared;id:string}){
  const {data,lang,t,compareIds,favoriteIds,onCompare,onFavorite,onToast}=shared;
  const o=data.offers.find(x=>x.id===id);const p=o?data.partners.find(x=>x.partnerId===o.partnerId):undefined;
  if(!o||!p)return <NotFound t={t}/>;
  const st=statusOf(o);const cat=categoryOf(o.sector);
  const source=isSafeUrl(o.sourceUrl||p.sourceUrl);const branchList=data.locations.filter(x=>x.partnerId===o.partnerId);
  const others=data.offers.filter(x=>x.partnerId===o.partnerId&&x.id!==o.id).slice(0,3);
  const saved=favoriteIds.includes(o.id);const compared=compareIds.includes(o.id);
  const attachment=sourceAttachment(p);const poster=partnerPoster(p);
  async function copyCode(){if(!o?.promoCode)return;try{await navigator.clipboard.writeText(o.promoCode);onToast(t('copied'));}catch{onToast(`${t('promo')}: ${o.promoCode}`)}}
  return <main className="container" id="main"><div className="breadcrumb"><a href="#/">{t('discover')}</a><ChevronRight size={14}/><a href={exploreUrl(undefined,cat)}>{catLabel(cat,lang)}</a><ChevronRight size={14}/><span>{t('details')}</span></div>
    <div className="detail-heading"><div className="detail-tags"><StatusBadge status={st} t={t}/><span className="chip">{catLabel(cat,lang)}</span>{eligibilityUnconfirmed(o)&&<span className="chip chip-warning">{t('review')}</span>}</div><h1 dir="auto">{o.title}</h1><a href={partnerUrl(p.partnerId)} className="detail-partner-link"><Building2 size={17}/><span dir="auto">{p.name}</span><ArrowUpRight size={15}/></a></div>
    <div className="detail-layout"><div className="detail-content">
      <div className="offer-detail-lead"><div className="detail-rate-line"><strong dir="auto">{benefitText(o)}</strong><span className="subtle">{o.benefitType}</span></div>
        {typeof o.offerPrice==='number'&&<div className="detail-price-row">{typeof o.originalPrice==='number'&&<span className="price-old">{money(o.originalPrice)}</span>}<span className="price-now">{money(o.offerPrice)}</span></div>}
        <p className="detail-subtext">{o.eligibility||t('dataNote')}</p>
        <div className="button-row"><button type="button" className={`btn ${saved?'btn-gold':'btn-dark'}`} onClick={()=>onFavorite(o.id)}><Heart size={17} fill={saved?'currentColor':'none'}/>{saved?t('saved'):t('save')}</button><button className="btn" onClick={()=>onCompare(o.id)} aria-pressed={compared}><GitCompareArrows size={16}/>{compared?t('removeCompare'):t('compareOffer')}</button></div></div>
      <ReviewNotices o={o} p={p} flags={data.reviewFlags} t={t}/>
      <section className="detail-section"><h2>{t('included')}</h2><div className="facts-grid">
        <Fact label={t('exactDate')} value={o.start||o.end?`${o.start?formatDate(o.start,lang==='ar'?'ar-AE':'en-AE'):'—'} — ${o.specificEnd?formatDate(o.specificEnd,lang==='ar'?'ar-AE':'en-AE'):formatDate(o.end,lang==='ar'?'ar-AE':'en-AE')}`:undefined}/>
        <Fact label={t('category')} value={catLabel(cat,lang)}/><Fact label={t('location')} value={[o.emirate,o.area,o.address].filter(Boolean).join(', ')||undefined}/>
        <Fact label={t('minimum')} value={typeof o.minSpend==='number'?money(o.minSpend):undefined}/>
        <Fact label={t('academic')} value={o.academicYear}/><Fact label={t('ageGrade')} value={o.ageGrade}/>
        <Fact label={t('season')} value={o.season}/><Fact label={t('verification')} value={o.evidence}/>
      </div></section>
      {(o.eligibility||o.redemption||o.channel||o.stacking||o.conditions||o.exclusions)&&<section className="detail-section"><h2>{t('details')}</h2><div className="detail-list"><DetailItem icon={Users} label={t('audience')} value={o.eligibility}/><DetailItem icon={CheckCircle2} label={t('redeem')} value={o.redemption}/><DetailItem icon={MapPin} label={t('channel')} value={o.channel}/><DetailItem icon={GitCompareArrows} label={t('stacking')} value={o.stacking}/><DetailItem icon={FileText} label={t('conditions')} value={o.conditions}/><DetailItem icon={AlertCircle} label={t('exclusions')} value={o.exclusions}/></div></section>}
      {o.promoCode&&<div className="redemption-code"><div><span className="muted-label">{t('promo')}</span><strong>{o.promoCode}</strong></div><button className="btn btn-sm" onClick={copyCode} type="button"><Copy size={15}/>{t('copy')}</button></div>}
      {p.originalTerms&&<section className="detail-section"><details className="details-accordion"><summary><span><FileText size={18}/>{t('original')}</span><ChevronDown size={18}/></summary><div className="original-terms"><p className="source-hint">{t('originalSub')}</p><p dir="auto" className="original-text">{p.originalTerms}</p>{source&&<a target="_blank" rel="noopener noreferrer" href={source} className="text-link">{t('source')}<ArrowUpRight size={16}/></a>}</div></details></section>}
      {p.description&&<section className="detail-section"><h2>{t('aboutOffer')}</h2><p dir="auto">{p.description}</p></section>}
      {poster&&<section className="detail-section"><h2>{t('sourceRecord')}</h2><a href={poster} target="_blank" rel="noopener noreferrer"><img className="poster-image" src={poster} alt={`Promotional artwork for ${p.name}`} loading="lazy"/></a><p className="poster-caption">{t('originalSub')}</p></section>}
      {attachment&&<section className="detail-section"><a className="btn" href={attachment} target="_blank" rel="noopener noreferrer"><FileText size={17}/>{t('terms')} (PDF) <ExternalLink size={15}/></a></section>}
      <Branches branches={branchList} t={t}/>
      {others.length>0&&<section className="related-section"><div className="section-row"><div><span className="eyebrow">{t('businesses')}</span><h2>{t('related')}</h2></div><a href={partnerUrl(p.partnerId)} className="text-link">{t('viewAll')}<ArrowRight size={16}/></a></div><OfferGrid offers={others} shared={shared}/></section>}
    </div><PartnerContacts partner={p} offer={o} t={t}/></div></main>;
}
function PartnerDetail({shared,id}:{shared:Shared;id:string}){
  const {data,lang,t}=shared;const p=data.partners.find(x=>x.partnerId===id);
  if(!p)return <NotFound t={t}/>;
  const offers=data.offers.filter(x=>x.partnerId===id);
  const branches=data.locations.filter(x=>x.partnerId===id);
  const poster=partnerPoster(p);const attachment=sourceAttachment(p);
  return <main className="container" id="main"><div className="breadcrumb"><a href="#/directory">{t('businesses')}</a><ChevronRight size={14}/><span>{t('partnerProfile')}</span></div>
    <div className="business-hero"><div className="directory-icon" aria-hidden="true">{p.name[0]?.toUpperCase()}</div><div><span className="eyebrow">{catLabel(categoryOf(p.sector),lang)}</span><h1 dir="auto">{p.name}</h1><p>{offers.length} {t('offers')} · {t('sourceDate')} 12 Nov 2026</p></div></div>
    <div className="detail-layout"><div className="detail-content">
      <ReviewNotices p={p} flags={data.reviewFlags} t={t}/>
      {p.description&&<section className="detail-section"><h2>{t('partnerProfile')}</h2><p className="business-desc" dir="auto">{p.description}</p></section>}
      {p.originalTerms&&<section className="detail-section"><h2>{t('original')}</h2><p className="original-text" dir="auto">{p.originalTerms}</p></section>}
      <section className="detail-section"><h2>{t('included')}</h2><div className="facts-grid"><Fact label={t('exactDate')} value={p.start&&p.end?`${formatDate(p.start)} — ${formatDate(p.end)}`:undefined}/><Fact label={t('value')} value={p.headlineRate}/><Fact label={t('contact')} value={p.contactPerson}/><Fact label={t('location')} value={p.address}/></div></section>
      {poster&&<section className="detail-section"><h2>{t('sourceRecord')}</h2><a target="_blank" rel="noopener noreferrer" href={poster}><img className="poster-image" src={poster} alt={`Original offer poster for ${p.name}`} loading="lazy"/></a></section>}
      {attachment&&<section className="detail-section"><a className="btn" href={attachment} target="_blank" rel="noopener noreferrer"><FileText size={17}/>{t('terms')} (PDF)<ExternalLink size={15}/></a></section>}
      <Branches branches={branches} t={t}/>
      <section className="related-section"><div className="section-row"><div><span className="eyebrow">{t('explore')}</span><h2>{t('allFromBusiness')} <span className="small-count">({offers.length})</span></h2></div></div><OfferGrid offers={offers} shared={shared}/></section>
    </div><PartnerContacts partner={p} t={t}/></div>
  </main>;
}
function Favorites({shared}:{shared:Shared}){
  const {data,t,favoriteIds}=shared;const offers=favoriteIds.map(id=>data.offers.find(x=>x.id===id)).filter((o):o is Offer=>!!o);
  return <main className="container" id="main"><PageHeading eyebrow={t('discover')} title={t('favorites')} description={t('noSavedSub')}/>
    {offers.length?<OfferGrid offers={offers} shared={shared}/>:<EmptyState icon={Heart} title={t('noSaved')} description={t('noSavedSub')} action={t('browseAll')} link="#/explore"/>}</main>;
}
function Compare({shared}:{shared:Shared}){
  const {data,t,compareIds,onCompare}=shared;const offers=compareIds.map(id=>data.offers.find(o=>o.id===id)).filter((x):x is Offer=>!!x);
  const rows:[string,(o:Offer)=>ReactNode][]=[
    [t('business'),o=>o.name], [t('value'),o=>benefitText(o)],
    [t('category'),o=>categoryOf(o.sector)],[t('status'),o=>t(statusOf(o))],
    [t('price'),o=>typeof o.offerPrice==='number'?money(o.offerPrice):'—'],
    [t('exactDate'),o=>o.start||o.end?`${o.start?formatDate(o.start):'—'} – ${formatDate(o.specificEnd||o.end)}`:'—'],
    [t('audience'),o=>o.eligibility||'—'],[t('redeem'),o=>o.redemption||'—'],
    [t('channel'),o=>o.channel||'—'],[t('conditions'),o=>o.conditions||'—'],
    [t('exclusions'),o=>o.exclusions||'—'],[t('stacking'),o=>o.stacking||'—']
  ];
  return <main className="container" id="main"><PageHeading eyebrow={t('comparisonDetails')} title={t('compareYour')} description={t('compareHint')}/>
    {offers.length>=2?<><div className="compare-table-wrap" role="region" aria-label={t('compareYour')} tabIndex={0}><table className="compare-table"><thead><tr><th scope="col">{t('field')}</th>{offers.map(o=><th key={o.id} scope="col"><strong dir="auto">{o.title}</strong><div className="button-row"><a className="text-link" href={offerUrl(o.id)}>{t('details')} <ArrowUpRight size={15}/></a><button type="button" className="compare-remove" onClick={()=>onCompare(o.id)}><X size={13}/>{t('remove')}</button></div></th>)}</tr></thead><tbody>{rows.map(([label,display])=><tr key={label}><th scope="row">{label}</th>{offers.map(o=><td key={o.id} dir="auto" className={label===t('value')?'highlight':''}>{display(o)}</td>)}</tr>)}</tbody></table></div><div className="notice"><Info size={16}/>{t('dataNote')}</div></>:<EmptyState icon={GitCompareArrows} title={t('compareEmpty')} description={t('noComparison')} action={t('browseAll')} link="#/explore"/>}
  </main>;
}
function NotFound({t}:{t:(k:Key)=>string}){return <main id="main" className="container"><div className="not-found"><Frown size={38}/><h1>{t('notFound')}</h1><a href="#/explore" className="btn btn-dark"><ArrowLeft size={17}/>{t('back')}</a></div></main>}
function Footer({data,t}:{data:Database;t:(k:Key)=>string}){
  return <footer className="site-footer"><div className="container footer-inner"><div><a href="#/" className="brand footer-brand"><span className="brand-icon">w.</span><span className="brand-type"><strong>waffer.</strong><small>OFFERS DISCOVERY</small></span></a><h3 className="footer-title">{t('footerTitle')}</h3><p className="footer-copy">{t('footerText')}</p></div><div><strong className="footer-column-title">{t('discover')}</strong><nav className="footer-links"><a href="#/explore">{t('allOffers')}</a><a href="#/directory">{t('businesses')}</a><a href="#/favorites">{t('favorites')}</a><a href="#/compare">{t('compare')}</a></nav></div><div><strong className="footer-column-title">{t('info')}</strong><p className="footer-copy">{t('dataNote')}</p><a className="footer-external" href="https://waffer.dhr.gov.ae/en" target="_blank" rel="noopener noreferrer">Waffer — official program <ArrowUpRight size={14}/></a></div></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Waffer Offers Discovery · Independent directory</span><span>{t('sourceDate')}: {data.meta.assembledOn} · {data.offers.length} {t('offers')}</span></div>
  </footer>;
}
function ComparisonTray({count,t,onClear}:{count:number;t:(k:Key)=>string;onClear:()=>void}){
  if(!count)return null;
  return <div className="compare-bar" role="status"><div><strong><GitCompareArrows size={17}/> {count}/3 {t('compareOffer')}</strong><p>{t('compareHint')}</p></div><div className="button-row"><button type="button" className="btn btn-sm" onClick={onClear}>{t('clear')}</button><a href="#/compare" className={`btn btn-dark btn-sm ${count<2?'disabled-link':''}`} aria-disabled={count<2} onClick={(e:{preventDefault:()=>void})=>{if(count<2)e.preventDefault();}}>{t('compareNow')} <ArrowRight size={16}/></a></div></div>;
}
function App(){
  const [data,setData]=useState<Database|null>(null);
  const [loadError,setLoadError]=useState<string|null>(null);
  const [reload,setReload]=useState(0);
  const [lang,setLang]=useState<Language>(()=>{try{return localStorage.getItem('waffer-language')==='ar'?'ar':'en'}catch{return'en'}});
  const [menuOpen,setMenuOpen]=useState(false);const [toast,setToast]=useState('');
  const route=useHashRoute();const t=useTranslation(lang);
  const favoriteStore=usePersistentIds('waffer-favorites-v1');const compareStore=usePersistentIds('waffer-compare-v1');
  useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';try{localStorage.setItem('waffer-language',lang)}catch{/* optional */}},[lang]);
  useEffect(()=>{let alive=true;setLoadError(null);fetch(`${import.meta.env.BASE_URL}data/offers.json`).then(res=>{if(!res.ok)throw Error(`HTTP ${res.status}`);return res.json();}).then((json:Database)=>{
      if(!validateDatabase(json))throw Error('Workbook records failed validation');if(alive)setData(json);
    }).catch(e=>{if(alive)setLoadError(String(e));});return()=>{alive=false};},[reload]);
  useEffect(()=>{if(data){const title=route.page==='offer'?data.offers.find(x=>x.id===route.id)?.title:route.page==='partner'?data.partners.find(x=>x.partnerId===route.id)?.name:route.page==='home'?'Discover':route.page;document.title=`${title||'Waffer Offers'} — Waffer Offers Discovery`;}},[route,data]);
  const onToast=useCallback((message:string)=>{setToast(message);},[]);
  useEffect(()=>{if(!toast)return;const timer=window.setTimeout(()=>setToast(''),2800);return()=>window.clearTimeout(timer);},[toast]);
  const favoriteIds=favoriteStore.items;const compareIds=compareStore.items;
  const onFavorite=(id:string)=>{favoriteStore.toggle(id);};
  const onCompare=(id:string)=>{if(!compareIds.includes(id)&&compareIds.length>=3){onToast(lang==='ar'?'يمكنك مقارنة ثلاثة عروض كحد أقصى.':'Compare up to three offers at a time.');return;}compareStore.toggle(id,3);};
  if(loadError)return <div className="fatal-state"><AlertCircle size={38}/><h1>{t('loadError')}</h1><p>{loadError}</p><button type="button" className="btn btn-dark" onClick={()=>setReload(x=>x+1)}>{t('retry')}</button></div>;
  if(!data)return <div className="loading-screen" role="status"><span className="loader-mark">w.</span><p>{t('loading')}</p></div>;
  const shared:Shared={data,lang,t,favoriteIds,compareIds,onFavorite,onCompare,onToast};
  return <div className="site-shell" onKeyDown={(e:{key:string})=>{if(e.key==='Escape')setMenuOpen(false)}}>
    <a className="skip-link" href="#main" onClick={(e:{preventDefault:()=>void})=>{e.preventDefault();const main=document.querySelector('main');if(main){main.setAttribute('tabindex','-1');main.focus();}}}>Skip to main content</a>
    <Header route={route} lang={lang} setLang={setLang} t={t} favoriteCount={favoriteIds.length} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
    {route.page==='home'?<Home shared={shared}/>:route.page==='explore'?<Explore shared={shared} route={route}/>:route.page==='offer'?<OfferDetail id={route.id} shared={shared}/>:route.page==='directory'?<Directory shared={shared}/>:route.page==='partner'?<PartnerDetail id={route.id} shared={shared}/>:route.page==='favorites'?<Favorites shared={shared}/>:route.page==='compare'?<Compare shared={shared}/>:<NotFound t={t}/>}
    <Footer data={data} t={t}/><ComparisonTray count={compareIds.length} t={t} onClear={()=>compareStore.setItems([])}/>
    <div aria-live="polite" className={toast?'toast showing':'toast'}>{toast&&<><CheckCircle2 size={17}/>{toast}</>}</div>
  </div>;
}
export default App;
