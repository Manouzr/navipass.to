<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into NaviPass. The integration covers the full customer journey — from plan selection and checkout through payment confirmation, order tracking, profil authentication, and credential management. Both client-side and server-side events are captured, users are identified on login, and error tracking is enabled via `capture_exceptions`.

**Infrastructure changes:**
- `instrumentation-client.ts` — Updated to use the `/ingest` reverse proxy, enable `capture_exceptions` for error tracking, and set `defaults: '2026-01-30'`
- `next.config.js` — Added PostHog reverse proxy rewrites (`/ingest/*` → `us.i.posthog.com`) and `skipTrailingSlashRedirect: true`
- `.env.local` — Updated `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` with correct values

| Event | Description | File |
|---|---|---|
| `order_plan_selected` | User selected a plan and continued to step 2 | `src/components/OrderForm.tsx` |
| `order_checkout_initiated` | User submitted the checkout form (redirecting to Stripe) | `src/components/OrderForm.tsx` |
| `payment_completed` | Stripe webhook confirmed a successful payment | `src/app/api/webhooks/stripe/route.ts` |
| `account_issue_reported` | User reported a problem with their delivered account | `src/app/api/report-issue/route.ts` |
| `magic_link_requested` | User submitted the order tracking form to receive a magic link | `src/app/suivi/page.tsx` |
| `magic_link_sent` | Server confirmed sending the magic link email | `src/app/api/magic-link/route.ts` |
| `profil_login_submitted` | User submitted the profil login form (with `posthog.identify()`) | `src/components/ProfilLoginPage.tsx` |
| `profil_authenticated` | Server authenticated the user into their profil space (with server-side identify) | `src/app/api/profil-auth/route.ts` |
| `credentials_unlock_requested` | User requested an OTP code to unlock IDF Mobilités credentials | `src/components/ProfilDashboard.tsx` |
| `credentials_unlocked` | User successfully verified OTP and unlocked their credentials | `src/components/ProfilDashboard.tsx` |
| `user_logged_out` | User clicked logout (with `posthog.reset()`) | `src/components/ProfilDashboard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/369890/dashboard/1432564
- **Purchase conversion funnel** (plan selected → checkout → payment): https://us.posthog.com/project/369890/insights/Lw3j7iLq
- **Payments completed per day**: https://us.posthog.com/project/369890/insights/b6CFrjRx
- **Account issue reports (churn signal)**: https://us.posthog.com/project/369890/insights/tN4drHks
- **Order tracking funnel (magic link)**: https://us.posthog.com/project/369890/insights/44YNZKN9
- **Credentials unlock conversion**: https://us.posthog.com/project/369890/insights/fMYbRUlK

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
