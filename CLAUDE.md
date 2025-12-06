# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster MiniApp template built with Next.js 16, OnchainKit, and the Farcaster SDK. It serves as a blank dApp template for building Web3 applications that can be published to the Base app and Farcaster ecosystem.

**Key Technologies:**

- Next.js 16.0.1 (App Router)
- OnchainKit (Coinbase's Web3 toolkit)
- Farcaster MiniApp SDK
- Wagmi & Viem for Web3 interactions
- TanStack React Query for state management
- TypeScript

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
# Uses --webpack flag for Docker/Daytona compatibility with file polling
npm run dev

# Build for production
# Uses --webpack flag for consistent build process
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

## Environment Variables

Required environment variables (create `.env.local`):

```bash
NEXT_PUBLIC_PROJECT_NAME="Your App Name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<CDP-API-KEY>
NEXT_PUBLIC_URL=<production-url>  # Leave empty for local dev
```

- Get CDP API Key from: https://portal.cdp.coinbase.com/
- `NEXT_PUBLIC_URL` should be your Vercel deployment URL in production

## Architecture

### Configuration & Manifest System

**`minikit.config.ts`** - Central configuration for Farcaster MiniApp manifest

- Defines app metadata (name, description, icons, screenshots)
- Configures `accountAssociation` for Farcaster verification (initially empty)
- Used by `app/.well-known/farcaster.json/route.ts` to generate the manifest endpoint
- Must follow Farcaster MiniApp specification

**Manifest Flow:**

1. `minikit.config.ts` exports config object
2. `app/.well-known/farcaster.json/route.ts` uses `withValidManifest()` to validate and serve manifest
3. `app/layout.tsx` uses config for metadata and OpenGraph tags
4. Farcaster reads manifest from `/.well-known/farcaster.json` endpoint

### Provider Architecture

**Root Provider (`app/rootProvider.tsx`):**

- Client-side only ("use client")
- Wraps entire app in `OnchainKitProvider`
- Configures chain (Base), wallet display, and MiniKit settings
- Enables MiniKit with `autoConnect: true` for Farcaster integration

**Layout Structure (`app/layout.tsx`):**

- Server component that generates dynamic metadata from `minikit.config.ts`
- Embeds Farcaster frame metadata in `fc:frame` meta tag for cast embeds
- Includes `SafeArea` component for mobile safe area handling
- Contains **required** `FloatingBanner` component (Vibe3 attribution - do not remove)

### Authentication Flow

**API Route: `app/api/auth/route.ts`**

- Uses `@farcaster/quick-auth` for JWT verification
- Verifies Bearer tokens from Farcaster MiniApp SDK
- `getUrlHost()` helper handles domain detection across environments (Vercel/local)
- Returns user's Farcaster ID (FID) from verified JWT payload
- Critical for authenticating users in Farcaster MiniApps

### Next.js Configuration

**`next.config.ts`:**

- **Docker/Daytona Compatibility:**
  - `turbopack: {}` - Empty config allows webpack to coexist (DO NOT REMOVE)
  - `devIndicators: false` - Disables dev overlay indicators
  - Webpack polling with `watchOptions` (1s interval) for file watching in containerized environments
- **MiniKit Externals:**
  - Externalizes `pino-pretty`, `lokijs`, `encoding` packages
  - Required for proper Web3 library compatibility
- **Usage:** All dev/build commands use `--webpack` flag explicitly (requires Next.js 16+)

**`tsconfig.json`:**

- Path alias: `@/*` maps to project root
- Target: ES2017 (required for Farcaster SDK compatibility)
- Uses Next.js TypeScript plugin

## Deployment Workflow

### Initial Deployment

1. Deploy to Vercel: `vercel --prod`
2. Update `.env.local` with production URL
3. Upload environment variables to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_PROJECT_NAME production
   vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
   vercel env add NEXT_PUBLIC_URL production
   ```

### Account Association (Required for Farcaster)

1. Visit https://farcaster.xyz/~/developers/mini-apps/manifest
2. Enter your domain (e.g., `your-app.vercel.app`)
3. Generate and sign account association with Farcaster wallet
4. Copy the `accountAssociation` object to `minikit.config.ts`
5. Redeploy: `vercel --prod`

### Validation

- Preview app at: https://base.dev/preview
- Validate manifest, metadata, and account association
- Test launching the app before publishing to Farcaster

## Project Structure

```
app/
├── api/
│   └── auth/route.ts          # Farcaster JWT verification endpoint
├── .well-known/
│   └── farcaster.json/route.ts  # Manifest endpoint
├── components/
│   └── branding/
│       └── floating-banner.tsx  # Required Vibe3 attribution
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Main landing page (blank template)
├── rootProvider.tsx           # OnchainKit provider setup
└── globals.css               # Global styles

minikit.config.ts             # Farcaster MiniApp configuration
next.config.ts                # Next.js webpack config
```

## Important Notes

### Required Components

- **FloatingBanner** in `app/layout.tsx` must not be removed (Vibe3 attribution requirement)

### MiniKit Integration

- MiniKit is auto-enabled in `rootProvider.tsx` with `autoConnect: true`
- This allows automatic wallet connection within Farcaster apps
- The `SafeArea` component handles mobile notch/status bar spacing

### Manifest Updates

- Any changes to app metadata should be made in `minikit.config.ts`
- After updating manifest, always redeploy and revalidate at base.dev/preview
- Account association signature must match your deployed domain

### Web3 Configuration

- Default chain is Base (imported from wagmi/chains)
- OnchainKit handles wallet connection UI automatically
- Wallet display is set to "modal" mode with "all" wallets preference

## Publishing

To publish your MiniApp to Farcaster:

1. Ensure account association is configured and deployed
2. Create a post in the Base app containing your app's URL
3. The app will be embedded as a frame with launch button

## Documentation References

- Farcaster MiniApp Spec: https://miniapps.farcaster.xyz/docs/guides/publishing
- OnchainKit Docs: https://onchainkit.xyz
- Base MiniApp Tutorial: https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/
