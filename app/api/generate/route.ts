import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/stripe";

export const maxDuration = 300;

const DECOR8_BASE = "https://api.decor8.ai";
const STORAGE_BUCKET = "staging-inputs";

export const ROOM_MAP: Record<string, string> = {
  living_room: "livingroom", bedroom: "bedroom", bathroom: "bathroom",
  kitchen: "kitchen", dining_room: "diningroom", home_office: "office",
  kids_room: "kidsroom", family_room: "familyroom", reading_nook: "readingnook",
  sunroom: "sunroom", walk_in_closet: "walkincloset", mudroom: "mudroom",
  toy_room: "toyroom", foyer: "foyer", powder_room: "powderroom",
  laundry_room: "laundryroom", gym: "gym", basement: "basement",
  garage: "garage", balcony: "balcony", home_bar: "homebar",
  study_room: "study_room", front_porch: "front_porch", back_porch: "back_porch",
  back_patio: "back_patio", open_plan: "openplan", boardroom: "boardroom",
  meeting_room: "meetingroom", open_workspace: "openworkspace", private_office: "privateoffice",
};

function decor8Auth() {
  const key = process.env.DECOR8_API_KEY;
  if (!key) throw new Error("Brak DECOR8_API_KEY.");
  return { Authorization: `Bearer ${key}` };
}

async function decor8Json(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${DECOR8_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...decor8Auth() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Decor8 ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  return res.json();
}

async function decor8Form(endpoint: string, fields: Record<string, string>): Promise<unknown> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await fetch(`${DECOR8_BASE}/${endpoint}`, {
    method: "POST",
    headers: decor8Auth(),
    body: fd,
  });
  if (!res.ok) throw new Error(`Decor8 ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  return res.json();
}

async function decor8Multipart(endpoint: string, fd: FormData): Promise<unknown> {
  const res = await fetch(`${DECOR8_BASE}/${endpoint}`, {
    method: "POST",
    headers: decor8Auth(),
    body: fd,
  });
  if (!res.ok) throw new Error(`Decor8 ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  return res.json();
}

function extractUrl(data: unknown): string {
  const d = data as Record<string, unknown>;
  const info = d?.info as Record<string, unknown> | undefined;
  if (info) {
    const images = info?.images as Array<{ url: string }> | undefined;
    if (images?.[0]?.url) return images[0].url;
    const img = info?.image as Record<string, unknown> | undefined;
    if (typeof img?.url === "string") return img.url;
  }
  const details = d?.details as Record<string, unknown> | undefined;
  if (typeof details?.primed_image_url === "string") return details.primed_image_url;
  if (typeof d?.new_image_url === "string") return d.new_image_url;
  if (typeof d?.image_url === "string") return d.image_url;
  throw new Error(`Decor8 nie zwróciło URL obrazu. Odpowiedź: ${JSON.stringify(d).slice(0, 200)}`);
}

async function uploadTemp(dataUri: string, userId: string): Promise<{ url: string; path: string }> {
  const m = dataUri.match(/^data:image\/(\w+);base64,([\s\S]+)$/);
  if (!m) throw new Error("Nieprawidłowy format obrazu.");
  const subtype = m[1] === "jpg" ? "jpeg" : m[1];
  const ext = subtype === "jpeg" ? "jpg" : subtype;
  const buffer = Buffer.from(m[2], "base64");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, buffer, { contentType: `image/${subtype}`, upsert: false });
  if (error) throw new Error(`Upload błąd: ${error.message}`);
  return { url: admin.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl, path };
}

