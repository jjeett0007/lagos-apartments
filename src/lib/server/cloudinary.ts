import "server-only";
import { createHash } from "node:crypto";
import { ApiError } from "./api";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export type CloudinaryUploadOptions = {
  file: File | Blob | Buffer;
  filename?: string;
  folder?: string;
  tags?: string[];
};

export type CloudinaryUploadResult = {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
};

/**
 * Resolves Cloudinary configuration from either:
 * 1. CLOUDINARY_URL (e.g. cloudinary://<api_key>:<api_secret>@<cloud_name>)
 * 2. Separate env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  // Check CLOUDINARY_URL first
  const rawUrl = process.env.CLOUDINARY_URL?.trim();
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "cloudinary:" && parsed.username && parsed.password && parsed.hostname) {
        return {
          cloudName: decodeURIComponent(parsed.hostname),
          apiKey: decodeURIComponent(parsed.username),
          apiSecret: decodeURIComponent(parsed.password),
        };
      }
    } catch {
      // Invalid URL format, fall through to separate env vars
    }
  }

  // Check separate environment variables
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    ""
  ).trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  return null;
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

/**
 * Uploads an image buffer or file to Cloudinary with authenticated SHA-1 signature.
 */
export async function uploadToCloudinary(
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new ApiError(
      503,
      "Cloudinary credentials are not configured in your environment (.env)."
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = options.folder || "eko-space/listings";

  // Build sorted parameter map for Cloudinary signature
  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
  };

  if (options.tags && options.tags.length > 0) {
    paramsToSign.tags = options.tags.join(",");
  }

  // Sort keys alphabetically and format as key=value&key2=value2
  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join("&");
  const signature = createHash("sha1")
    .update(`${serialized}${config.apiSecret}`)
    .digest("hex");

  const form = new FormData();

  if (Buffer.isBuffer(options.file)) {
    const filename = options.filename || "upload.jpg";
    const uint8 = new Uint8Array(options.file);
    const blob = new Blob([uint8]);
    form.append("file", blob, filename);
  } else {
    form.append("file", options.file, options.filename || "upload.jpg");
  }

  form.append("folder", folder);
  form.append("timestamp", timestamp);
  form.append("api_key", config.apiKey);
  form.append("signature", signature);

  if (paramsToSign.tags) {
    form.append("tags", paramsToSign.tags);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    config.cloudName
  )}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with HTTP ${response.status}`;
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      if (errJson?.error?.message) {
        errorMessage = errJson.error.message;
      }
    } catch {
      // Failed to parse JSON error
    }
    throw new ApiError(502, `Cloudinary upload error: ${errorMessage}`);
  }

  const data = (await response.json()) as {
    url: string;
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
  };

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    createdAt: data.created_at,
  };
}

/**
 * Deletes an image from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const config = getCloudinaryConfig();
  if (!config) return false;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", timestamp);
  form.append("api_key", config.apiKey);
  form.append("signature", signature);

  try {
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      config.cloudName
    )}/image/destroy`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
