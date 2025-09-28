export type ContentBlock =
  | { type: "richText"; content: string }
  | { type: "sectionHeader"; tagline?: string; title: string; html?: string }
  | {
      type: "cardGrid";
      cards: { title: string; text?: string; image?: string; href?: string }[];
    }
  | { type: "featureList"; items: { text: string }[] }
  | {
      type: "imageTextSplit";
      tagline?: string;
      html: string;
      image: string;
      imageAlt?: string;
      imageWidth?: number;
      imageHeight?: number;
      imagePosition?: "left" | "right";
    }
  | {
      type: "heroSlider";
      slides: {
        subTitle?: string;
        title: string;
        text?: string;
        buttonText?: string;
        buttonLink?: string;
      }[];
    }
  | {
      type: "sidebar";
      searchPlaceholder?: string;
      categories: { label: string; href: string; active?: boolean }[];
    }
  | { type: "listToolbar"; showingText?: string; sortOptions?: string[] }
  // Explorer Details specific blocks
  | {
      type: "propheticSayings";
      items: Array<{ quote: string; explanation: string; author?: string }>;
    }
  | {
      type: "scientificReflections";
      items: Array<{ quote: string; explanation: string; author?: string }>;
    }
  | {
      type: "kashmiriWisdom";
      items: Array<{ quote: string; explanation: string; author?: string }>;
    }
  | {
      type: "scholarlyDialogs";
      items: Array<{ quote: string; explanation: string; author?: string }>;
    }
  | { type: "coreConcept"; content: string }
  | { type: "keyConcepts"; concepts: string[] }
  | { type: "practicalApplications"; applications: string[] }
  | { type: "forNewStudents"; content: string }
  | { type: "forMaturePractitioners"; content: string };

export type ContentItem = {
  id: string;
  section: "explorer" | "academy" | "explorer-details" | "academy-details";
  slug: string;
  title: string;
  category?: string;
  subtitle?: string;
  parentPage?: string;
  cardTitle?: string;
  heroImage?: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
  blocks: ContentBlock[];
  version?: number;
  updatedAt: string;
};
