"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Zap,
  Menu,
  X,
  Grid3X3,
  Layout,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/", label: "首页", icon: Zap },
  { href: "/models", label: "模型列表", icon: Grid3X3 },
  { href: "/compare", label: "价格对比", icon: Layout },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold hidden sm:inline">
                AI<span className="text-blue-400">Model</span>Prices
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-primary/20 text-primary")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>

              <div className="hidden sm:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="搜索模型... (⌘K)"
                  readOnly
                  onClick={() => setSearchOpen(true)}
                  className="pl-9 w-48 bg-background/50 border-border/30 focus-visible:border-primary/50 cursor-pointer"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-border/30">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  placeholder="搜索 AI 模型、提供商、功能..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                />
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setSearchOpen(false)}>
                  ESC
                </Button>
              </div>

              {!searchValue && (
                <div className="p-4 max-h-60 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-3">热门搜索</p>
                  <div className="flex flex-wrap gap-2">
                    {["GPT-4.1", "Claude Sonnet", "Gemini 2.5", "Midjourney", "DeepSeek", "Sora"].map((term) => (
                      <Button key={term} variant="outline" size="sm" className="text-sm" onClick={() => setSearchValue(term)}>
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {searchValue && (
                <div className="p-3 border-t border-border/30">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSearchSubmit}>
                    <Search className="h-4 w-4 mr-2" />
                    搜索 &quot;{searchValue}&quot;
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? "default" : "ghost"} className={cn("justify-start gap-2 w-full", isActive && "bg-primary/20")}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Separator className="my-2 border-border/30" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                  if (input.value.trim()) {
                    router.push(`/search?q=${encodeURIComponent(input.value.trim())}`);
                    setMobileMenuOpen(false);
                  }
                }}
                className="flex gap-2"
              >
                <Input placeholder="搜索模型..." className="flex-1 bg-background/50 border-border/30" />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
