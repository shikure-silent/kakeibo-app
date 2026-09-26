# kakeibo-app

Next.js TypeScript sample project for a household budgeting app.
## How to run
1. Install dependencies:
   ```
   npm install
   ```
2. Run the development server:
   ```
   npm run dev
   ```
3. Open http://localhost:3000

## Production build

This app is a static export for Capacitor. Generate the production files with
`npm run build`, then serve the generated `out` directory locally with:

```
npm run start
```

Deploy the contents of `out` to static hosting. Server-side Next.js route
handlers are not included in this static export.

## Notes

- Uses Tailwind CSS (you may need to run `npx tailwindcss init -p` if you change versions).
- This project includes Recharts and Framer Motion; run `npm install` to fetch them.
- React Strict Mode is enabled in development (`npm run dev`) only.
- Some effects may run twice in dev, but this does not happen in production.
- **This behavior does NOT occur in production builds**.
