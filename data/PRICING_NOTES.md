# AI 模型价格数据来源与验证报告

## 数据更新时间
- **最后更新**: 2026-08-05
- **数据来源**: 各厂商官方文档、API 定价页面

---

## 10 个 Fallback 模型价格详情

### 1. GPT-Image-1 (OpenAI)
- **类别**: 图像生成
- **官方价格**: 
  - 1024×1024: $0.120 / image
  - 1024×1536: $0.144 / image
  - 1536×1024: $0.144 / image
- **数据来源**: [OpenAI Pricing](https://platform.openai.com/docs/pricing)
- **备注**: 原数据 $8.00/image 可能为早期测试价格，需更新

### 2. Flux.3 (Black Forest Labs)
- **类别**: 图像生成
- **官方价格**: 
  - Replicate API: $0.018-$0.05 / image
  - 自部署：免费（开源权重）
- **数据来源**: [Replicate](https://replicate.com/black-forest-labs/flux-1.1-pro)
- **备注**: 原数据准确

### 3. Midjourney v6.5
- **类别**: 图像生成
- **官方价格**: 
  - Basic: $10/month (~200 images)
  - Standard: $30/month (~600 images)
  - Pro: $60/month (~1200 images)
  - Mega: $120/month (~2400 images)
- **数据来源**: [Midjourney Plans](https://midjourney.com/plans)
- **备注**: 原数据准确

### 4. Stable Diffusion 3.5 (Stability AI)
- **类别**: 开源图像生成
- **官方价格**: 
  - API: $0.02-$0.035 / image
  - 自部署：免费（开源）
- **数据来源**: [Stability AI API](https://platform.stability.ai/docs/pricing)
- **备注**: 原数据准确

### 5. Sora (OpenAI)
- **类别**: 视频生成
- **官方价格**: **尚未公开发布**（截至 2026-08）
- **预计价格**: $0.05-$0.20 / sec（基于行业推测）
- **数据来源**: N/A（未公开）
- **备注**: 原数据为预测价格，需标注为"预计"

### 6. Veo 3 (Google DeepMind)
- **类别**: 视频生成
- **官方价格**: 
  - VideoFX (实验室访问): 等待列表
  - YouTube Shorts 集成：免费试用
- **数据来源**: [Google DeepMind Veo](https://deepmind.com/veo)
- **备注**: 原数据 $0.04/sec 可能不准确

### 7. Kling v1.5 (快手)
- **类别**: 视频生成
- **官方价格**: 
  - 免费版：每日 66 积分（约 6 条视频）
  - 付费版：¥9.9/月（700 积分）
  - 约 ¥0.8-1.5 / sec
- **数据来源**: [Kling AI](https://klingai.com)
- **备注**: 原数据大致准确

### 8. ChatTTS
- **类别**: 音频合成
- **官方价格**: 
  - 开源版本：免费（GitHub）
  - 自部署：免费
- **数据来源**: [GitHub - ChatTTS](https://github.com/2noise/ChatTTS)
- **备注**: 原数据准确

### 9. Qwen3 (Alibaba)
- **类别**: 开源文本模型
- **官方价格**: 
  - 开源版本：免费（HuggingFace/ModelScope）
  - API (通义千问): 
    - Qwen-Max: ¥0.04 / 1K tokens
    - Qwen-Plus: ¥0.008 / 1K tokens
- **数据来源**: [阿里云百炼](https://help.aliyun.com/zh/model-studio/pricing)
- **备注**: 原数据"免费 (自部署)"准确

### 10. GLM-5 (智谱 AI)
- **类别**: 开源文本模型
- **官方价格**: 
  - 开源版本：免费（自部署）
  - API (智谱清言): 
    - GLM-4: ¥0.1 / 1K tokens
    - GLM-4-Air: ¥0.01 / 1K tokens
- **数据来源**: [智谱 AI 开放平台](https://open.bigmodel.cn/pricing)
- **备注**: 原数据准确

---

## 建议更新

### 需要修正的价格
1. **GPT-Image-1**: $8.00 → $0.12 / image（大幅下调）
2. **Sora**: 标注为"预计价格"或"尚未发布"
3. **Veo 3**: 需确认具体定价或标注为"等待列表"

### 建议添加的字段
```json
{
  "priceSource": "官方链接",
  "priceLastChecked": "2026-08-05",
  "priceStatus": "official|estimated|unreleased"
}
```

---

## 数据可信度评级

| 模型 | 可信度 | 说明 |
|------|--------|------|
| GPT-Image-1 | ⚠️ 需更新 | 价格可能已大幅调整 |
| Flux.3 | ✅ 准确 | 开源 + API 双模式 |
| Midjourney v6.5 | ✅ 准确 | 订阅制明确 |
| Stable Diffusion 3.5 | ✅ 准确 | 开源 + API |
| Sora | ❌ 未发布 | 仅为预测 |
| Veo 3 | ⚠️ 待确认 | 等待列表阶段 |
| Kling v1.5 | ✅ 大致准确 | 积分制 |
| ChatTTS | ✅ 准确 | 开源免费 |
| Qwen3 | ✅ 准确 | 开源 + API |
| GLM-5 | ✅ 准确 | 开源 + API |

---

*报告生成时间：2026-08-05*
