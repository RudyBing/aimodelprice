'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { AIModel } from '@/data/models';

function getPricingInput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || '';
  return pricing.input;
}

function getPricingOutput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || '';
  return pricing.output;
}

interface PriceComparisonCardProps {
  model: AIModel;
  index?: number;
  compact?: boolean;
}

const providerAccentClass: Record<string, string> = {
  OpenAI: 'provider-accent-openai',
  Anthropic: 'provider-accent-anthropic',
  Google: 'provider-accent-google',
  Meta: 'provider-accent-meta',
  Alibaba: 'provider-accent-alibaba',
  DeepSeek: 'provider-accent-deepseek',
  'Black Forest Labs': 'provider-accent-blackforest',
  Stability: 'provider-accent-stability',
  Mistral: 'provider-accent-mistral',
  Kuaishou: 'provider-accent-kuaishou',
  Zhipu: 'provider-accent-zhipu',
};

const providerDotClass: Record<string, string> = {
  OpenAI: 'bg-[hsl(var(--provider-openai))]',
  Anthropic: 'bg-[hsl(var(--provider-anthropic))]',
  Google: 'bg-[hsl(var(--provider-google))]',
  Meta: 'bg-[hsl(var(--provider-meta))]',
  Alibaba: 'bg-[hsl(var(--provider-alibaba))]',
  DeepSeek: 'bg-[hsl(var(--provider-deepseek))]',
  'Black Forest Labs': 'bg-[hsl(var(--provider-blackforest))]',
  Stability: 'bg-[hsl(var(--provider-stability))]',
  Mistral: 'bg-[hsl(var(--provider-mistral))]',
  Kuaishou: 'bg-[hsl(var(--provider-kuaishou))]',
  Zhipu: 'bg-[hsl(var(--provider-zhipu))]',
};

export function PriceComparisonCard({
  model,
  index = 0,
  compact = false,
}: PriceComparisonCardProps) {
  const accentClass = providerAccentClass[model.provider] || '';
  const dotClass = providerDotClass[model.provider] || 'bg-gray-500';
  const inputPrice = getPricingInput(model.pricing);
  const outputPrice = getPricingOutput(model.pricing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div
        className={cn(
          'relative rounded-lg border border-border/50 bg-card p-4',
          accentClass,
          '[border-inline-start-width:3px]',
          'hover:border-border/80 transition-normal',
        )}
      >
        {/* Provider badge */}
        <div className="flex items-center justify-between mb-2">
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
        <h3 className="text-base font-semibold text-foreground mb-1 pr-16">
          {model.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {model.description}
        </p>

        {!compact && (
          <>
            {/* Pricing block */}
            <div className="mb-3 p-2.5 rounded-md bg-secondary/60 border border-border/30 space-y-1.5">
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
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 flex-wrap">
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
                  免费
                </Badge>
              )}
            </div>

            {/* Strengths */}
            <div className="flex flex-wrap gap-1 mb-3">
              {model.strengths.slice(0, 3).map((s) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            asChild
          >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <Link href={`/models/${model.slug}`}>
              查看详情
            </Link>
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
              aria-label={model.name + " 官网"}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
