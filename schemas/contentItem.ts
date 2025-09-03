export type ContentBlock =
  | { type: "richText"; html: string }
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
  | { type: "listToolbar"; showingText?: string; sortOptions?: string[] };

export type ContentItem = {
  id: string;
  section: "explorer" | "academy";
  slug: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
  blocks: ContentBlock[];
  version?: number;
  updatedAt: string;
};
