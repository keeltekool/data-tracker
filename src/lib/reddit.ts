import { RedditPost } from "@/types";

/**
 * Fetch Reddit posts for a keyword using public RSS feed
 * RSS is often less restricted than JSON API on cloud servers
 * URL: https://www.reddit.com/search.rss?q={keyword}&sort=new&limit=25
 */
export async function fetchRedditPosts(keyword: string, maxHours: number = 24): Promise<RedditPost[]> {
  const encodedKeyword = encodeURIComponent(keyword);
  const rssUrl = `https://www.reddit.com/search.rss?q=${encodedKeyword}&sort=new&limit=25`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit RSS failed: ${response.status}`);
    }

    const xml = await response.text();
    return parseRedditRSS(xml, maxHours);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse Reddit RSS feed (Atom format) and extract posts
 */
function parseRedditRSS(xml: string, maxHours: number = 24): RedditPost[] {
  const posts: RedditPost[] = [];

  // Reddit RSS uses Atom format with <entry> elements
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];

    const title = extractTag(entryXml, "title");
    const link = extractAttribute(entryXml, "link", "href");
    const updated = extractTag(entryXml, "updated");
    const id = extractTag(entryXml, "id");

    // Extract subreddit from category term
    const subreddit = extractAttribute(entryXml, "category", "term") || "reddit";

    if (title && link) {
      const createdAt = updated || new Date().toISOString();

      // Only include posts within the time filter
      const postDate = new Date(createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff <= maxHours) {
        posts.push({
          id: id || generateId(link),
          title: decodeHtmlEntities(title),
          subreddit: subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`,
          score: 0, // RSS doesn't include score
          url: link,
          createdAt,
          commentsCount: 0, // RSS doesn't include comment count
        });
      }
    }

    if (posts.length >= 25) break;
  }

  return posts;
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
 * Extract attribute from tag
 */
function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
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
 * Generate a unique ID from URL using hash
 */
function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `reddit-${Math.abs(hash).toString(36)}`;
}
