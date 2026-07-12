'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Zap,
  Menu,
  X,
  Grid3X3,
  Layout,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const navItems = [
  { href: '/', label: '首页', icon: Zap },
  { href: '/models', label: '模型列表', icon: Grid3X3 },
  { href: '/compare', label: '价格对比', icon: Layout },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchValue.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchValue.trim())}`;
      setSearchOpen(false);
      setSearchValue('');
    }
  }, [searchValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight hidden sm:inline">
                AIModel<span className="text-blue-400">Prices</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'ghost' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-1.5 h-8 px-3 text-sm',
                        isActive && 'text-foreground bg-secondary'
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-start justify-center pt-28 px-4"
            onClick={(e) => {
              if (e.target === overlayRef.current) {
                setSearchOpen(false);
              }
            }}
          >
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="搜索模型、厂商或功能... (⌘K)"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 h-14 text-lg bg-background border-border/60 rounded-xl"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => { setSearchValue(''); inputRef.current?.focus(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-fast"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                按 Enter 搜索，或按 Esc 关闭
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-14 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'justify-start gap-2 w-full h-11',
                        isActive && 'bg-primary/20 text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Separator className="my-3 border-border/30" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.querySelector('input') as HTMLInputElement);
                  if (input.value.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchValue.trim())}`;
                    setMobileMenuOpen(false);
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="搜索模型..."
                  className="flex-1 bg-secondary border-border/30"
                />
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
