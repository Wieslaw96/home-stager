import Replicate from "replicate";
import { NextRequest } from "next/server";

export const maxDuration = 300;

const ROOM_LABELS: Record<string, string> = {
  living_room: "living room",
  bedroom: "bedroom",
  bathroom: "bathroom",
  kitchen: "kitchen",
  dining_room: "dining room",
  home_office: "home office",
};

const STYLE_PROMPTS: Record<string, string> = {
  modern:
    "ultra-modern minimalist design, clean lines, neutral palette, floor-to-ceiling windows, integrated LED lighting, floating cabinetry in matte lacquer, brushed steel fixtures, premium contemporary furniture",
  boho:
    "bohemian style, rattan and wicker furniture, macrame wall art, lush indoor plants, warm earth tones, layered rugs, eclectic vintage decor, warm ambient lighting, cozy and free-spirited",
  scandinavian:
    "Scandinavian minimalist design, light Scandinavian oak floors, white walls, hygge atmosphere, cozy linen textiles, birchwood shelving, frosted glass pendant lights, neutral warm tones, natural materials",
  industrial:
    "industrial loft style, exposed raw brick walls, hand-scraped dark walnut floors, matte black steel frame windows, Edison bulb pendant clusters, polished concrete surfaces, full-grain leather furniture, aged copper fixtures",
  classic:
    "classic elegant design, crown molding, coffered ceiling, rich velvet upholstery, traditional Chesterfield sofa, ornate brass fixtures, herringbone parquet flooring, warm sophisticated palette",
  japandi:
    "japandi style, Japanese-Scandinavian fusion, wabi-sabi aesthetics, muted natural tones, shoji screens, bonsai plants, tatami-inspired textures, low profile furniture, zen minimalism, natural linen and bamboo",
};

const QUALITY_SUFFIX =
  "photorealistic, high-end interior design, architectural digest quality, 8K ultra-sharp, beautiful lighting, award-winning interior photography";

const NEGATIVE_PROMPT =
  "low quality, blurry, deformed, watermark, text, logo, cartoon, anime, unrealistic, out of frame, bad proportions, ugly furniture, overexposed";

const MODEL = "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

function buildPrompt(roomType: string, style: string): string {
  const room = ROOM_LABELS[roomType] ?? "room";
  const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.modern;
  return `A beautifully staged ${room}, ${styleDesc}, ${QUALITY_SUFFIX}`;
}

function extractUrl(output: unknown): string {
  const item = Array.isArray(output) ? output[0] : output;
  return typeof item === "string" ? item : (item as { url: () => string }).url();
}

async function runWithRetry(
  replicate: Replicate,
  input: Parameters<Replicate["run"]>[1],
  retries = 3
): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      return await replicate.run(MODEL, input);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 && i < retries - 1) {
        // parse retry_after from error message body, e.g. "retry_after\":5"
        const match = (err instanceof Error ? err.message : "").match(/"retry_after"\s*:\s*(\d+)/);
        const wait = match ? parseInt(match[1]) * 1000 + 1000 : 15000;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: NextRequest) {
  const { imageBase64, roomType, style } = await req.json();

  if (!imageBase64 || !roomType || !style) {
    return Response.json({ error: "Brakujące parametry." }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Brak REPLICATE_API_TOKEN." }, { status: 500 });
  }

  const replicate = new Replicate({ auth: token });

  try {
    // Step 1: clear the room — remove all furniture, keep walls/floor/windows
    const emptyOutput = await runWithRetry(replicate, {
      input: {
        image: imageBase64,
        prompt: "empty unfurnished room, bare walls, clean floor, no furniture, no objects, no decorations, vacant room ready for staging",
        negative_prompt: "furniture, sofa, couch, bed, table, chairs, lamp, rug, curtains, plants, decorations, clutter, people",
        num_inference_steps: 50,
        guidance_scale: 10,
        prompt_strength: 0.9,
      },
    });
    const emptyUrl = extractUrl(emptyOutput);

    // Step 2: stage the empty room with the target style and room type
    const stagedOutput = await runWithRetry(replicate, {
      input: {
        image: emptyUrl,
        prompt: buildPrompt(roomType, style),
        negative_prompt: NEGATIVE_PROMPT,
        num_inference_steps: 50,
        guidance_scale: 7,
        prompt_strength: 0.85,
      },
    });
    const stagedUrl = extractUrl(stagedOutput);

    return Response.json({ imageUrl: stagedUrl });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401) return Response.json({ error: "Nieprawidłowy token Replicate." }, { status: 401 });
    if (status === 402) return Response.json({ error: "Brak kredytów na koncie Replicate." }, { status: 402 });
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
