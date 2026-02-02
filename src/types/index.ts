// Topic from database
export interface Topic {
  id: number;
  keyword: string;
  createdAt: Date;
  updatedAt: Date;
}

// News item from Google News RSS feed
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  thumbnail?: string;
}

// Reddit post from Reddit JSON API
export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  url: string;
  createdAt: string;
  commentsCount: number;
}

// API response types
export interface NewsResponse {
  items: NewsItem[];
  error?: string;
}

export interface RedditResponse {
  items: RedditPost[];
  error?: string;
}

export interface TopicsResponse {
  topics: Topic[];
  error?: string;
}
