// app/api/chat/route.ts
import { siteConfig } from '../../../siteConfig';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
    if (!apiKey) {
      console.error("❌ 找不到 DEEPSEEK_API_KEY");
      return new Response(JSON.stringify({ error: "Key missing" }), { status: 500 });
    }

    const modelId = siteConfig.geminiConfig.modelId || 'deepseek-chat';
    const url = 'https://api.deepseek.com/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: siteConfig.geminiConfig.systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: siteConfig.geminiConfig.maxOutputTokens,
        temperature: siteConfig.geminiConfig.temperature,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🚨 DeepSeek 拒绝了请求:", JSON.stringify(data));
      return new Response(JSON.stringify({
        error: `模型拒绝访问: ${response.status}`,
        details: data.error?.message || data.message || "未知错误"
      }), { status: response.status });
    }

    const reply = data.choices?.[0]?.message?.content || "本喵现在不想理你喵...";

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("🔥 运行时崩溃:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Ready", model: "DeepSeek" }), { status: 200 });
}
