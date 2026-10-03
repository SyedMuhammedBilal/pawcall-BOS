# pawcall 6-month cost and pricing model

Assumption: `pawcall` starts as an open-source CLI. Hosting only becomes relevant if it later adds a hosted CSV upload, scheduled reminder lists, or clinic account management.

## 6-month hosted-cost estimate

| Cost area | Months 1-2 | Months 3-4 | Months 5-6 | Notes |
|---|---:|---:|---:|---|
| App hosting | $25/mo | $50/mo | $100/mo | Small Node app/API plus background jobs |
| Database | $0-$25/mo | $25/mo | $50/mo | Clinic accounts, runs, saved mappings |
| File storage | $5/mo | $10/mo | $25/mo | Temporary CSV uploads, exports |
| Email/SMS reminders | $0 | $50/mo | $150/mo | Only if hosted product sends reminders later |
| Monitoring/logging | $0-$20/mo | $20/mo | $50/mo | Error tracking and audit logs |
| Domain/security/misc | $20/mo | $20/mo | $20/mo | Domain, transactional provider overhead |

Estimated 6-month infrastructure range: **$450-$1,500** before paid messaging volume.

## Pricing options if hosted later

| Plan | Price | Fit | Included usage |
|---|---:|---|---|
| Free CLI | $0 | Open-source adoption | Local CSV processing only |
| Hosted Starter | $19/mo/clinic | Small clinics that want saved mappings and browser upload | 2 users, 200 appointments/month |
| Hosted Practice | $49/mo/clinic | Clinics that want scheduled exports and history | 1,000 appointments/month |
| Hosted Plus | $99/mo/clinic | Multi-location or higher-volume teams | 5,000 appointments/month, priority support |

## Recommendation

Keep the CLI free and open source this week. If demand appears, launch hosted pricing at **$19/mo Starter** and **$49/mo Practice**, with SMS/voice reminder sending as a later paid add-on rather than included in the first hosted version.
