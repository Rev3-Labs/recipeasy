"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const logoHeights = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <Image
      src="/recipeasy.png"
      alt="Recipeasy logo"
      width={200}
      height={50}
      className={cn(logoHeights[size], "w-auto", className)}
      priority
    />
  );
}
