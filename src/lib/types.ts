export interface Skill {
  id: string;
  name: string;
  description: string;
  content?: string;
  repoUrl: string;
  rawUrl: string;
  stars: number;
  updatedAt: string;
  language: "ja" | "en" | "unknown";
  categories: string[];
  installCommand: string;
}

export interface SearchOptions {
  sortBy?: "stars" | "updatedAt" | "relevance";
  language?: "ja" | "en";
  category?: string;
}

export interface CrawlResult {
  crawledAt: string;
  total: number;
  errors?: number;
  skills: Skill[];
}
