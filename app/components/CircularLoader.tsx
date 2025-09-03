"use client";
import React from "react";

type CircularLoaderProps = {
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
};

export default function CircularLoader({
  size = 32,
  strokeWidth = 4,
  label,
  className,
}: CircularLoaderProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin text-fixnix-lightpurple"
        role="status"
        aria-label={label || "Loading"}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeOpacity={0.2}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * 0.75}
        />
      </svg>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}
