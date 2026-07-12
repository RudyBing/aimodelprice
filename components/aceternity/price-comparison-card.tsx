"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import type { AIModel } from "@/data/models";

function getPricingInput(pricing: AIModel["pricing"]): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || "";
  return pricing.input;
}

function getPricingOutput(pricing: AIModel["pricing"]): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || "";
  return pricing.output;
}

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
  const providerColors: Record<string, string> = {
    OpenAI: "from-orange-500 to-red-500",
    Anthropic: "from-orange-400 to-amber-500",
    Google: "from-blue-500 to-green-500",
    Meta: "from-blue-600 to-blue-800",
    Alibaba: "from-orange-600 to-red-600",
    DeepSeek: "from-indigo-500 to-purple-600",
    "Black Forest Labs": "from-purple-500 to-pink-500",
    Stability: "from-green-500 to-teal-500",
    Mistral: "from-blue-400 to-cyan-500",
    Kuaishou: "from-orange-500 to-yellow-500",
    Zhipu: "from-violet-500 to-purple-600",
  };

  const color = providerColors[model.provider] || "from-gray-500 to-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <div
        className={cn(
          "relative rounded-xl border border-border/50 bg-card/30 backdrop-blur-md p-5",
          "hover:border-primary/30 hover:bg-card/50 transition-all duration-300",
          !compact && "glow-blue"
        )}
      >
        <div className="absolute -top-2 -right-2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            <span
              className={cn("inline-block w-2 h-2 rounded-full mr-1 bg-gradient-to-r", color)}
            />
            {model.provider}
          </Badge>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1 pr-24">{model.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{model.description}</p>

        {!compact && (
          <>
            <div className="mb-3 p-3 rounded-lg bg-background/30 border border-border/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">输入价格:</span>
                <span className="font-semibold text-foreground">{getPricingInput(model.pricing)}</span>
              </div>
              {getPricingOutput(model.pricing) && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">输出价格:</span>
                  <span className="font-semibold text-foreground">{getPricingOutput(model.pricing)}</span>
                </div>
              )}
              {model.freeTier && model.freeTier !== "无" && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="group/freetier relative inline-block">
                    <Badge variant="success" className="text-xs cursor-help">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {truncateFreeTier(model.freeTier)}
                    </Badge>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/freetier:block z-50">
                      <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl max-w-[280px] break-words">
                        {model.freeTier}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-foreground rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="px-2 py-0.5 rounded bg-background/50 border border-border/30">
                上下文: {model.contextWindow}
              </span>
              {model.multimodal && (
                <Badge variant="info" className="text-xs">
                  多模态
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {model.strengths.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary/10 hover:border-primary/30"
            asChild
          >
            <a href={`/models/${model.slug}`} className="flex items-center gap-1">
              查看详情
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-3"
            asChild
          >
            <a
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function truncateFreeTier(text: string): string {
  if (!text || text.length <= 28) return text;
  return text.slice(0, 26) + "...";
}
