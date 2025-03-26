import got from "got";
import createMetascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import { NextResponse } from "next/server";

const metascraper = createMetascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlString = searchParams.get("url");

  if (!urlString) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const { body: html, url: finalUrl } = await got(urlString, {
      followRedirect: true, // Explicitly follow redirects
      maxRedirects: 20, // Handle long redirect chains
      cache: false, // Avoid keyv issues
      headers: { "User-Agent": "Mozilla/5.0" }, // Mimic browser if needed
    });

    const metadata = await metascraper({ html, url: finalUrl });
    const response = {
      title: metadata.title || "No title found",
      description: metadata.description || "No description found",
      favicon:
        metadata.image ||
        `https://www.google.com/s2/favicons?domain=${
          new URL(finalUrl).hostname
        }`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata", details: error },
      { status: 500 }
    );
  }
}
