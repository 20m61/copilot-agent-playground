# GitHub Copilot Agent Playground - Next.js App

This is a [Next.js](https://nextjs.org) project created as the foundation for serverless deployment within the GitHub Copilot Agent Mode Playground.

## Features

- **Next.js 15** with App Router
- **TypeScript** configuration 
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **API routes** for serverless functions
- **Vercel** deployment optimization

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── api/
│   │   ├── hello/
│   │   │   └── route.ts      # Hello API endpoint
│   │   └── status/
│   │       └── route.ts      # Status API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
└── components/
    └── Navigation.tsx        # Navigation component
```

## API Routes

- `GET /api/hello` - Returns a greeting message
- `POST /api/hello` - Accepts JSON data and returns confirmation
- `GET /api/status` - Returns application health status

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Serverless Deployment

This project is optimized for serverless deployment on Vercel:

- Standalone output configuration
- API routes configured as serverless functions
- Optimized build settings
- Vercel deployment configuration

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
