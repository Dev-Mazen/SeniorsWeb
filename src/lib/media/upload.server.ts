import { createHash } from "crypto";

type UploadedMedia = {
  url: string;
  originalUrl?: string;
  bytes: number;
  width?: number;
  height?: number;
  provider: "cloudinary" | "imgbb";
  format?: string;
};

type Provider = "cloudinary" | "imgbb";

function resolveCloudName() {
  const direct = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (direct) return direct;
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) return "";
  // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const match = cloudinaryUrl.match(/@([^/?#]+)/);
  return match?.[1]?.trim() || "";
}

function resolveProvider(file: File): Provider {
  const preferred = process.env.MEDIA_UPLOAD_PROVIDER?.toLowerCase();
  if (preferred === "imgbb" && file.type.startsWith("image/")) return "imgbb";
  return "cloudinary";
}

function cloudinaryDeliverySegment(resourceType: "image" | "video") {
  const imageQuality = process.env.MEDIA_IMAGE_QUALITY?.trim() || "q_auto:good";
  const videoQuality = process.env.MEDIA_VIDEO_QUALITY?.trim() || "q_auto:good";
  const imageFormat = process.env.MEDIA_IMAGE_FORMAT?.trim() || "f_auto";
  const videoFormat = process.env.MEDIA_VIDEO_FORMAT?.trim() || "f_auto";

  if (resourceType === "video") {
    // Keep source quality perception high while reducing payload size.
    return `/upload/${videoFormat},${videoQuality},vc_auto/`;
  }
  return `/upload/${imageFormat},${imageQuality},dpr_auto,fl_progressive/`;
}

async function uploadToCloudinary(file: File, folder = "memories"): Promise<UploadedMedia> {
  const cloudName = resolveCloudName();
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const eager = resourceType === "video" ? "q_auto,f_auto" : undefined;
  const signingParams: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
  };
  if (eager) signingParams.eager = eager;
  // Cloudinary signatures require params sorted lexicographically by key.
  const signingParts = Object.keys(signingParams)
    .sort()
    .map((key) => `${key}=${signingParams[key]}`);
  const signature = createHash("sha1")
    .update(`${signingParts.join("&")}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  if (eager) formData.append("eager", eager);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const payload = await response.json();
  if (!response.ok || payload?.error) {
    const message = payload?.error?.message || "Cloudinary upload failed";
    if (message.toLowerCase().includes("invalid cloud_name")) {
      throw new Error(
        `Invalid CLOUDINARY_CLOUD_NAME "${cloudName}". Set the exact cloud name from your Cloudinary dashboard.`
      );
    }
    throw new Error(message);
  }

  const secureUrl = payload.secure_url as string;
  const optimizedSegment = cloudinaryDeliverySegment(resourceType);
  const optimizedUrl = secureUrl.replace("/upload/", optimizedSegment);

  return {
    url: optimizedUrl,
    originalUrl: secureUrl,
    bytes: Number(payload.bytes || file.size || 0),
    width: payload.width ? Number(payload.width) : undefined,
    height: payload.height ? Number(payload.height) : undefined,
    provider: "cloudinary",
    format: payload.format,
  };
}

async function uploadToImgbb(file: File): Promise<UploadedMedia> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) throw new Error("IMGBB_API_KEY is missing");
  if (!file.type.startsWith("image/")) {
    throw new Error("ImgBB supports image uploads only");
  }

  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const formData = new FormData();
  formData.append("image", b64);
  formData.append("name", file.name);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
    method: "POST",
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "ImgBB upload failed");
  }

  return {
    url: payload.data.url,
    bytes: Number(payload.data.size || file.size || 0),
    width: payload.data.width ? Number(payload.data.width) : undefined,
    height: payload.data.height ? Number(payload.data.height) : undefined,
    provider: "imgbb",
    format: file.type,
  };
}

export async function uploadMedia(file: File, folder?: string): Promise<UploadedMedia> {
  const provider = resolveProvider(file);
  if (provider === "imgbb") return uploadToImgbb(file);
  try {
    return await uploadToCloudinary(file, folder);
  } catch (error) {
    // Optional failover for images if Cloudinary credentials/config are wrong.
    if (file.type.startsWith("image/") && process.env.IMGBB_API_KEY) {
      return uploadToImgbb(file);
    }
    throw error;
  }
}
