import got from "got";
import createMetascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import { NextResponse } from "next/server";
import { URL } from "url";

const metascraper = createMetascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
]);

// Comprehensive URL validation configuration
const URL_VALIDATION_CONFIG = {
  allowedProtocols: ["http:", "https:"],
  blockedDomains: [
    "localhost",
    "127.0.0.1",
    "::1",
    // Add any other domains you want to block
  ],
  maxUrlLength: 2048, // Maximum URL length
  allowedTlds: [
    // Common TLDs, can be expanded
    ".com",
    ".org",
    ".net",
    ".edu",
    ".gov",
    ".co",
    ".io",
    ".ai",
    ".cloud",
    ".dev",
    ".space",
    // Add country-specific TLDs as needed
  ],
};

// Comprehensive URL validation function
function validateUrl(urlString: string): boolean {
  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(urlString);

    // Check URL length
    if (decodedUrl.length > URL_VALIDATION_CONFIG.maxUrlLength) {
      console.warn(`URL exceeds maximum length: ${decodedUrl.length}`);
      return false;
    }

    // Parse the URL
    const parsedUrl = new URL(decodedUrl);

    // Check protocol
    if (!URL_VALIDATION_CONFIG.allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`Disallowed protocol: ${parsedUrl.protocol}`);
      return false;
    }

    // Check for blocked domains
    if (
      URL_VALIDATION_CONFIG.blockedDomains.some((domain) =>
        parsedUrl.hostname.includes(domain)
      )
    ) {
      console.warn(`Blocked domain: ${parsedUrl.hostname}`);
      return false;
    }

    // TLD validation
    const tldValid = URL_VALIDATION_CONFIG.allowedTlds.some((tld) =>
      parsedUrl.hostname.endsWith(tld)
    );
    if (!tldValid && URL_VALIDATION_CONFIG.allowedTlds.length > 0) {
      console.warn(`Disallowed TLD: ${parsedUrl.hostname}`);
      return false;
    }

    // Additional security checks
    if (parsedUrl.username || parsedUrl.password) {
      console.warn("URL contains credentials");
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Invalid URL", error);
    return false;
  }
}

// Sanitize URL to remove potential security risks
function sanitizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);

    // Remove any potentially dangerous query parameters
    const sanitizedSearchParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      // Basic sanitization - remove any script-like content
      const sanitizedValue = value
        .replace(/<script>.*?<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/onerror=/gi, "");

      // Only add non-empty, seemingly safe parameters
      if (
        sanitizedValue &&
        !/(script|javascript|onerror)/i.test(sanitizedValue)
      ) {
        sanitizedSearchParams.append(key, sanitizedValue);
      }
    });

    // Reconstruct URL with sanitized search params
    url.search = sanitizedSearchParams.toString();

    // Remove credentials
    url.username = "";
    url.password = "";

    return url.toString();
  } catch (error) {
    console.warn("URL sanitization failed", error);
    return urlString;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlString = searchParams.get("url");

  if (!urlString) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  // Validate URL before processing
  if (!validateUrl(urlString)) {
    return NextResponse.json(
      {
        error: "Invalid or potentially unsafe URL",
        details: "The provided URL failed security checks",
      },
      { status: 400 }
    );
  }

  try {
    // Sanitize the URL
    const sanitizedUrlString = sanitizeUrl(urlString);

    const { body: html, url: finalUrl } = await got(sanitizedUrlString, {
      followRedirect: true,
      maxRedirects: 5, // Reduced to prevent potential abuse
      cache: false,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: { request: 10000 }, // 10 seconds timeout
      retry: {
        limit: 2,
        methods: ["GET"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
    });

    const metadata = await metascraper({ html, url: finalUrl });

    const response = {
      title: metadata.title || "No title found",
      description: metadata.description || "No description found",
      favicon: metadata.image || getFaviconUrl(finalUrl),
      finalUrl: finalUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metadata",
        details: error instanceof Error ? error.message : "Unknown error",
        originalUrl: urlString,
      },
      { status: 500 }
    );
  }
}

// Favicon and other helper functions remain the same as in previous example
function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
  } catch {
    return "https://www.google.com/favicon.ico";
  }
}