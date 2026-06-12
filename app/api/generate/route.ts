import Replicate from "replicate";
import { NextRequest } from "next/server";

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

function buildPrompt(roomType: string, style: string): string {
  const room = ROOM_LABELS[roomType] ?? "room";
  const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.modern;
  return `A beautifully staged ${room}, ${styleDesc}, ${QUALITY_SUFFIX}`;
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
  const prompt = buildPrompt(roomType, style);

  try {
    // flux-dev img2img — sprawdzone w produkcji, zachowuje geometrię pokoju
    const output = await replicate.run("black-forest-labs/flux-dev", {
      input: {
        image: imageBase64,
        prompt,
        prompt_strength: 0.75,
        num_inference_steps: 35,
        guidance: 5,
        output_format: "jpg",
        output_quality: 90,
      },
    });

    // SDK v1.x zwraca FileOutput — wyciągamy URL
    const item = Array.isArray(output) ? output[0] : output;
    const url = typeof item === "string" ? item : (item as { url: () => string }).url();
    return Response.json({ imageUrl: url });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401) return Response.json({ error: "Nieprawidłowy token Replicate." }, { status: 401 });
    if (status === 402) return Response.json({ error: "Brak kredytów na koncie Replicate." }, { status: 402 });
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
