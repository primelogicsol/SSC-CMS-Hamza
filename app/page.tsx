"use client";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import CircularLoader from "./components/CircularLoader";
import AuthGate from "./components/AuthGate";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setStatus("Logging in...");
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await axios.post(
        `${backendUrl}/v1/user/admin/login`,
        {
          username: email,
          password,
        }
      );
      const token = res.data?.data?.accessToken || res.data?.data?.token;
      if (token) {
        localStorage.setItem("cms_token", token);
        setStatus("Logged in");
        window.location.href = "/dashboard";
      } else {
        setStatus(res.data?.message || "Login failed");
      }
    } catch (e: any) {
      setStatus(e?.response?.data?.message || e?.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <AuthGate mode="redirectIfAuthed" />
      <div className="w-full max-w-md bg-white shadow rounded p-6 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/assets/images/resources/logo.png"
            width={120}
            height={120}
            alt="Sufism Kashmir Platform"
            priority
          />
          <h1 className="text-2xl font-semibold text-fixnix-darkpurple text-center">
            Sufism Kashmir Platform CMS
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Sign in to manage content for the Sufi Science Explorer and Academy.
          </p>
        </div>
        <input
          className="border w-full p-2"
          placeholder="username/email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border w-full p-2"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-fixnix-lightpurple text-white px-3 py-2 rounded w-full disabled:opacity-60"
          onClick={login}
          disabled={loading}
        >
          {loading ? <CircularLoader size={18} label="" /> : "Login"}
        </button>
        <div className="text-sm text-gray-600 min-h-5">
          {loading ? <CircularLoader size={16} label={status} /> : status}
        </div>
      </div>
    </div>
  );
}
