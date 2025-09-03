"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CircularLoader from "../components/CircularLoader";
import axios from "axios";

type Slide = {
  subTitle?: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
};
type Block =
  | { type: "heroSlider"; slides: Slide[] }
  | { type: "sectionHeader"; tagline?: string; title: string; html?: string }
  | { type: "featureList"; items: { text: string }[] }
  | { type: "richText"; html: string }
  | {
      type: "cardGrid";
      cards: { title: string; text?: string; image?: string; href?: string }[];
    }
  | {
      type: "sidebar";
      searchPlaceholder?: string;
      categories: { label: string; href: string; active?: boolean }[];
    }
  | { type: "listToolbar"; showingText?: string; sortOptions?: string[] }
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
  id?: string;
  section: "explorer" | "academy";
  slug: string;
  title: string;
  subtitle?: string;
  seo?: { title?: string; description?: string };
  blocks: Block[];
  version?: number;
  updatedAt?: string;
};

const defaultBlockFor = (type: Block["type"]): Block => {
  if (type === "heroSlider")
    return {
      type: "heroSlider",
      slides: [
        {
          subTitle: "SUBTITLE",
          title: "Title",
          text: "Description",
          buttonText: "Read More",
          buttonLink: "/",
        },
      ],
    };
  if (type === "sectionHeader")
    return {
      type: "sectionHeader",
      tagline: "Tagline",
      title: "Section Title",
      html: "<p>Section description</p>",
    };
  if (type === "featureList")
    return { type: "featureList", items: [{ text: "A feature" }] } as Block;
  if (type === "richText")
    return { type: "richText", html: "<p>Some content</p>" } as Block;
  if (type === "cardGrid")
    return {
      type: "cardGrid",
      cards: [
        {
          title: "Card Title",
          text: "Optional text",
          image: "/assets/images/placeholder.png",
          href: "/details",
        },
      ],
    } as Block;
  if (type === "sidebar")
    return {
      type: "sidebar",
      searchPlaceholder: "Search",
      categories: [{ label: "Item", href: "#", active: true }],
    } as Block;
  if (type === "listToolbar")
    return {
      type: "listToolbar",
      showingText: "Showing results",
      sortOptions: ["Sort by popular", "Sort by Ratings"],
    } as Block;
  if (type === "imageTextSplit")
    return {
      type: "imageTextSplit",
      tagline: "Tagline",
      html: "<p>Split content</p>",
      image: "/assets/images/placeholder.png",
      imageAlt: "alt",
      imageWidth: 350,
      imageHeight: 350,
      imagePosition: "right",
    } as Block;
  return { type: "richText", html: "<p>New block</p>" } as Block;
};

