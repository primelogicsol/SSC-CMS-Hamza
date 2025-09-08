"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import CircularLoader from "../components/CircularLoader";
import axios from "axios";
import AuthGate from "../components/AuthGate";

function ManualEntry() {
  const [jsonText, setJsonText] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cms_token") || ""
      : "";

  const validate = async () => {
    setStatus("Validating...");
    setLoading(true);
    try {
      const body = JSON.parse(jsonText);
      const res = await axios.post(`/v1/content/validate`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(
        res.status >= 200 && res.status < 300 ? "Valid JSON" : "Invalid JSON"
      );
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || "Invalid JSON");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setStatus("Saving...");
    setLoading(true);
    try {
      const body = JSON.parse(jsonText);
      const res = await axios.post(`/v1/content/bulk`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(
        res.status >= 200 && res.status < 300 ? "Saved" : "Failed to save"
      );
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full border rounded p-2 text-sm min-h-[140px]"
        placeholder="Paste JSON here"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="bg-gray-800 text-white px-3 py-1 rounded disabled:opacity-60"
          onClick={validate}
          disabled={loading || !jsonText.trim()}
        >
          {loading ? <CircularLoader size={16} label="" /> : "Validate JSON"}
        </button>
        <button
          className="bg-fixnix-darkpurple text-white px-3 py-1 rounded disabled:opacity-60"
          onClick={save}
          disabled={loading || !jsonText.trim()}
        >
          {loading ? <CircularLoader size={16} label="" /> : "Save"}
        </button>
      </div>
      <div className="text-sm text-gray-600 min-h-5">{status}</div>
    </div>
  );
}

type IndexItem = { slug: string; title?: string; path?: string };
type ContentItem = {
  section: "explorer" | "academy" | "explorer-details" | "academy-details";
  slug: string;
  title: string;
  updatedAt?: string;
};

export default function Dashboard() {
  // Require auth on this page
  // Redirect to login if not authenticated
  // This component renders null; kept at top to run on mount
  // and ensure a quick redirect.
  // eslint-disable-next-line react/jsx-no-useless-fragment

  const [loading, setLoading] = useState(true);
  const [explorer, setExplorer] = useState<IndexItem[]>([]);
  const [academy, setAcademy] = useState<IndexItem[]>([]);
  const [explorerDetails, setExplorerDetails] = useState<IndexItem[]>([]);
  const [academyDetails, setAcademyDetails] = useState<IndexItem[]>([]);
  const [status, setStatus] = useState("");
  const [recent, setRecent] = useState<ContentItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [ex, ac, ed, ad] = await Promise.all([
          axios
            .get("/v1/content/explorer", {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => r.data),
          axios
            .get("/v1/content/academy", {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => r.data),
          axios
            .get("/v1/content/explorer-details", {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => r.data),
          axios
            .get("/v1/content/academy-details", {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => r.data),
        ]);
        if (!cancelled) {
          setExplorer(ex?.data?.items || []);
          setAcademy(ac?.data?.items || []);
          setExplorerDetails(ed?.data?.items || []);
          setAcademyDetails(ad?.data?.items || []);
        }
        // Fetch details to compute recent changes
        const exDetails = (ex?.data?.items || []).slice(0, 20).map((i: any) =>
          axios
            .get(`/v1/content/explorer/${i.slug}`, {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => ({
              ...(r?.data?.data || {}),
              section: "explorer" as const,
            }))
            .catch(() => null)
        );
        const acDetails = (ac?.data?.items || []).slice(0, 20).map((i: any) =>
          axios
            .get(`/v1/content/academy/${i.slug}`, {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => ({
              ...(r?.data?.data || {}),
              section: "academy" as const,
            }))
            .catch(() => null)
        );
        const edDetails = (ed?.data?.items || []).slice(0, 20).map((i: any) =>
          axios
            .get(`/v1/content/explorer-details/${i.slug}`, {
              params: { _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })
            .then((r) => ({
              ...(r?.data?.data || {}),
              section: "explorer-details" as const,
            }))
            .catch(() => null)
        );
        const details = await Promise.all([
          ...exDetails,
          ...acDetails,
          ...edDetails,
        ]);
        const cleaned: ContentItem[] = details
          .filter(Boolean)
          .map((d: any) => ({
            section: d.section,
            slug: d.slug,
            title: d.title,
            updatedAt: d.updatedAt,
          }));
        cleaned.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        );
        if (!cancelled) setRecent(cleaned.slice(0, 5));
      } catch (e: any) {
        if (!cancelled) setStatus(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <AuthGate mode="require" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fixnix-darkpurple">
            CMS Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Welcome to Sufism Kashmir Platform CMS
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            className="bg-fixnix-lightpurple text-white px-3 py-2 rounded"
            href={process.env.NEXT_PUBLIC_WEBSITE_URL || ""}
            target="_blank"
          >
            View Live Website
          </Link>
          <Link
            className="bg-gray-800 text-white px-3 py-2 rounded"
            href="/editor"
          >
            Open Editor
          </Link>
        </div>
      </div>

      {loading ? (
        <CircularLoader label="Loading content indices" />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Explorer</h2>
              <Link className="text-sm text-fixnix-lightpurple" href="/editor">
                Edit
              </Link>
            </div>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {explorer.map((i) => (
                <li
                  key={i.slug}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="truncate pr-3">{i.title || i.slug}</span>
                  <span className="text-xs text-gray-500">{i.slug}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Academy</h2>
              <Link className="text-sm text-fixnix-lightpurple" href="/editor">
                Edit
              </Link>
            </div>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {academy.map((i) => (
                <li
                  key={i.slug}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="truncate pr-3">{i.title || i.slug}</span>
                  <span className="text-xs text-gray-500">{i.slug}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Explorer Details</h2>
              <Link className="text-sm text-fixnix-lightpurple" href="/editor">
                Edit
              </Link>
            </div>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {explorerDetails.map((i) => (
                <li
                  key={i.slug}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="truncate pr-3">{i.title || i.slug}</span>
                  <span className="text-xs text-gray-500">{i.slug}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Academy Details</h2>
              <Link className="text-sm text-fixnix-lightpurple" href="/editor">
                Edit
              </Link>
            </div>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {academyDetails.map((i) => (
                <li
                  key={i.slug}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="truncate pr-3">{i.title || i.slug}</span>
                  <span className="text-xs text-gray-500">{i.slug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-5 space-y-3">
          <h2 className="text-lg font-semibold">History</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-600">No recent changes found.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((it) => (
                <li
                  key={`${it.section}-${it.slug}`}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="truncate pr-3">
                    <div className="text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-gray-500">
                      {it.section}/{it.slug}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {it.updatedAt
                      ? new Date(it.updatedAt).toLocaleString()
                      : "--"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded shadow p-5 space-y-3">
          <h2 className="text-lg font-semibold">Bulk Upload</h2>
          <Link
            href="/dashboard/upload"
            className="inline-block bg-fixnix-darkpurple text-white px-3 py-2 rounded"
          >
            Go to Bulk Upload
          </Link>
          <div className="text-sm text-gray-600">
            Ensure JSON follows the required schema. See the format guide below.
          </div>
          <ManualEntry />
        </div>
      </div>

      {status && <div className="text-sm text-red-600">{status}</div>}
    </div>
  );
}
