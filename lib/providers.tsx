// 各厂商的强调色 HSL 值（用于圆点）
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

// 预设的边框颜色池（HSL 格式）
const borderColors = [
  'hsl(262 83% 58%)',   // 紫色 - 主色调
  'hsl(187 70% 40%)',   // 青色 - 强调色
  'hsl(45 90% 50%)',    // 黄色 - OpenAI
  'hsl(15 85% 50%)',    // 橙色 - Anthropic
  'hsl(210 75% 50%)',   // 蓝色 - Google
  'hsl(280 70% 60%)',   // 紫罗兰
  'hsl(330 70% 60%)',   // 粉红
  'hsl(150 60% 45%)',   // 绿色
  'hsl(30 85% 50%)',    // 橙黄 - Kuaishou
  'hsl(260 65% 55%)',   // 紫色 - DeepSeek
];

// 根据模型 ID 生成 deterministically 随机颜色（同一个模型总是显示相同颜色）
function getModelAccentColor(modelId: string): string {
  let hash = 0;
  for (let i = 0; i < modelId.length; i++) {
    hash = ((hash << 5) - hash) + modelId.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % borderColors.length;
  return borderColors[index];
}

export { providerDotClass, getModelAccentColor };