async function uploadBuffer(buffer: Buffer, ext: string, userId: string): Promise<string> {
  const path = `${userId}/result-${crypto.randomUUID()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, buffer, { contentType: `image/${ext}`, upsert: false });
  if (error) throw new Error(`Upload result błąd: ${error.message}`);
  return admin.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function deleteTemp(path: string) {
  try { await createAdminClient().storage.from(STORAGE_BUCKET).remove([path]); } catch { /* best effort */ }
}

function yearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    mode, imageBase64,
    roomType, style, colorScheme, specialityDecor,
    wallColor, cabinetColor,
    skyType, scaleFactor, renderType,
    yardType, gardenStyle,
  } = body;

  if (!mode) return Response.json({ error: "Brak trybu." }, { status: 400 });
  if (mode !== "inspirational" && !imageBase64) return Response.json({ error: "Brak obrazu." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Wymagane logowanie." }, { status: 401 });

  const { data: sub } = await supabase.from("subscriptions").select("plan,status")
    .eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (!sub) return Response.json({ error: "Brak aktywnej subskrypcji.", code: "no_subscription" }, { status: 403 });

  const limit = PLANS[sub.plan as keyof typeof PLANS]?.generations ?? 0;
  if (limit !== Infinity) {
    const ym = yearMonth();
    const { data: usage } = await supabase.from("usage").select("count")
      .eq("user_id", user.id).eq("year_month", ym).maybeSingle();
    if ((usage?.count ?? 0) >= limit)
      return Response.json({ error: "Wyczerpano limit generacji.", code: "limit_reached", limit, used: usage?.count ?? 0 }, { status: 403 });
  }

  let tempPath: string | null = null;

  try {
    let imageUrl: string | undefined;
    if (imageBase64) {
      const uploaded = await uploadTemp(imageBase64, user.id);
      imageUrl = uploaded.url;
      tempPath = uploaded.path;
    }

    let resultUrl: string;

    switch (mode) {
      case "staging": {
        const data = await decor8Json("generate_designs_for_room", {
          input_image_url: imageUrl,
          room_type: ROOM_MAP[roomType] ?? "livingroom",
          design_style: style ?? "modern",
          num_images: 1,
          scale_factor: 2,
          ...(colorScheme && colorScheme !== "COLOR_SCHEME_0" ? { color_scheme: colorScheme } : {}),
          ...(specialityDecor && specialityDecor !== "SPECIALITY_DECOR_0" ? { speciality_decor: specialityDecor } : {}),
        });
        resultUrl = extractUrl(data);
        break;
      }

      case "inspirational": {
        const data = await decor8Json("generate_inspirational_designs", {
          room_type: ROOM_MAP[roomType] ?? "livingroom",
          design_style: style ?? "modern",
          num_images: 1,
          ...(colorScheme && colorScheme !== "COLOR_SCHEME_0" ? { color_scheme: colorScheme } : {}),
          ...(specialityDecor && specialityDecor !== "SPECIALITY_DECOR_0" ? { speciality_decor: specialityDecor } : {}),
        });
        resultUrl = extractUrl(data);
        break;
      }

      case "prime_walls": {
        const data = await decor8Form("prime_walls_for_room", { input_image_url: imageUrl! });
        resultUrl = extractUrl(data);
        break;
      }

      case "remove_objects": {
        const data = await decor8Json("remove_objects_from_room", { input_image_url: imageUrl });
        resultUrl = extractUrl(data);
        break;
      }

      case "wall_color": {
        if (!wallColor) throw new Error("Brak koloru ściany.");
        const data = await decor8Json("change_wall_color", { input_image_url: imageUrl, wall_color_hex_code: wallColor });
        resultUrl = extractUrl(data);
        break;
      }

      case "cabinet_color": {
        if (!cabinetColor) throw new Error("Brak koloru szafek.");
        const data = await decor8Json("change_kitchen_cabinets_color", { input_image_url: imageUrl, cabinet_color_hex_code: cabinetColor });
        resultUrl = extractUrl(data);
        break;
      }

      case "remodel_kitchen": {
        const data = await decor8Json("remodel_kitchen", {
          input_image_url: imageUrl,
          design_style: style ?? "modern",
          num_images: 1,
          scale_factor: 1,
        });
        resultUrl = extractUrl(data);
        break;
      }

      case "remodel_bathroom": {
        const data = await decor8Json("remodel_bathroom", {
          input_image_url: imageUrl,
          design_style: style ?? "modern",
          num_images: 1,
          scale_factor: 1,
        });
        resultUrl = extractUrl(data);
        break;
      }

      case "upscale": {
        const m = imageBase64.match(/^data:image\/(\w+);base64,([\s\S]+)$/);
        if (!m) throw new Error("Nieprawidłowy format obrazu.");
        const subtype = m[1] === "jpg" ? "jpeg" : m[1];
        const ext = subtype === "jpeg" ? "jpg" : subtype;
        const buffer = Buffer.from(m[2], "base64");
        const fd = new FormData();
        fd.append("input_image", new Blob([buffer], { type: `image/${subtype}` }), `image.${ext}`);
        fd.append("scale_factor", String(scaleFactor ?? 2));
        const data = await decor8Multipart("upscale_image", fd) as Record<string, unknown>;
        const info = data?.info as Record<string, unknown> | undefined;
        const b64 = info?.upscaled_image as string | undefined;
        if (!b64) throw new Error("Decor8 nie zwróciło upscaled_image.");
        resultUrl = await uploadBuffer(Buffer.from(b64, "base64"), ext, user.id);
        break;
      }

      case "sketch_3d": {
        const data = await decor8Json("sketch_to_3d_render", {
          input_image_url: imageUrl,
          design_style: style ?? "modern",
          num_images: 1,
          scale_factor: 2,
          render_type: renderType ?? "perspective",
        });
        resultUrl = extractUrl(data);
        break;
      }

      case "sky_replace": {
        if (!skyType) throw new Error("Brak typu nieba.");
        const data = await decor8Json("replace_sky_behind_house", { input_image_url: imageUrl, sky_type: skyType });
        resultUrl = extractUrl(data);
        break;
      }

      case "landscaping": {
        const data = await decor8Json("generate_landscaping_designs", {
          input_image_url: imageUrl,
          yard_type: yardType ?? "Backyard",
          garden_style: gardenStyle ?? "Garden",
          num_images: 1,
        });
        resultUrl = extractUrl(data);
        break;
      }

      default:
        return Response.json({ error: `Nieznany tryb: ${mode}` }, { status: 400 });
    }

    const ym = yearMonth();
    await supabase.from("usage").upsert(
      { user_id: user.id, year_month: ym, count: 1 },
      { onConflict: "user_id,year_month", ignoreDuplicates: false }
    );
    await supabase.rpc("increment_usage", { p_user_id: user.id, p_year_month: ym });

    return Response.json({ imageUrl: resultUrl });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  } finally {
    if (tempPath) await deleteTemp(tempPath);
  }
}
