# kakeibo-app

Next.js TypeScript sample project for a household budgeting app.
## How to run
1. Install dependencies:
   ```
   npm install
   ```
2. Run dev server:
   ```
   npm run dev
   ```
3. Open http://localhost:3000

Notes:
- Uses Tailwind CSS (you may need to run `npx tailwindcss init -p` if you change versions).
- This project includes Recharts and Framer Motion; run `npm install` to fetch them.
- React Strict Mode is enabled in development (`npm run dev`) only.
- Some effects may run twice in dev, but this does not happen in production.
- **This behavior does NOT occur in production builds** (`npm run build` / `npm run start`).
