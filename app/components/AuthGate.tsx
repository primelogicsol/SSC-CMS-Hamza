"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type AuthGateProps = {
  mode: "require" | "redirectIfAuthed";
};

export default function AuthGate({ mode }: AuthGateProps) {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("cms_token") || ""
          : "";
      if (mode === "redirectIfAuthed") {
        if (!token) return;
        try {
          const res = await axios.get(`/v1/user/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status >= 200 && res.status < 300) {
            router.replace("/dashboard");
          }
        } catch {}
        return;
      }
      // mode === "require"
      if (!token) {
        router.replace("/");
        return;
      }
      try {
        const res = await axios.get(`/v1/user/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!(res.status >= 200 && res.status < 300)) {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return null;
}
