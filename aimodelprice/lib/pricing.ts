import type { AIModel } from '@/data/models';

export function getPricingInput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || '';
  return pricing.input;
}

export function getPricingOutput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || '';
  return pricing.output;
}

export function getPricingUnit(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.unit || '';
  return pricing.unit || '';
}

export function getPriceInputNum(pricing: AIModel['pricing']): number {
  const raw = Array.isArray(pricing) ? (pricing[0]?.input || '') : pricing.input;
  const match = String(raw).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

export function getFreeTierTag(text: string): { tag: string; full: string } {
  if (!text || text === '无') return { tag: '无', full: '无' };
  const parts = text.split(/[；;]/);
  const short = parts[0].trim();
  return { tag: short, full: text };
}
