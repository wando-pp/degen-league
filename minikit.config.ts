const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Web3 App Template",
    subtitle: "Next.js Web3 dApp Template",
    description:
      "A modern Web3 application template with Wagmi, Viem, and shadcn/ui",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Build Web3 apps with ease",
    ogTitle: "Web3 App Template - Farcaster MiniApp",
    ogDescription:
      "A modern Web3 application template with Wagmi, Viem, and shadcn/ui",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
