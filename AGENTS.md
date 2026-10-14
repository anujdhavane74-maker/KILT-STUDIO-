## Project architecture
- Keep the studio website as one content route with hash-linked semantic sections; this preserves the requested single-page experience.
- Keep verified contact, portrait and social details centralized in `src/lib/studio-config.ts`; empty settings must never fabricate delivery or profile links.
- Validate enquiries before preparing client-side mailto/WhatsApp links; only the external app sends, so UI must never claim submission.
- Define visual tokens and reusable studio styles in `src/styles.css` and use Button variants for controls; this maintains a consistent identity.
- Use controlled Radix full-screen dialogs for portfolio concepts with focus trapping and return-to-trigger; this keeps case studies inside the single-page experience.
- Keep the custom wordmark as inline vector geometry with currentColor and no background; this stays crisp and transparent in every placement.
