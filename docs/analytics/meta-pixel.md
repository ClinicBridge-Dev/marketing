# Main-site Meta measurement

Pixel: `1979462026345832`, shared with `campaign.clinicbridge.co.kr`.

The main site sends these browser events:

| Event | Trigger | Additional parameters |
| --- | --- | --- |
| `PageView` | Hydrated initial page and pathname changes | — |
| `ConsultClick` | Same-origin link to `/inquiry` | `placement`, `destination_path` |
| `InquiryStart` | First input change or service/country selection in the inquiry form per tab session | `form_id=inquiry`, `lead_type=consultation` |
| `ConsultationSubmit` | `/api/inquiry` responds HTTP success with `ok: true` and a string `inquiryId` | `form_id=inquiry`, `lead_type=consultation` |
| `DiagnosisSubmit` | `/api/diagnosis` responds HTTP success with `ok: true` | `form_id=diagnosis`, `lead_type=diagnosis` |

All events include `site_area=main`, `page_path`, `page_type`, and `schema_version=1.0`.
The four funnel events use `trackSingleCustom`; only `PageView` uses `trackSingle`.
No main-site `Lead` is emitted: the existing campaign uses `Lead` exclusively for report applications.
GA4, Google Ads, OpenAI tracking, campaign code, attribution settings, and ad optimization are unchanged.

## Scope and safeguards

- Next.js routes are covered by the shared client layout. Standalone `public/report.html` bypasses that layout and is not included. The inactive consultation/content-unlock modal is not instrumented.
- The SDK loads asynchronously after hydration. Events queue before it loads; SDK errors do not block forms/navigation.
- Only `clinicbridge.co.kr` and `www.clinicbridge.co.kr` enable tracking. Localhost and Vercel preview hostnames never load the SDK or queue events.
- Set `NEXT_PUBLIC_META_PIXEL_ENABLED=false` and rebuild/redeploy to disable. `NEXT_PUBLIC_META_PIXEL_ID` overrides the public default ID if needed.
- Same-path rerenders, query/hash changes, and StrictMode effect replays do not repeat PageView. Navigating away and back does.
- InquiryStart uses versioned sessionStorage with an in-memory fallback when storage is unavailable. Focus, next/previous buttons, hidden fields, honeypot, page load, and validation errors alone do not count as starting.
- Submissions are counted in API success handlers, not on `/inquiry/complete`. Both forms lock concurrent submissions. Real later submissions remain eligible; the main API's same-person/same-day inquiryId is deliberately not used for Meta deduplication.
- This release preserves the main API's existing success policy. It does not count server-rejected requests as successful submissions or introduce CAPI.
- Explicit event parameters contain no names, contact details, hospital details, diagnoses, scores, free text, query strings, or hashes. Advanced matching data is not supplied; `autoConfig` is disabled and `AutomaticMatching` is opted out before initialization. This site-level opt-out is needed because automatic matching is enabled on the shared dataset, and autoConfig alone does not disable its legacy matching plugin (confirmed in Meta's served fbevents.js). The shared dataset setting and campaign behavior are unchanged. The Meta SDK still processes its normal browser/device/cookie and page URL information; this is not a claim that SDK traffic contains only our custom parameters.

## Verification

Run `node --test tests/meta-pixel.test.cjs`, `npx tsc --noEmit`, and `npm run build`.
For browser tests, intercept all third-party tracking and form POST requests before navigating. Serve the local build under the production hostname using a browser-only routing override to exercise the hostname guard without sending live events. Check CTA placement, first interaction, invalid/failing/successful responses, repeated submissions, direct completion visits, route changes, and mobile navigation. Never submit dummy data to the production API or emit synthetic conversions to the live pixel.

Custom conversion/reporting configuration in Meta Events Manager is a separate account action. These custom events do not automatically replace the campaign's optimization event.

## Rollback

Revert the Meta tracking PR to restore baseline `92901e4d2efe71a794f8cf1b38561cc192b9c91e`, or disable via the public environment switch and redeploy. This change has no database migrations or API contract changes.
