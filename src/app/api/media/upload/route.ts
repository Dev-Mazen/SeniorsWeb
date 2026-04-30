import { uploadMedia } from "@/lib/media/upload.server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = (
      form.get("folder")?.toString() ||
      process.env.MEDIA_UPLOAD_FOLDER ||
      "memories"
    ).trim();

    if (!(file instanceof File)) {
      return Response.json({ error: "File is required" }, { status: 400 });
    }

    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      return Response.json({ error: "Max file size is 50MB" }, { status: 400 });
    }

    const uploaded = await uploadMedia(file, folder);
    return Response.json(uploaded);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
