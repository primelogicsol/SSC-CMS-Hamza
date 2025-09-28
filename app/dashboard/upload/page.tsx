"use client";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import CircularLoader from "../../components/CircularLoader";
import axios from "axios";

const ContentItemSchema = z.object({
  id: z.string(),
  section: z.enum(["explorer", "academy", "explorer-details", "academy-details"]),
  slug: z.string(),
  title: z.string(),
  category: z.string().optional(),
  subtitle: z.string().optional(),
  heroImage: z.string().url().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  blocks: z.array(z.any()),
  version: z.number().default(1).optional(),
  updatedAt: z.string(),
});

type ContentItem = z.infer<typeof ContentItemSchema>;

export default function BulkUploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFiles = useCallback((list: FileList | null) => {
    setFiles(list);
    setResults([]);
  }, []);

  const exampleJson = useMemo(
    () =>
      JSON.stringify(
        {
          id: "foundationalmatrices",
          section: "explorer",
          slug: "foundationalmatrices",
          title: "Foundational Matrices",
          subtitle: "Optional subtitle",
          seo: { title: "Foundational Matrices", description: "Desc" },
          blocks: [
            { type: "richText", content: "<p>Some content</p>" },
            {
              type: "cardGrid",
              cards: [
                {
                  title: "Card A",
                  image: "/assets/images/blog/example.png",
                  href: "/details",
                },
              ],
            },
          ],
          version: 1,
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
    []
  );

  const upload = useCallback(async () => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setResults([]);
    const outcomes: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files.item(i)!;
        try {
          const text = await f.text();
          const json = JSON.parse(text);
          const parsed: ContentItem = ContentItemSchema.parse(json);
          const res = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/${parsed.section}/${parsed.slug}`,
            parsed,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("cms_token") || ""}`,
              },
            }
          );
          const body = res.data;
          if (res.status >= 200 && res.status < 300) {
            outcomes.push(`✔ Saved ${parsed.section}/${parsed.slug}`);
          } else {
            outcomes.push(
              `✖ Failed ${parsed.section}/${parsed.slug}: ${
                body?.message || res.status
              }`
            );
          }
        } catch (e: any) {
          outcomes.push(`✖ ${f.name}: ${e?.message || "Invalid JSON"}`);
        }
      }
    } finally {
      setResults(outcomes);
      setLoading(false);
      setStatus(
        outcomes.some((s) => s.startsWith("✖"))
          ? "Completed with some errors"
          : "Completed successfully"
      );
    }
  }, [files]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fixnix-darkpurple">
          Bulk Upload JSON
        </h1>
        <p className="text-sm text-gray-600">
          Upload one or more JSON files that match the content schema.
        </p>
      </div>

      <div className="bg-white p-5 rounded shadow space-y-4">
        <input
          type="file"
          accept="application/json"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          className="bg-fixnix-darkpurple text-white px-3 py-2 rounded disabled:opacity-60"
          onClick={upload}
          disabled={loading || !files || files.length === 0}
        >
          {loading ? <CircularLoader size={18} label="" /> : "Upload"}
        </button>
        {loading && <CircularLoader label="Uploading..." />}
        {!!results.length && (
          <div className="space-y-1 text-sm">
            {results.map((r, i) => (
              <div
                key={i}
                className={
                  r.startsWith("✔") ? "text-green-700" : "text-red-700"
                }
              >
                {r}
              </div>
            ))}
          </div>
        )}
        {status && <div className="text-sm text-gray-600">{status}</div>}
      </div>

      <div className="bg-white p-5 rounded shadow space-y-3">
        <h2 className="text-lg font-semibold">JSON Format Guide</h2>
        <p className="text-sm text-gray-600">
          Each file must follow this schema and the URL path will be derived
          from section and slug.
        </p>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          <code>{exampleJson}</code>
        </pre>
      </div>
    </div>
  );
}
