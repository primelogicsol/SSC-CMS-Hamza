"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Banner from "../../../components/sections/home3/Banner";
import Features from "../../../components/sections/home3/Features";
import Image from "next/image";
import CircularLoader from "../../../components/CircularLoader";
import axios from "axios";
import Link from "next/link";

type Slide = {
  subTitle?: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
};

type Block =
  | { type: "heroSlider"; slides: Slide[] }
  | { type: "featureList"; items: { text: string }[] }
  | { type: "richText"; html: string }
  | {
      type: "cardGrid";
      cards: { title: string; text?: string; image?: string; href?: string }[];
    }
  | { type: "sectionHeader"; tagline?: string; title: string; html?: string }
  | {
      type: "imageTextSplit";
      tagline?: string;
      html: string;
      image: string;
      imageAlt?: string;
      imageWidth?: number;
      imageHeight?: number;
      imagePosition?: "left" | "right";
    };

type ContentItem = {
  section: "explorer";
  slug: string;
  title: string;
  blocks: Block[];
};

function placeholderSrc(width: number, height: number): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    `<rect width='100%' height='100%' fill='%23e5e7eb'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'>${width}x${height}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function SectionHeader({
  block,
}: {
  block: Extract<Block, { type: "sectionHeader" }>;
}) {
  return (
    <div className="text-left ">
      {block.tagline && (
        <span className="relative inline-block text-sm sm:text-base md:text-lg text-fixnix-lightpurple font-bold uppercase z-[1]">
          {block.tagline}
          <span className="absolute top-[10px] left-[-50px] w-[35px] sm:w-[45px] h-[2px] bg-fixnix-lightpurple"></span>
        </span>
      )}
      <h2 className="text-fixnix-darkpurple font-bold text-2xl py-2">
        {block.title}
      </h2>
      {block.html && (
        <div
          className="text-gray-700 mt-2"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === "heroSlider")
    return <Banner slides={(block as any).slides} />;
  if (block.type === "featureList")
    return (
      <Features title="Why This Matters?" features={(block as any).items} />
    );
  if (block.type === "sectionHeader")
    return <SectionHeader block={block as any} />;
  if (block.type === "imageTextSplit") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-56 mb-11 items-center">
        <div>
          <div className="text-left ">
            {block.tagline && (
              <span className="relative inline-block text-sm sm:text-base md:text-lg text-fixnix-lightpurple font-bold uppercase z-[1]">
                {block.tagline}
                <span className="absolute top-[10px] left-[-50px] w-[35px] sm:w-[45px] h-[2px] bg-fixnix-lightpurple"></span>
              </span>
            )}
          </div>
          <div
            className="text-gray-700 mt-4"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </div>
        <div className="relative">
          <div className="rounded-lg overflow-hidden w-[350px] h-[350px]  bg-fixnix-lightpurple">
            <Image
              src={
                block.image ||
                placeholderSrc(
                  block.imageWidth || 350,
                  block.imageHeight || 350
                )
              }
              alt={block.imageAlt || "image"}
              width={block.imageWidth || 350}
              height={block.imageHeight || 350}
              className="w-[350px] h-[350px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = placeholderSrc(
                  block.imageWidth || 350,
                  block.imageHeight || 350
                );
              }}
            />
          </div>
        </div>
      </div>
    );
  }
  if (block.type === "richText")
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  if (block.type === "cardGrid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {block.cards.map((card, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105"
          >
            <div className="relative">
              <Image
                src={card.image || placeholderSrc(400, 240)}
                alt={card.title}
                width={400}
                height={240}
                className="w-full h-60 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderSrc(400, 240);
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <Link href={card.href || "#"} className="text-white text-2xl">
                  View Details
                </Link>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl text-center font-semibold text-fixnix-darkpurple mb-3">
                <Link
                  href={card.href || "#"}
                  className="text-fixnix-darkpurple hover:text-fixnix-lightpurple"
                >
                  {card.title}
                </Link>
              </h3>
              <div className="flex justify-center">
                <Link
                  href={card.href || "#"}
                  className="inline-block bg-fixnix-lightpurple text-white hover:bg-fixnix-darkpurple px-2 py-1 rounded-md"
                >
                  Unveil Insights
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ExplorerPreview({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const search = useSearchParams();
  const draft = search.get("draft");
  const [data, setData] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (draft && typeof window !== "undefined") {
          const key = `cms_preview_explorer_${slug}`;
          const raw = sessionStorage.getItem(key);
          if (raw) {
            setData(JSON.parse(raw));
            return;
          }
        }
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/explorer/${slug}`);
        setData(res.data?.data as ContentItem);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug, draft]);

  if (loading)
    return (
      <div className="p-8">
        <CircularLoader label="Loading preview" />
      </div>
    );
  if (!data) return <div className="p-8">Not found</div>;

  return (
    <>
      {data.blocks.find((b: any) => b.type === "heroSlider") && (
        <BlockRenderer
          block={data.blocks.find((b: any) => b.type === "heroSlider")}
        />
      )}
      <div className="py-16 bg-gray-100 text-left-mobile">
        <div className="container mx-auto px-4 space-y-10">
          {data.blocks
            .filter((b: any) => b.type !== "heroSlider")
            .map((b: Block, i: number) => (
              <BlockRenderer key={i} block={b} />
            ))}
        </div>
      </div>
    </>
  );
}
