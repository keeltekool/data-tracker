import { RedditPost } from "@/types";

/**
 * Fetch Reddit posts for a keyword using public JSON API
 * URL: https://www.reddit.com/search.json?q={keyword}&sort=new&limit=25
 */
export async function fetchRedditPosts(keyword: string): Promise<RedditPost[]> {
  const encodedKeyword = encodeURIComponent(keyword);
  const apiUrl = `https://www.reddit.com/search.json?q=${encodedKeyword}&sort=new&limit=25`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        // Reddit requires a browser-like User-Agent from cloud servers
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API failed: ${response.status}`);
    }

    const data = await response.json();
    return parseRedditResponse(data);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse Reddit JSON response and extract posts
 */
function parseRedditResponse(data: RedditAPIResponse): RedditPost[] {
  if (!data?.data?.children) {
    return [];
  }

  return data.data.children
    .filter((child) => child.kind === "t3") // t3 = link/post
    .map((child) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit_name_prefixed || `r/${post.subreddit}`,
        score: post.score,
        url: `https://reddit.com${post.permalink}`,
        createdAt: new Date(post.created_utc * 1000).toISOString(),
        commentsCount: post.num_comments,
      };
    })
    .slice(0, 25);
}

// Reddit API response types
interface RedditAPIResponse {
  data: {
    children: Array<{
      kind: string;
      data: {
        id: string;
        title: string;
        subreddit: string;
        subreddit_name_prefixed: string;
        score: number;
        permalink: string;
        created_utc: number;
        num_comments: number;
      };
    }>;
  };
}
