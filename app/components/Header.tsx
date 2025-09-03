"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("cms_token") || ""
        : "";
    if (!token) {
      setIsAuthed(false);
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setIsAuthed(r.status >= 200 && r.status < 300))
      .catch(() => setIsAuthed(false));
  }, []);

  if (!isAuthed) return null;

  const onLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cms_token");
      }
    } catch {}
    setIsAuthed(false);
    router.replace("/");
  };

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/assets/images/resources/logo.png"
            width={36}
            height={36}
            alt="Sufism Kashmir"
            priority
          />
          <div className="truncate">
            <span className="font-semibold text-fixnix-darkpurple">
              Sufism Kashmir CMS
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:text-fixnix-lightpurple">
            Dashboard
          </Link>
          <Link href="/editor" className="hover:text-fixnix-lightpurple">
            Editor
          </Link>
          <Link
            href="/dashboard/upload"
            className="hover:text-fixnix-lightpurple"
          >
            Bulk Upload
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_WEBSITE_URL || ""}
            target="_blank"
            className="text-white bg-fixnix-lightpurple px-2 py-1 rounded"
          >
            View Site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
