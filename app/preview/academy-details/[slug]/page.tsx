"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Banner from "../../../components/sections/home3/Banner";
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
  | {
      type: "heroSection";
      title: string;
      subtitle?: string;
      description?: string;
      image?: string;
    }
  | { type: "richText"; content: string }
  | { type: "section"; title: string; content: string }
  | { type: "conclusion"; title: string; content: string }
  | { type: "finalQuote"; title: string; content: string }
  | { type: "profileCard"; professionalProfile: any; areasOfFocus: any }
  | { type: "introduction"; content: string }
  | { type: "interviewSection"; title: string; [key: string]: any };

type ContentItem = {
  id: string;
  section: string;
  slug: string;
  title: string;
  category?: string;
  blocks: Block[];
  version: number;
  updatedAt: string;
};

function BlockRenderer({
  block,
  category,
  index,
}: {
  block: Block;
  category?: string;
  index: number;
}) {
  switch (block.type) {
    case "heroSection":
      if (category === "sacredprofessions") {
        return (
          <div className="relative mb-20">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-80 h-80" viewBox="0 0 100 100">
                <path
                  d="M50 10 L90 50 L50 90 L10 50 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>

            <h1 className="text-6xl font-bold text-center mb-10 relative bg-clip-text text-transparent bg-gradient-to-r from-fixnix-darkpurple to-fixnix-lightpurple">
              {block.title}
            </h1>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-12">
              <p className="italic text-center text-2xl text-gray-700">
                {block.subtitle}
              </p>
            </div>

            <blockquote className="text-center italic mb-8 text-xl bg-white p-6 rounded-lg shadow-sm border-l-4 border-fixnix-lightpurple">
              {block.description}
              <br />
              <span className="block mt-3 text-gray-600 font-medium">
                — Sacred Profession
              </span>
            </blockquote>
          </div>
        );
      } else if (category === "inspiringinterview") {
        return (
          <div className="relative mb-16 sm:mb-24">
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="absolute w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-fixnix-lightpurple blur-3xl opacity-20"></div>
              <div className="absolute w-48 sm:w-64 h-48 sm:h-64 -translate-x-20 translate-y-20 rounded-full bg-fixnix-darkpurple blur-3xl opacity-20"></div>
              <svg className="w-72 sm:w-96 h-72 sm:h-96" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <path
                  d="M30 50 L70 50 M50 30 L50 70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
            </div>

            {/* Main title with elegant typography */}
            <div className="relative z-10">
              <div className="text-center">
                <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-fixnix-darkpurple">
                  Sufi Science Center Presents
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mt-4 mb-6 relative bg-clip-text text-transparent bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple leading-tight">
                  {block.title}
                </h1>

                <div className="w-24 h-1 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple mx-auto mb-6"></div>

                <h2 className="text-2xl sm:text-3xl text-center mb-8 sm:mb-12 text-fixnix-lightpurple font-light italic">
                  {block.subtitle}
                </h2>
              </div>
            </div>

            {/* Featured quote with decorative elements */}
            <div className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl text-fixnix-lightpurple opacity-50">
                "
              </div>
              <blockquote className="text-center italic text-xl sm:text-2xl font-serif text-fixnix-lightpurple px-4 sm:px-12 relative z-10">
                {block.description}
                <div className="w-16 h-1 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple mx-auto mt-6"></div>
              </blockquote>
              <div className="absolute -bottom-8 right-1/2 transform translate-x-1/2 text-5xl sm:text-6xl text-fixnix-lightpurple opacity-50">
                "
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="relative mb-20">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <svg className="w-72 h-72" viewBox="0 0 100 100">
                <path
                  d="M50 10 L90 50 L50 90 L10 50 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>

            <h1 className="text-6xl font-bold text-center mb-10 relative bg-clip-text text-transparent bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple">
              {block.title}
            </h1>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-12">
              <p className="italic text-center text-2xl text-gray-700">
                {block.subtitle}
              </p>
            </div>

            <blockquote className="text-center italic mb-8 text-xl">
              {block.description}
              <br />
              <span className="block mt-3 text-gray-600 font-medium">
                — Academy Details
              </span>
            </blockquote>
          </div>
        );
      }
    case "richText":
      if (category === "inspiringinterview") {
        return (
          <div className="max-w-3xl mx-auto mb-16 sm:mb-24">
            <div className="bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple p-6 sm:p-8 rounded-3xl shadow-sm">
              <div
                className="prose prose-lg max-w-none prose-p:text-fixnix-white prose-p:font-serif prose-p:italic prose-p:text-center"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            </div>

            <div className="relative mt-12 sm:mt-16 mb-16 sm:mb-20">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-fixnix-lightpurple to-transparent"></div>
              <p className="font-semibold text-center text-xl sm:text-2xl py-6 sm:py-8 text-fixnix-darkpurple">
                A journey from scientific rigor to spiritual reverence
              </p>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fixnix-lightpurple to-transparent"></div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="prose prose-lg max-w-none mb-16 prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-fixnix-darkpurple">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
      }
    case "section":
      if (category === "sacredprofessions") {
        // Extract section number from title (e.g., "1. POWER AS A SACRED TRUST" -> "1")
        const sectionNumber =
          block.title.match(/^(\d+)\./)?.[1] || (index + 1).toString();
        // Remove the number from the title text (e.g., "1. POWER AS A SACRED TRUST" -> "POWER AS A SACRED TRUST")
        const titleWithoutNumber = block.title.replace(/^\d+\.\s*/, "");
        return (
          <section className="bg-white rounded-2xl shadow-md p-10 border-t-8 border-fixnix-lightpurple mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <span className="bg-fixnix-lightpurple text-white rounded-full w-8 h-8 flex items-center justify-center">
                {sectionNumber}
              </span>
              <span>{titleWithoutNumber}</span>
            </h2>
            <div
              className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-fixnix-darkpurple prose-ul:text-gray-700 prose-ol:text-gray-700"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </section>
        );
      } else if (category === "inspiringinterview") {
        return (
          <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-12 border-l-4 sm:border-l-8 border-fixnix-lightpurple relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mb-16 sm:mb-24">
            {/* Decorative background element */}
            <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-lightpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-darkpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-fixnix-darkpurple">
                  {block.title}
                </h2>
              </div>

              <div className="pl-4 sm:pl-16">
                <div
                  className="prose max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </div>
            </div>
          </section>
        );
      } else {
        return (
          <section className="bg-white rounded-2xl shadow-md p-10 border-t-8 border-fixnix-lightpurple mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <span>{block.title}</span>
            </h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </section>
        );
      }
    case "conclusion":
      if (category === "sacredprofessions") {
        return (
          <section className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-10 shadow-lg">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <span className="bg-fixnix-lightpurple text-white rounded-full w-8 h-8 flex items-center justify-center">
                7
              </span>
              <span>{block.title}</span>
            </h2>
            <div
              className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-fixnix-darkpurple prose-ul:text-gray-700 prose-ol:text-gray-700"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </section>
        );
      } else if (category === "inspiringinterview") {
        return (
          <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-12 border-l-4 sm:border-l-8 border-fixnix-lightpurple relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            {/* Decorative background element */}
            <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-lightpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-darkpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-fixnix-darkpurple">
                  {block.title}
                </h2>
              </div>

              <div className="pl-4 sm:pl-16">
                <div className="space-y-6 bg-white bg-opacity-70 backdrop-blur-sm p-8 rounded-xl shadow-md">
                  <p className="leading-relaxed text-xl text-gray-800">
                    <span className="font-semibold text-fixnix-darkpurple">
                      Carter Nooruddin:
                    </span>{" "}
                    {block.content}
                  </p>
                </div>

                <div className="mt-16 p-12 bg-gradient-to-r from-fixnix-lightpurple-light to-fixnix-darkpurple rounded-2xl shadow-lg border border-white transform hover:scale-105 transition-transform duration-300">
                  <p className="text-center text-white">
                    <span className="block mb-6 text-lg uppercase tracking-widest font-semibold">
                      Closing Reflection
                    </span>
                    <span className="text-2xl md:text-3xl font-serif italic">
                      "{block.content}"
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      } else {
        return (
          <div className="mt-10 p-8 bg-fixnix-lightpurple rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-white">
              <span>{block.title}</span>
            </h2>
            <div
              className="prose max-w-none text-white"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        );
      }
    case "finalQuote":
      return (
        <div className="mt-10 p-8 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple rounded-xl shadow-md">
          <div
            className="prose max-w-none prose-p:text-white prose-strong:text-white prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );
    case "profileCard":
      if (category === "inspiringinterview") {
        return (
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-fixnix-lightpurple-light mb-16 transform hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-8 text-base sm:text-lg">
              <div className="flex-1 md:border-r border-fixnix-lightpurple-light md:pr-8">
                <h3 className="text-base sm:text-lg font-semibold text-fixnix-lightpurple mb-4 uppercase tracking-wide">
                  Professional Profile
                </h3>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Profession:
                  </span>{" "}
                  {block.professionalProfile.profession}
                </p>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Country:
                  </span>{" "}
                  {block.professionalProfile.country}
                </p>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Institutional Affiliation:
                  </span>{" "}
                  {block.professionalProfile.institutionalAffiliation}
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-fixnix-lightpurple mb-4 uppercase tracking-wide">
                  Areas of Focus
                </h3>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Spiritual Orientation:
                  </span>{" "}
                  {block.areasOfFocus.spiritualOrientation}
                </p>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Areas of Impact:
                  </span>{" "}
                  {block.areasOfFocus.areasOfImpact}
                </p>
                <p className="mb-3">
                  <span className="font-bold text-fixnix-darkpurple mr-2">
                    Interview Conducted by:
                  </span>{" "}
                  {block.areasOfFocus.interviewConductedBy}
                </p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    case "introduction":
      if (category === "inspiringinterview") {
        return (
          <div className="max-w-3xl mx-auto mb-16 sm:mb-24">
            <div className="bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple p-6 sm:p-8 rounded-3xl shadow-sm">
              <p className="mb-8 leading-relaxed text-lg sm:text-xl font-serif italic text-center text-fixnix-white">
                "{block.content}"
              </p>
            </div>

            <div className="relative mt-12 sm:mt-16 mb-16 sm:mb-20">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-fixnix-lightpurple to-transparent"></div>
              <p className="font-semibold text-center text-xl sm:text-2xl py-6 sm:py-8 text-fixnix-darkpurple">
                A journey from adventure to spiritual reverence
              </p>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fixnix-lightpurple to-transparent"></div>
            </div>
          </div>
        );
      }
      return null;
    case "interviewSection":
      if (category === "inspiringinterview") {
        return (
          <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-12 border-l-4 sm:border-l-8 border-fixnix-lightpurple relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mb-16 sm:mb-24">
            {/* Decorative background element */}
            <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-lightpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-fixnix-darkpurple-light rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-fixnix-darkpurple">
                  {block.title}
                </h2>
              </div>

              <div className="pl-4 sm:pl-16">
                {block.content && (
                  <p className="mt-4 leading-relaxed text-base sm:text-lg text-gray-700">
                    <span className="font-bold text-fixnix-darkpurple">
                      Carter Nooruddin:
                    </span>{" "}
                    {block.content}
                  </p>
                )}

                {block.additionalContent && (
                  <p className="mt-4 leading-relaxed text-base sm:text-lg text-gray-700">
                    {block.additionalContent}
                  </p>
                )}

                {block.question && (
                  <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-fixnix-lightpurple-light rounded-xl border-l-4 border-fixnix-lightpurple">
                    <p className="text-base sm:text-lg text-fixnix-white font-medium">
                      <span className="font-semibold text-fixnix-white">
                        {block.question}
                      </span>
                    </p>
                  </div>
                )}

                {block.answer && (
                  <div className="space-y-4 sm:space-y-6">
                    <p className="leading-relaxed text-base sm:text-lg text-gray-700">
                      <span className="font-semibold text-fixnix-darkpurple">
                        Carter Nooruddin:
                      </span>{" "}
                      {block.answer}
                    </p>

                    {block.highlightedQuote && (
                      <p className="leading-relaxed text-lg sm:text-xl font-serif italic text-fixnix-lightpurple pl-4 sm:pl-6 border-l-2 border-fixnix-lightpurple">
                        {block.highlightedQuote}
                      </p>
                    )}

                    {block.additionalAnswer && (
                      <p className="leading-relaxed text-base sm:text-lg text-gray-700">
                        {block.additionalAnswer}
                      </p>
                    )}

                    {block.secondQuestion && (
                      <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-fixnix-lightpurple-light rounded-xl border-l-4 my-4 border-fixnix-lightpurple">
                        <p className="text-base sm:text-lg text-fixnix-white font-medium">
                          <span className="font-semibold text-fixnix-white">
                            {block.secondQuestion}
                          </span>
                        </p>
                      </div>
                    )}

                    {block.secondAnswer && (
                      <p className="mt-4 leading-relaxed text-lg ml-6">
                        <span className="font-semibold text-fixnix-darkpurple">
                          Carter Nooruddin:
                        </span>{" "}
                        {block.secondAnswer}
                      </p>
                    )}

                    {block.secondAdditionalAnswer && (
                      <p className="mt-2 leading-relaxed text-lg ml-6">
                        {block.secondAdditionalAnswer}
                      </p>
                    )}

                    {block.finalAnswer && (
                      <p className="leading-relaxed text-base sm:text-lg text-gray-700">
                        {block.finalAnswer}
                      </p>
                    )}

                    {block.finalQuote && (
                      <p className="leading-relaxed text-2xl font-serif italic text-fixnix-darkpurple text-center mt-8 px-4">
                        {block.finalQuote}
                      </p>
                    )}

                    {block.conclusion && (
                      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple rounded-xl">
                        <p className="text-base sm:text-lg text-gray-50 italic">
                          {block.conclusion}
                        </p>
                      </div>
                    )}

                    {block.keyInsight && (
                      <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple rounded-xl border border-fixnix-lightpurple-light shadow-inner">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-6 sm:h-8 bg-fixnix-white rounded-full mr-4"></div>
                          <h4 className="text-lg sm:text-xl font-bold text-fixnix-white">
                            Key Insight
                          </h4>
                        </div>
                        <p className="text-base sm:text-lg text-gray-50">
                          {block.keyInsight}
                        </p>
                      </div>
                    )}

                    {block.revelation && (
                      <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gradient-to-r from-fixnix-lightpurple to-fixnix-darkpurple rounded-xl border border-fixnix-lightpurple-light shadow-inner">
                        <div className="flex items-center mb-3">
                          <div className="w-2 h-6 sm:h-8 bg-fixnix-white rounded-full mr-4"></div>
                          <h4 className="text-lg sm:text-xl font-bold text-fixnix-white">
                            Revelation:
                          </h4>
                        </div>
                        <p className="text-base sm:text-lg text-gray-50">
                          {block.revelation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }
      return null;
    default:
      return null;
  }
}

export default function AcademyDetailsPreview({
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
          const key = `cms_preview_academy-details_${slug}`;
          const raw = sessionStorage.getItem(key);
          if (raw) {
            setData(JSON.parse(raw));
            return;
          }
        }
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/content/academy-details/${slug}`
        );
        setData(res.data?.data as ContentItem);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug, draft]);

  if (loading) return <CircularLoader />;
  if (!data) return <div className="p-8">Not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="px-6 py-20 max-w-4xl mx-auto text-gray-800">
        {data.blocks.map((b: Block, i: number) => (
          <BlockRenderer
            key={`block-${i}`}
            block={b}
            category={data.category}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
