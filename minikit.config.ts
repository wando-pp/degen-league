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
    name: "DegenLeague MiniApp",
    subtitle: "A degen football fantasy league",
    description:
      "Buy or Rent fantasy football players as NFTs and compete with friends to win prizes!",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `https://res.cloudinary.com/dwf6iuvbh/image/upload/v1765059359/Gemini_Generated_Image_458bgr458bgr458b_o9z0y2.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `https://res.cloudinary.com/dwf6iuvbh/image/upload/v1765059359/Gemini_Generated_Image_458bgr458bgr458b_o9z0y2.png`,
    tagline: "Build Web3 apps with ease",
    ogTitle: "DegenLeague MiniApp",
    ogDescription:
      "Buy or Rent fantasy football players as NFTs and compete with friends to win prizes!",
    ogImageUrl: `https://res.cloudinary.com/dwf6iuvbh/image/upload/v1765059359/Gemini_Generated_Image_458bgr458bgr458b_o9z0y2.png`,
  },
} as const;
