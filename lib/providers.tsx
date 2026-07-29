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

export { providerAccentClass, providerDotClass };
