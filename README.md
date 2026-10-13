# KILT STUDIO

Original, one-page studio website. No backend submission, analytics, fake clients or testimonials. Not published.

## Configuration

Edit `src/lib/studio-config.ts` to add verified details:

- **Email:** set `email` to the real studio inbox. After validation, the visitor can open a prefilled email; they must send it in their email app.
- **WhatsApp:** set `whatsapp` to international digits only, without `+`, spaces or punctuation. The visitor opens a prefilled WhatsApp message and sends it there.
- With both empty, the form explicitly says nothing is sent or stored. Visitors can prepare and copy their enquiry. No submission success is fabricated.
- **Portraits:** first supplied image = Krishna, second = Anuj. No uploads were available at creation, so letter-based placeholders are shown. Add photos as `public/images/krishna.jpg` and `public/images/anuj.jpg`, then set portrait URLs to `/images/krishna.jpg` and `/images/anuj.jpg`. For Lovable uploads, externalize with `lovable-assets` and use the returned pointer URL. Portraits are cropped with object-fit but no skin-tone alteration or filters.
- **Socials:** add real absolute Instagram/LinkedIn profile URLs under `socials`. Empty values show “Social links coming soon”, not dead or invented links.
- Budget choices are enquiry preferences, not advertised prices or quotations. Timelines are agreed after scoping.

The four portfolio mockups are fictional, self-initiated concepts, clearly labeled as such. Replace with verified work only when available. Typography uses Barlow Condensed and Manrope; the abstract sculpture is original generated artwork. The CSS has visible keyboard focus and respects reduced motion. All page navigation is within the single page.

## Checks

Run `bunx vitest run` for validation and route tests. Contact configuration never sends automatically; no credentials or backend are required.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

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
