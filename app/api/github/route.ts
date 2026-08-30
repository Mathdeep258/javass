import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Gitalk 默认发 JSON，统一解析成表单参数再转给 GitHub，兼容性更好
    let body: Record<string, string> = {};
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text).entries());
    }

    const params = new URLSearchParams();
    for (const key of ['client_id', 'client_secret', 'code', 'redirect_uri']) {
      if (body[key]) params.append(key, body[key]);
    }

    // 2. 由我们自己的服务器在后台发给 GitHub，绕过浏览器的跨域拦截
    const githubRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    // 3. 把 GitHub 的成功响应原封不动地还给前端 Gitalk
    const data = await githubRes.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    console.error('代理请求失败:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
