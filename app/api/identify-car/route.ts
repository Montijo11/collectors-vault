import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No image was uploaded.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mime = file.type || 'image/jpeg';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  "You are identifying a die-cast toy car (Hot Wheels, Matchbox, or similar) from a photo. " +
                  "Respond with ONLY a strict JSON object, no markdown, no explanation, using exactly these keys: " +
                  '{"name": string (casting name, e.g. "68 Camaro"), ' +
                  '"series": string (the line/series if visible on packaging, else your best guess), ' +
                  '"year": number (four digit year, your best guess if not visible), ' +
                  '"toy_number": string (SKU/toy number printed on packaging, empty string if not visible), ' +
                  '"rarity": string (must be exactly one of: Mainline, Premium, Silver Series, Treasure Hunt, Super Treasure Hunt, RLC, Convention Exclusive, Other)}',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: 'The AI vision request failed.', detail }, { status: 502 });
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Could not parse the AI response.', raw }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error identifying the car.' },
      { status: 500 }
    );
  }
}
