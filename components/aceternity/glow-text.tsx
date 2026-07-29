"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowTextProps {
  text: string;
  className?: string;
  variant?: "blue" | "purple" | "gold" | "rainbow";
  delay?: number;
}

export function GlowText({
  text,
  className,
  variant = "blue",
  delay = 0,
}: GlowTextProps) {
  const gradients = {
    blue: "from-blue-400 via-cyan-400 to-blue-500",
    purple: "from-purple-400 via-pink-400 to-purple-500",
    gold: "from-yellow-300 via-amber-400 to-orange-400",
    rainbow:
      "from-blue-400 via-purple-400 via-pink-400 via-red-400 via-yellow-400 via-green-400 via-blue-400",
  };

  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={cn(
        "text-5xl md:text-7xl font-bold tracking-tight",
        "bg-gradient-to-r",
        gradients[variant],
        "bg-[length:200%_auto] animate-gradient",
        "bg-clip-text text-transparent",
        className
      )}
    >
      {text}
    </motion.h1>
  );
}

// Animated gradient background
export function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.3) 0%, transparent 50%)",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Spotlight effect
export function Spotlight({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition-opacity duration-300",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
    </motion.div>
  );
}