export default function Editor() {
  const [section, setSection] = useState<"explorer" | "academy">("explorer");
  const [slug, setSlug] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ContentItem | null>(null);
  const [slugOptions, setSlugOptions] = useState<
    { slug: string; title?: string }[]
  >([]);
  const [loadingSlugs, setLoadingSlugs] = useState<boolean>(false);
  const [isSlugOpen, setIsSlugOpen] = useState<boolean>(false);
  const [slugHighlightIdx, setSlugHighlightIdx] = useState<number>(0);
  const [availableVersions, setAvailableVersions] = useState<number[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);
  const slugBoxRef = useRef<HTMLDivElement | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cms_token") || ""
      : "";

  const load = async () => {
    setStatus("Loading...");
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${section}/${slug}`);
      setData(res.data?.data as ContentItem);
      setStatus("Loaded");
      // Load available versions after loading content
      await loadAvailableVersions();
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVersions = async () => {
    if (!section || !slug) return;
    setLoadingVersions(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${section}/${slug}/versions`);
      const versions = res.data?.data?.versions || [];
      setAvailableVersions(versions);
      if (versions.length > 0) {
        setCurrentVersion(Math.max(...versions));
      }
    } catch (e: any) {
      console.error("Failed to load versions:", e);
      setAvailableVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadVersion = async (version: number) => {
    if (!section || !slug) return;
    setStatus(`Loading version ${version}...`);
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${section}/${slug}/version/${version}`);
      setData(res.data?.data as ContentItem);
      setCurrentVersion(version);
      setStatus(`Loaded version ${version}`);
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || `Failed to load version ${version}`);
    } finally {
      setLoading(false);
    }
  };

  // Load slug list when section changes
  useEffect(() => {
    let cancelled = false;
    async function fetchSlugs() {
      setLoadingSlugs(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${section}`);
        const items = res?.data?.data?.items || [];
        console.log(items);
        if (!cancelled)
          setSlugOptions(
            items.map((i: any) => ({
              slug: i.slug,
              title: i.title,
            }))
          );
      } catch {
        if (!cancelled) setSlugOptions([]);
      } finally {
        if (!cancelled) setLoadingSlugs(false);
      }
    }
    fetchSlugs();
    return () => {
      cancelled = true;
    };
  }, [section]);

  // Filtered slug list derived from current input
  const filteredSlugs = useMemo(() => {
    const q = slug.trim().toLowerCase();
    if (!q) return slugOptions;
    console.log(slugOptions, slug);
    return slugOptions.filter(
      (it) =>
        it.slug.toLowerCase().includes(q) ||
        (it.title || "").toLowerCase().includes(q)
    );
  }, [slug, slugOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!slugBoxRef.current) return;
      if (e.target instanceof Node && !slugBoxRef.current.contains(e.target)) {
        setIsSlugOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const save = async () => {
    if (!data) return;
    setStatus("Saving...");
    setLoading(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${data.section}/${data.slug}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStatus("Saved");
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const updateBlockAt = (idx: number, next: Block) => {
    if (!data) return;
    const blocks = data.blocks.slice();
    blocks[idx] = next;
    setData({ ...data, blocks });
  };

  const removeBlockAt = (idx: number) => {
    if (!data) return;
    const blocks = data.blocks.filter((_, i) => i !== idx);
    setData({ ...data, blocks });
  };

  const addBlock = (type: Block["type"]) => {
    if (!data) return;
    const blocks = data.blocks ? data.blocks.slice() : [];
    blocks.push(defaultBlockFor(type));
    setData({ ...data, blocks });
  };

  const blockTypes: Block["type"][] = useMemo(
    () => [
      "heroSlider",
      "sectionHeader",
      "featureList",
      "richText",
      "cardGrid",
      "sidebar",
      "listToolbar",
      "imageTextSplit",
    ],
    []
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Editor</h1>
        <div className="space-x-3"></div>
      </div>

      {loading && (
        <div className="rounded border border-fixnix-lightpurple bg-purple-50 p-3">
          <CircularLoader label={status || "Working..."} />
        </div>
      )}

      <div className="flex gap-2 items-center">
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as any)}
          className="border px-2 py-1"
        >
          <option value="explorer">explorer</option>
          <option value="academy">academy</option>
        </select>
        <div className="relative flex-1" ref={slugBoxRef}>
          <input
            className="border px-2 py-1 w-full"
            placeholder={loadingSlugs ? "Loading slugs..." : "Search slug..."}
            value={slug}
            onFocus={() => {
              setIsSlugOpen(true);
              setSlugHighlightIdx(0);
            }}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugOpen(true);
              setSlugHighlightIdx(0);
            }}
            onKeyDown={(e) => {
              if (!isSlugOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
                setIsSlugOpen(true);
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSlugHighlightIdx((idx) =>
                  Math.min(idx + 1, Math.max(filteredSlugs.length - 1, 0))
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSlugHighlightIdx((idx) => Math.max(idx - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const pick = filteredSlugs[slugHighlightIdx];
                if (pick) {
                  setSlug(pick.slug);
                  setIsSlugOpen(false);
                }
              } else if (e.key === "Escape") {
                setIsSlugOpen(false);
              }
            }}
          />
          {isSlugOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded border bg-white shadow">
              {filteredSlugs.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No matches
                </div>
              ) : (
                filteredSlugs.map((opt, idx) => (
                  <button
                    type="button"
                    key={opt.slug}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      idx === slugHighlightIdx ? "bg-gray-100" : ""
                    }`}
                    onMouseEnter={() => setSlugHighlightIdx(idx)}
                    onMouseDown={(e) => {
                      // use onMouseDown to select before input loses focus
                      e.preventDefault();
                      setSlug(opt.slug);
                      setIsSlugOpen(false);
                    }}
                  >
                    <div className="font-medium text-gray-800">{opt.slug}</div>
                    {opt.title && (
                      <div className="text-xs text-gray-500 truncate">
                        {opt.title}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={!slug || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load"}
          </button>
          
          {/* Version Selector */}
          {availableVersions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Version:</span>
              <select
                value={currentVersion}
                onChange={(e) => loadVersion(parseInt(e.target.value))}
                disabled={loadingVersions}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {availableVersions.map((version) => (
                  <option key={version} value={version}>
                    v{version} {version === Math.max(...availableVersions) ? "(Latest)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={save}
            disabled={!data || loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
        <button
          className="bg-gray-800 text-white px-3 py-1 rounded"
          onClick={() => {
            const payload =
              data ||
              (slug
                ? ({ section, slug, title: slug, blocks: [] } as ContentItem)
                : null);
            if (!payload) return;
            try {
              if (typeof window !== "undefined") {
                const key = `cms_preview_${payload.section}_${payload.slug}`;
                const sectionKey = `cms_preview_${payload.section}_${payload.slug}`;
                sessionStorage.setItem(sectionKey, JSON.stringify(payload));
                const url =
                  payload.section === "academy"
                    ? `/preview/academy/${payload.slug}?draft=1`
                    : `/preview/explorer/${payload.slug}?draft=1`;
                window.open(url, "_blank");
              }
            } catch {}
          }}
        >
          Preview
        </button>
      </div>

      <div className="text-sm text-gray-600 min-h-5">
        {loading ? <CircularLoader size={16} label={status} /> : status}
      </div>

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Title</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={data.title || ""}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">SEO Title</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={data.seo?.title || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    seo: { ...(data.seo || {}), title: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">Add Block:</span>
            <div className="flex flex-wrap gap-2">
              {blockTypes.map((t) => (
                <button
                  key={t}
                  className="border px-2 py-1 rounded hover:bg-gray-50"
                  onClick={() => addBlock(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {data.blocks?.map((block, idx) => (
              <div
                key={idx}
                className="border rounded p-4 space-y-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">
                    Block {idx + 1}: {block.type}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="border px-2 py-1 rounded"
                      value={block.type}
                      onChange={(e) =>
                        updateBlockAt(
                          idx,
                          defaultBlockFor(e.target.value as Block["type"])
                        )
                      }
                    >
                      {blockTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-red-600 border px-2 py-1 rounded"
                      onClick={() => removeBlockAt(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Editors per block type */}
                {block.type === "heroSlider" && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">Slides</div>
                    {(block.slides || []).map((slide, sidx) => (
                      <div key={sidx} className="border rounded p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="Sub Title"
                            value={slide.subTitle || ""}
                            onChange={(e) => {
                              const slides = block.slides.slice();
                              slides[sidx] = {
                                ...slides[sidx],
                                subTitle: e.target.value,
                              };
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          />
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="Title"
                            value={slide.title}
                            onChange={(e) => {
                              const slides = block.slides.slice();
                              slides[sidx] = {
                                ...slides[sidx],
                                title: e.target.value,
                              };
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          />
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="Text"
                            value={slide.text || ""}
                            onChange={(e) => {
                              const slides = block.slides.slice();
                              slides[sidx] = {
                                ...slides[sidx],
                                text: e.target.value,
                              };
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          />
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="Button Text"
                            value={slide.buttonText || ""}
                            onChange={(e) => {
                              const slides = block.slides.slice();
                              slides[sidx] = {
                                ...slides[sidx],
                                buttonText: e.target.value,
                              };
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          />
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="Button Link"
                            value={slide.buttonLink || ""}
                            onChange={(e) => {
                              const slides = block.slides.slice();
                              slides[sidx] = {
                                ...slides[sidx],
                                buttonLink: e.target.value,
                              };
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="text-red-600 text-sm"
                            onClick={() => {
                              const slides = block.slides.filter(
                                (_, i) => i !== sidx
                              );
                              updateBlockAt(idx, { ...block, slides });
                            }}
                          >
                            Remove Slide
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="border px-2 py-1 rounded"
                      onClick={() =>
                        updateBlockAt(idx, {
                          ...block,
                          slides: [
                            ...(block.slides || []),
                            {
                              subTitle: "SUBTITLE",
                              title: "New Slide",
                              text: "",
                              buttonText: "Read More",
                              buttonLink: "/",
                            },
                          ],
                        })
                      }
                    >
                      Add Slide
                    </button>
                    <div className="rounded bg-purple-50 p-3">
                      <div className="font-semibold">Preview</div>
                      <div className="text-sm text-gray-700">
                        {(block.slides[0]?.title || "")
                          .split("<br/>")
                          .map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {block.slides[0]?.text}
                      </div>
                    </div>
                  </div>
                )}

                {block.type === "sectionHeader" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Tagline"
                        value={block.tagline || ""}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            tagline: e.target.value,
                          })
                        }
                      />
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Title"
                        value={block.title}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <textarea
                      className="w-full border p-2 rounded min-h-[80px]"
                      placeholder="HTML"
                      value={block.html || ""}
                      onChange={(e) =>
                        updateBlockAt(idx, { ...block, html: e.target.value })
                      }
                    />
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-fixnix-lightpurple text-sm font-semibold uppercase">
                        {block.tagline}
                      </div>
                      <div className="text-xl font-bold text-fixnix-darkpurple">
                        {block.title}
                      </div>
                      {block.html && (
                        <div
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {block.type === "featureList" && (
                  <div className="space-y-2">
                    {(block.items || []).map((it, i2) => (
                      <div key={i2} className="flex gap-2 items-center">
                        <input
                          className="flex-1 border px-2 py-1 rounded"
                          placeholder="Feature text"
                          value={it.text}
                          onChange={(e) => {
                            const items = block.items.slice();
                            items[i2] = { text: e.target.value };
                            updateBlockAt(idx, { ...block, items });
                          }}
                        />
                        <button
                          className="text-red-600 text-sm"
                          onClick={() => {
                            const items = block.items.filter(
                              (_, i) => i !== i2
                            );
                            updateBlockAt(idx, { ...block, items });
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      className="border px-2 py-1 rounded"
                      onClick={() =>
                        updateBlockAt(idx, {
                          ...block,
                          items: [
                            ...(block.items || []),
                            { text: "New feature" },
                          ],
                        })
                      }
                    >
                      Add Feature
                    </button>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {block.items.map((i, k) => (
                        <li key={k}>{i.text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {block.type === "richText" && (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border p-2 rounded min-h-[120px]"
                      placeholder="HTML"
                      value={block.html}
                      onChange={(e) =>
                        updateBlockAt(idx, { ...block, html: e.target.value })
                      }
                    />
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: block.html }}
                    />
                  </div>
                )}

                {block.type === "cardGrid" && (
                  <div className="space-y-3">
                    {(block.cards || []).map((card, cidx) => (
                      <div
                        key={cidx}
                        className="border rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-2"
                      >
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Title"
                          value={card.title}
                          onChange={(e) => {
                            const cards = block.cards.slice();
                            cards[cidx] = {
                              ...cards[cidx],
                              title: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, cards });
                          }}
                        />
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Text"
                          value={card.text || ""}
                          onChange={(e) => {
                            const cards = block.cards.slice();
                            cards[cidx] = {
                              ...cards[cidx],
                              text: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, cards });
                          }}
                        />
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Image URL"
                          value={card.image || ""}
                          onChange={(e) => {
                            const cards = block.cards.slice();
                            cards[cidx] = {
                              ...cards[cidx],
                              image: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, cards });
                          }}
                        />
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Link"
                          value={card.href || ""}
                          onChange={(e) => {
                            const cards = block.cards.slice();
                            cards[cidx] = {
                              ...cards[cidx],
                              href: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, cards });
                          }}
                        />
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            className="text-red-600 text-sm"
                            onClick={() => {
                              const cards = block.cards.filter(
                                (_, i) => i !== cidx
                              );
                              updateBlockAt(idx, { ...block, cards });
                            }}
                          >
                            Remove Card
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="border px-2 py-1 rounded"
                      onClick={() =>
                        updateBlockAt(idx, {
                          ...block,
                          cards: [
                            ...(block.cards || []),
                            {
                              title: "New Card",
                              text: "",
                              image: "/assets/images/placeholder.png",
                              href: "#",
                            },
                          ],
                        })
                      }
                    >
                      Add Card
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {block.cards.map((card, cidx) => (
                        <div key={cidx} className="rounded border p-3">
                          <div className="font-semibold text-sm">
                            {card.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.text}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {card.image}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "sidebar" && (
                  <div className="space-y-3">
                    <input
                      className="border px-2 py-1 rounded"
                      placeholder="Search placeholder"
                      value={block.searchPlaceholder || ""}
                      onChange={(e) =>
                        updateBlockAt(idx, {
                          ...block,
                          searchPlaceholder: e.target.value,
                        })
                      }
                    />
                    {(block.categories || []).map((cat, k) => (
                      <div
                        key={k}
                        className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                      >
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Label"
                          value={cat.label}
                          onChange={(e) => {
                            const categories = block.categories.slice();
                            categories[k] = {
                              ...categories[k],
                              label: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, categories });
                          }}
                        />
                        <input
                          className="border px-2 py-1 rounded"
                          placeholder="Href"
                          value={cat.href}
                          onChange={(e) => {
                            const categories = block.categories.slice();
                            categories[k] = {
                              ...categories[k],
                              href: e.target.value,
                            };
                            updateBlockAt(idx, { ...block, categories });
                          }}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!cat.active}
                            onChange={(e) => {
                              const categories = block.categories.slice();
                              categories[k] = {
                                ...categories[k],
                                active: e.target.checked,
                              };
                              updateBlockAt(idx, { ...block, categories });
                            }}
                          />{" "}
                          Active
                        </label>
                        <div className="md:col-span-3 flex justify-end">
                          <button
                            className="text-red-600 text-sm"
                            onClick={() => {
                              const categories = block.categories.filter(
                                (_, i) => i !== k
                              );
                              updateBlockAt(idx, { ...block, categories });
                            }}
                          >
                            Remove Category
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="border px-2 py-1 rounded"
                      onClick={() =>
                        updateBlockAt(idx, {
                          ...block,
                          categories: [
                            ...(block.categories || []),
                            { label: "New", href: "#", active: false },
                          ],
                        })
                      }
                    >
                      Add Category
                    </button>
                  </div>
                )}

                {block.type === "listToolbar" && (
                  <div className="space-y-2">
                    <input
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Showing text"
                      value={block.showingText || ""}
                      onChange={(e) =>
                        updateBlockAt(idx, {
                          ...block,
                          showingText: e.target.value,
                        })
                      }
                    />
                    <div className="space-y-2">
                      {(block.sortOptions || []).map((opt, oi) => (
                        <div key={oi} className="flex gap-2 items-center">
                          <input
                            className="flex-1 border px-2 py-1 rounded"
                            value={opt}
                            onChange={(e) => {
                              const sortOptions = (
                                block.sortOptions || []
                              ).slice();
                              sortOptions[oi] = e.target.value;
                              updateBlockAt(idx, { ...block, sortOptions });
                            }}
                          />
                          <button
                            className="text-red-600 text-sm"
                            onClick={() => {
                              const sortOptions = (
                                block.sortOptions || []
                              ).filter((_, i) => i !== oi);
                              updateBlockAt(idx, { ...block, sortOptions });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        className="border px-2 py-1 rounded"
                        onClick={() =>
                          updateBlockAt(idx, {
                            ...block,
                            sortOptions: [
                              ...(block.sortOptions || []),
                              "New option",
                            ],
                          })
                        }
                      >
                        Add Sort Option
                      </button>
                    </div>
                  </div>
                )}

                {block.type === "imageTextSplit" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Tagline"
                        value={block.tagline || ""}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            tagline: e.target.value,
                          })
                        }
                      />
                      <select
                        className="border px-2 py-1 rounded"
                        value={block.imagePosition || "right"}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            imagePosition: e.target.value as any,
                          })
                        }
                      >
                        <option value="left">left</option>
                        <option value="right">right</option>
                      </select>
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Image URL"
                        value={block.image}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Alt"
                        value={block.imageAlt || ""}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            imageAlt: e.target.value,
                          })
                        }
                      />
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Width"
                        type="number"
                        value={block.imageWidth || 350}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            imageWidth: Number(e.target.value),
                          })
                        }
                      />
                      <input
                        className="border px-2 py-1 rounded"
                        placeholder="Height"
                        type="number"
                        value={block.imageHeight || 350}
                        onChange={(e) =>
                          updateBlockAt(idx, {
                            ...block,
                            imageHeight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <textarea
                      className="w-full border p-2 rounded min-h-[100px]"
                      placeholder="HTML"
                      value={block.html}
                      onChange={(e) =>
                        updateBlockAt(idx, { ...block, html: e.target.value })
                      }
                    />
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-fixnix-lightpurple text-sm font-semibold uppercase">
                        {block.tagline}
                      </div>
                      <div
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                      <div className="text-xs text-gray-400 truncate">
                        {block.image}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Version History */}
      {availableVersions.length > 1 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Version History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableVersions.map((version) => (
              <div
                key={version}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentVersion === version
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => loadVersion(version)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Version {version}</span>
                  {version === Math.max(...availableVersions) && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {currentVersion === version ? "Currently loaded" : "Click to load"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
