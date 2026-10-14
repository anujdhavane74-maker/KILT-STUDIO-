# KILT STUDIO

Original, one-page studio website. No backend submission, analytics, fake clients or testimonials. Not published.

## Configuration

Edit `src/lib/studio-config.ts` to add verified details:

- **Email:** set `email` to the real studio inbox. After validation, the visitor can open a prefilled email; they must send it in their email app.
- **WhatsApp:** set `whatsapp` to international digits only, without `+`, spaces or punctuation. The visitor opens a prefilled WhatsApp message and sends it there.
- With both empty, the form explicitly says nothing is sent or stored. Visitors can prepare and copy their enquiry. No submission success is fabricated.
- **Portraits:** first supplied image = Krishna, second = Anuj, third = Amit. Add photos as `public/images/krishna.jpg`, `public/images/anuj.jpg`, and `public/images/amit.jpg`, then set portrait URLs in `src/lib/studio-config.ts`. Portraits are cropped with object-fit but no skin-tone alteration or filters.
- **Socials:** add real absolute Instagram/LinkedIn profile URLs under `socials`. Empty values show “Social links coming soon”, not dead or invented links.
- Budget choices are enquiry preferences, not advertised prices or quotations. Timelines are agreed after scoping.

The four portfolio mockups are fictional, self-initiated concepts, clearly labeled as such. Replace with verified work only when available. Typography uses Barlow Condensed and Manrope; the abstract sculpture is original generated artwork. The CSS has visible keyboard focus and respects reduced motion. All page navigation is within the single page.

## Checks

Portfolio cards open accessible full-screen demo mini-sites (Escape or Back to portfolio closes them). Fictional menu/collection buttons scroll to their preview content; the project CTA closes the preview and opens KILT’s enquiry section. Images in these concepts and the social showcase are generated illustrations, never evidence of real clients or campaigns. The custom wordmark uses transparent vector geometry. The studio accent and dark background were sampled from the live Outskill page: #B8EF43 and #08090A; its imagery and branding were not reused. Founder uploads remain inaccessible; attach Anuj, Krishna, and Amit photos to add them.

Run `bunx vitest run` for validation and route tests. Contact configuration never sends automatically; no credentials or backend are required.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
