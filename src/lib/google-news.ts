import { NewsItem } from "@/types";

/**
 * Fetch and parse Google News RSS feed for a keyword
 * RSS URL: https://news.google.com/rss/search?q={keyword}&hl=en
 */
export async function fetchGoogleNewsRSS(keyword: string): Promise<NewsItem[]> {
  const encodedKeyword = encodeURIComponent(keyword);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=en`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DataTracker/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    return parseRSSFeed(xml);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse RSS XML and extract news items
 */
function parseRSSFeed(xml: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Extract all <item> elements using regex (works in Node.js without DOM parser)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const source = extractTag(itemXml, "source");

    // Try to extract thumbnail from various sources
    let thumbnail = extractAttribute(itemXml, "media:content", "url");
    if (!thumbnail) {
      thumbnail = extractAttribute(itemXml, "media:thumbnail", "url");
    }
    if (!thumbnail) {
      thumbnail = extractAttribute(itemXml, "enclosure", "url");
    }
    // Extract from description HTML which often contains img tags
    if (!thumbnail) {
      const description = extractTag(itemXml, "description") || "";
      // Try various img src patterns
      const imgPatterns = [
        /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i,
        /src="(https:\/\/lh3\.googleusercontent\.com[^"]*)"/i,
        /src="(https:\/\/news\.google\.com\/api\/attachments[^"]*)"/i,
        /<img[^>]+src="([^"]+)"/i,
      ];
      for (const pattern of imgPatterns) {
        const match = description.match(pattern);
        if (match) {
          thumbnail = decodeHtmlEntities(match[1]);
          break;
        }
      }
    }

    if (title && link) {
      const publishedAt = pubDate || new Date().toISOString();

      // Only include articles from the last 24 hours
      const articleDate = new Date(publishedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff <= 24) {
        items.push({
          id: generateId(link),
          title: decodeHtmlEntities(title),
          source: source || extractDomain(link),
          url: link,
          publishedAt,
          thumbnail: thumbnail || undefined,
        });
      }
    }

    // Limit to 25 items
    if (items.length >= 25) break;
  }

  return items;
}

/**
 * Extract content between XML tags
 */
function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Handle regular content
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract attribute from self-closing or regular tag
 */
function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return "unknown";
  }
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Generate a simple ID from URL
 */
function generateId(url: string): string {
  return Buffer.from(url).toString("base64").slice(0, 20);
}
