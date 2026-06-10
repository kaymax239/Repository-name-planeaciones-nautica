export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing image URL", { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new Response("Unsupported image URL protocol", { status: 400 });
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      "User-Agent": "planeaciones-nautica/1.0",
    },
  });

  if (!response.ok) {
    return new Response("Unable to fetch image", { status: response.status });
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    return new Response("URL did not return an image", { status: 415 });
  }

  const imageBuffer = await response.arrayBuffer();

  return new Response(imageBuffer, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType,
    },
  });
}
