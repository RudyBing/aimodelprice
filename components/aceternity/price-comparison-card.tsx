'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPricingInput, getPricingOutput } from '@/lib/pricing'
import { providerAccentClass, providerDotClass } from '@/lib/providers'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronRight } from 'lucide-react';
import type { AIModel } from '@/data/models';
import { useRouter } from 'next/navigation';



interface PriceComparisonCardProps {
  model: AIModel;
  index?: number;
  compact?: boolean;
}



export function PriceComparisonCard({
  model,
  index = 0,
  compact = false,
}: PriceComparisonCardProps) {
  const router = useRouter();
  const accentClass = providerAccentClass[model.provider] || '';
  const dotClass = providerDotClass[model.provider] || 'bg-gray-500';
  const inputPrice = getPricingInput(model.pricing);
  const outputPrice = getPricingOutput(model.pricing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <div onClick={() => router.push(`/models/${model.slug}`)} className="block" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/models/${model.slug}`); } }} role="link">
        <div
          className={cn(
            'relative rounded-lg border border-border/50 bg-card p-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-normal hover:shadow-glow-xs',
            accentClass,
            '[border-inline-start-width:3px]',
            'hover:border-border/80 hover:bg-secondary/30 transition-normal',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          )}
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-normal pointer-events-none" />

          {/* Provider badge */}
          <div className="flex items-center justify-between mb-2 relative">
            <div className="flex items-center gap-1.5">
              <span className={cn('inline-block w-2 h-2 rounded-full', dotClass)} />
              <span className="text-xs text-muted-foreground font-medium">{model.provider}</span>
            </div>
            {model.benchmarkScore && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5 font-mono">
                {model.benchmarkScore}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-1 pr-16 relative">
            {model.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed relative">
            {model.description}
          </p>

          {!compact && (
            <>
              {/* Pricing block */}
              <div className="mb-3 p-2.5 rounded-md bg-secondary/60 border border-border/30 space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">输入</span>
                  <span className="font-mono font-medium text-foreground tabular-nums">{inputPrice}</span>
                </div>
                {outputPrice && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">输出</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">{outputPrice}</span>
                  </div>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 flex-wrap relative">
                <span className="px-1.5 py-0.5 rounded bg-background/50 border border-border/30 font-mono">
                  {model.contextWindow}
                </span>
                {model.multimodal && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    多模态
                  </Badge>
                )}
                {model.freeTier && model.freeTier !== '无' && (
                  <Badge variant="success" className="text-[10px] h-4 px-1.5">
                    {model.freeTier}
                  </Badge>
                )}
              </div>
            </>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs h-7 px-2 -ml-2 group/btn"
              asChild
            >
              <span>
                查看详情
                <ChevronRight className="w-3 h-3 ml-0.5 group-hover/btn:translate-x-0.5 transition-normal" />
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <a
                href={model.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={model.name + " 瀹樼綉"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
