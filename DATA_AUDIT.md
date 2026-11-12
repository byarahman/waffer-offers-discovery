# Data import audit

Workbook: `Waffer_Offers_Master_Database_2026-11-12(2).xlsx`  
Offers: **314**  
Partners: **104**  
Documented branch locations: **19**  
Source-register rows: **15**  
Review-flag rows: **14**

All offer IDs and partner IDs are unique; every offer/branch maps to an existing partner.

## Offers by sector

| Sector | Entries |
|---|---:|
| Healthcare | 57 |
| Entertainment | 50 |
| Hotels & Hospitality | 39 |
| Pharmacy | 35 |
| Travel & Tourism | 31 |
| Education & Training | 28 |
| Automotive | 26 |
| Food & Dining | 10 |
| Home & Furnishings | 9 |
| Sports & Fitness | 5 |
| Food & Beverages | 5 |
| Electronics & Tech | 4 |
| Construction & Design | 4 |
| Telecommunications | 3 |
| Technology & IT | 2 |
| Beauty & Wellness | 2 |
| Banking & Finance | 1 |
| Online Shopping | 1 |
| Professional Services | 1 |
| Retail & Lifestyle | 1 |

## Data handling

- Original Waffer offer wording is retained unabridged at partner level.
- Individual benefits retain their own conditions, dates, discount bands, amounts, exclusions, and source references.
- Spreadsheet formula caches are intentionally excluded; date-based statuses are calculated in the browser.
- No missing prices or terms are imputed.
- Public URLs are validated before constructing clickable links.
- User-supplied documents have not been independently revalidated against the providers.
