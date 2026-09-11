import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 500 });

  const formData = await request.formData();
  const many = formData.getAll('images').filter((value): value is File => value instanceof File);
  const single = formData.get('image');
  const files = many.length ? many : single instanceof File ? [single] : [];

  if (!files.length) return NextResponse.json({ error: 'Upload at least one photo of the car.' }, { status: 400 });
  if (files.length > 3) return NextResponse.json({ error: 'Upload no more than three photos per scan.' }, { status: 400 });
  if (files.some((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
    return NextResponse.json({ error: 'Use image files that are 10 MB or smaller.' }, { status: 400 });
  }

  const images = await Promise.all(files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return { type: 'image_url', image_url: { url: `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}` } };
  }));

  const prompt = `Identify the die-cast car from all supplied images. Check blur, glare, darkness, multiple cars, hidden details, packaging text, visible graphics, wheels, and underside/base text. Do not invent an exact year, series, rarity, or Treasure Hunt status without visible evidence. Return ONLY valid JSON: {"name":"string","series":"string","year":number|null,"toy_number":"string","rarity":"Mainline|Premium|Silver Series|Treasure Hunt|Super Treasure Hunt|RLC|Convention Exclusive|Other","confidence":number,"status":"high_confidence|possible_match|needs_more_photos","reason":"string","photo_quality":{"usable":boolean,"issues":["string"]},"recommended_next_photo":"string","alternatives":[{"name":"string","series":"string","year":number|null,"reason":"string"}]}. Use high_confidence only at 85 or higher, possible_match at 55-84, and needs_more_photos below 55 or when images are unusable. Return no more than three alternatives.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...images] }],
        max_tokens: 700,
      }),
    });
    if (!response.ok) return NextResponse.json({ error: 'The AI vision request failed.', detail: await response.text() }, { status: 502 });
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices?.[0]?.message?.content || '{}'));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error identifying the car.' }, { status: 500 });
  }
}
