import cafe from "@/assets/concept-cafe.jpg";
import restaurant from "@/assets/concept-restaurant.jpg";
import retail from "@/assets/concept-retail.jpg";
import estate from "@/assets/concept-estate.jpg";
import morrowBeanPreview from "@/assets/morrow-bean-preview.jpg";

export const PORTFOLIO_CATEGORIES = [
  "Café & Hospitality",
  "Real Estate",
  "Retail & E-commerce",
  "Business Websites",
  "Social Media & Video",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export interface PortfolioProject {
  id: string;
  title: string;
  category: PortfolioCategory;
  displayCategory: string;
  projectType: string;
  description: string;
  previewImage: string;
  backdropImage?: string;
  liveUrl?: string;
  status: string;
  ctaLabel: string;
  descriptor: string;
  browserUrl?: string;
  badgeText?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "cafe",
    title: "MORROW & BEAN",
    category: "Café & Hospitality",
    displayCategory: "Café Website",
    projectType: "Website Design & Development",
    liveUrl: "https://morrow-bean-cafe.vercel.app/",
    description:
      "A premium café website concept featuring editorial typography, warm visual design, specialty coffee imagery, and a responsive customer experience.",
    status: "Live Concept Project",
    ctaLabel: "View Live Website",
    descriptor: "Café Website · Website Design & Development",
    previewImage: morrowBeanPreview,
    backdropImage: morrowBeanPreview,
    browserUrl: "morrow-bean-cafe.vercel.app",
    badgeText: "Live Concept Project",
  },
  {
    id: "restaurant",
    title: "The restaurant concept",
    category: "Café & Hospitality",
    displayCategory: "Restaurant",
    projectType: "Web design · Social direction",
    description:
      "Big flavours. Better company. An expressive restaurant concept with a generous helping of personality.",
    status: "Demo Concept",
    ctaLabel: "Explore Concept",
    descriptor: "Web design · Social direction",
    previewImage: restaurant,
    backdropImage: restaurant,
    browserUrl: "Demo concept · KILT STUDIO",
    badgeText: "Concept project",
  },
  {
    id: "retail",
    title: "The retail concept",
    category: "Retail & E-commerce",
    displayCategory: "Retail",
    projectType: "Web design · Visual identity",
    description:
      "Everyday things. Unordinary energy. A local retail concept for people who make their own rules.",
    status: "Demo Concept",
    ctaLabel: "Explore Concept",
    descriptor: "Web design · Visual identity",
    previewImage: retail,
    backdropImage: retail,
    browserUrl: "Demo concept · KILT STUDIO",
    badgeText: "Concept project",
  },
  {
    id: "estate",
    title: "The real estate concept",
    category: "Real Estate",
    displayCategory: "Real estate",
    projectType: "Web design · Digital experience",
    description:
      "Thoughtful spaces. New perspectives. A residential property concept that puts the feeling of home first.",
    status: "Demo Concept",
    ctaLabel: "Explore Concept",
    descriptor: "Web design · Digital experience",
    previewImage: estate,
    backdropImage: estate,
    browserUrl: "Demo concept · KILT STUDIO",
    badgeText: "Concept project",
  },
];

export const conceptDetails = {
  cafe: {
    brand: "MORROW & BEAN",
    image: cafe,
    alt: "MORROW & BEAN specialty coffee showcase",
    headline: "A slower kind of everyday.",
    intro:
      "A premium café website concept featuring editorial typography, warm visual design, specialty coffee imagery, and a responsive customer experience.",
    section: "Coffee, slow mornings & good company.",
    story:
      "An inviting digital home for a modern neighbourhood coffee ritual. Warm photography, editorial typography, and a seamless path from discovery to a visit.",
    action: "View live website",
    items: ["Specialty Coffee Ritual", "Fresh from the Oven", "A Corner to Call Yours"],
    descriptions: [
      "Thoughtfully brewed coffee from origin-focused roasters.",
      "Simple pastries made for an unhurried morning.",
      "Space for a conversation, a book or a moment to yourself.",
    ],
  },
  restaurant: {
    brand: "HOT TAKE",
    image: restaurant,
    alt: "Illustrative artisan pizza campaign photograph",
    headline: "GOOD FOOD. ZERO FILTER.",
    intro:
      "Big flavours. Better company. An expressive restaurant concept with a generous helping of personality.",
    section: "COME HUNGRY.",
    story:
      "A bold, food-first experience. Punchy typography and close-up imagery turn the menu into the main event, with a clear route to planning a meal together.",
    action: "Meet the menu",
    items: ["Fresh off the fire", "Made for sharing", "Save room"],
    descriptions: [
      "Blistered crust, bright tomato and fresh basil.",
      "Bring the table together with big, generous flavours.",
      "One last bite worth staying for.",
    ],
  },
  retail: {
    brand: "OFFBEAT",
    image: retail,
    alt: "Illustrative canvas tote and charcoal tee product campaign",
    headline: "NOT FOR EVERYONE. JUST YOU.",
    intro:
      "Everyday things. Unordinary energy. A local retail concept for people who make their own rules.",
    section: "YOUR EVERYDAY, REMIXED.",
    story:
      "A product-led concept that gives an independent shop a distinctive voice. Strong visual direction, considered collections and details that let the products speak.",
    action: "Explore the collection",
    items: ["Carry your own way", "The everyday uniform", "Less, but better"],
    descriptions: [
      "A clean canvas tote for whatever the day brings.",
      "A heavyweight tee with a quiet kind of confidence.",
      "Useful essentials, thoughtfully selected.",
    ],
  },
  estate: {
    brand: "FORM & SPACE",
    image: estate,
    alt: "Illustrative modern residential courtyard with tropical plants",
    headline: "Room for what’s next.",
    intro:
      "Thoughtful spaces. New perspectives. A residential property concept that puts the feeling of home first.",
    section: "A NEW PERSPECTIVE ON HOME.",
    story:
      "A serene architecture-led experience for a real estate team. Immersive photography and a clear visual hierarchy make exploring a space feel personal, not transactional.",
    action: "Explore the spaces",
    items: ["Light, naturally", "Space to breathe", "Life, connected"],
    descriptions: [
      "Generous windows and thoughtful open spaces.",
      "Courtyards that make room for nature.",
      "A considered balance of privacy and shared space.",
    ],
  },
};
export type ConceptId = keyof typeof conceptDetails;
