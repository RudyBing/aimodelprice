import { Zap, Palette, Video, Mic, Code2, Sparkles, Globe } from 'lucide-react';
import type { ModelCategory } from '@/data/models';
import type { ReactNode } from 'react';

export const categoryIcons: Record<ModelCategory, ReactNode> = {
  text: <Zap className="h-3.5 w-3.5" />,
  image: <Palette className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  audio: <Mic className="h-3.5 w-3.5" />,
  code: <Code2 className="h-3.5 w-3.5" />,
  multimodal: <Sparkles className="h-3.5 w-3.5" />,
  'open-source': <Globe className="h-3.5 w-3.5" />,
};

export const categoryLabels: Record<ModelCategory, string> = {
  text: '文本模型',
  image: '图像生成',
  video: '视频生成',
  audio: '音频处理',
  code: '代码助手',
  multimodal: '多模态',
  'open-source': '开源模型',
};
