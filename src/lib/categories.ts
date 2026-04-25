export interface SubCategory {
  name: string;
  keywords: string[];
}

export interface Category {
  name: string;
  icon: string;
  keywords: string[];
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: "開発ツール",
    icon: "🔧",
    keywords: ["code", "review", "test", "debug", "refactor", "lint", "format", "compile"],
    subcategories: [
      {
        name: "コードレビュー",
        keywords: ["review", "レビュー", "code review", "pr review", "pull request", "code quality"],
      },
      {
        name: "テスト自動化",
        keywords: ["test", "testing", "spec", "jest", "pytest", "vitest", "unit test", "e2e", "coverage", "テスト"],
      },
      {
        name: "デバッグ",
        keywords: ["debug", "デバッグ", "fix bug", "bugfix", "error analysis", "stack trace", "breakpoint"],
      },
      {
        name: "リファクタリング",
        keywords: ["refactor", "リファクタ", "clean code", "restructure", "modernize", "migration", "improve"],
      },
      {
        name: "コード生成",
        keywords: ["generate", "生成", "scaffold", "boilerplate", "template", "code gen", "snippet", "stub"],
      },
      {
        name: "Lint・フォーマット",
        keywords: ["lint", "format", "prettier", "eslint", "biome", "formatter", "style guide", "フォーマット"],
      },
      {
        name: "パフォーマンス最適化",
        keywords: ["performance", "optimize", "パフォーマンス", "speed", "profile", "benchmark", "memory", "cpu"],
      },
    ],
  },
  {
    name: "ドキュメント",
    icon: "📄",
    keywords: ["doc", "readme", "document", "comment", "translate", "changelog", "wiki"],
    subcategories: [
      {
        name: "README生成",
        keywords: ["readme", "readme generator", "readme.md", "project description"],
      },
      {
        name: "API文書",
        keywords: ["api doc", "openapi", "swagger", "jsdoc", "tsdoc", "api reference", "endpoint doc"],
      },
      {
        name: "技術文書",
        keywords: ["technical doc", "technical writing", "specification", "architecture doc", "design doc", "技術文書"],
      },
      {
        name: "コメント生成",
        keywords: ["comment", "コメント", "inline doc", "docstring", "annotation"],
      },
      {
        name: "翻訳",
        keywords: ["translat", "翻訳", "i18n", "localization", "l10n", "multilingual"],
      },
      {
        name: "チェンジログ",
        keywords: ["changelog", "release note", "release notes", "change log", "version history"],
      },
    ],
  },
  {
    name: "データ・分析",
    icon: "📊",
    keywords: ["data", "analysis", "csv", "json", "database", "sql", "statistics", "chart"],
    subcategories: [
      {
        name: "データ処理",
        keywords: ["data process", "data transform", "data clean", "データ処理", "csv", "json processing", "pandas"],
      },
      {
        name: "可視化",
        keywords: ["visualiz", "chart", "graph", "plot", "dashboard", "可視化", "matplotlib", "d3"],
      },
      {
        name: "統計・計算",
        keywords: ["statistic", "statistics", "math", "calculation", "統計", "regression", "correlation"],
      },
      {
        name: "スクレイピング",
        keywords: ["scraping", "scrape", "crawl", "web scraping", "スクレイピング", "playwright", "puppeteer", "selenium"],
      },
      {
        name: "ETL",
        keywords: ["etl", "pipeline", "data pipeline", "ingestion", "extract", "transform", "load", "airflow"],
      },
    ],
  },
  {
    name: "Web開発",
    icon: "🌐",
    keywords: ["web", "frontend", "backend", "react", "vue", "nextjs", "api", "html", "css", "http"],
    subcategories: [
      {
        name: "フロントエンド",
        keywords: ["frontend", "react", "vue", "svelte", "angular", "next.js", "nuxt", "フロントエンド", "component", "ui"],
      },
      {
        name: "バックエンド",
        keywords: ["backend", "server", "express", "fastapi", "django", "rails", "バックエンド", "rest api", "graphql"],
      },
      {
        name: "CSS・デザイン",
        keywords: ["css", "tailwind", "sass", "scss", "styled", "design system", "animation", "responsive"],
      },
      {
        name: "API開発",
        keywords: ["api", "endpoint", "openapi", "rest", "graphql", "webhook", "middleware"],
      },
      {
        name: "データベース",
        keywords: ["database", "sql", "postgres", "mysql", "mongodb", "redis", "orm", "schema", "データベース", "migration"],
      },
      {
        name: "SEO",
        keywords: ["seo", "meta", "sitemap", "og tag", "search engine", "lighthouse", "accessibility"],
      },
    ],
  },
  {
    name: "DevOps",
    icon: "⚙️",
    keywords: ["devops", "ci", "cd", "docker", "deploy", "kubernetes", "infra", "cloud", "pipeline"],
    subcategories: [
      {
        name: "CI/CD",
        keywords: ["ci/cd", "ci", "cd", "github actions", "gitlab ci", "jenkins", "circleci", "pipeline", "workflow"],
      },
      {
        name: "Docker・コンテナ",
        keywords: ["docker", "container", "dockerfile", "compose", "podman", "コンテナ"],
      },
      {
        name: "デプロイ",
        keywords: ["deploy", "deployment", "デプロイ", "release", "vercel", "netlify", "heroku", "ship"],
      },
      {
        name: "モニタリング",
        keywords: ["monitor", "モニタリング", "observability", "logging", "metrics", "alerting", "grafana", "datadog"],
      },
      {
        name: "インフラ",
        keywords: ["infrastructure", "terraform", "pulumi", "aws", "gcp", "azure", "cloud", "インフラ", "iac"],
      },
      {
        name: "Kubernetes",
        keywords: ["kubernetes", "k8s", "helm", "kubectl", "pod", "cluster", "manifest"],
      },
    ],
  },
  {
    name: "セキュリティ",
    icon: "🔒",
    keywords: ["security", "secure", "auth", "vulnerability", "crypto", "audit", "セキュリティ"],
    subcategories: [
      {
        name: "脆弱性チェック",
        keywords: ["vulnerability", "cve", "security scan", "pentest", "sast", "dast", "owasp", "脆弱性"],
      },
      {
        name: "認証・認可",
        keywords: ["auth", "authentication", "authorization", "jwt", "oauth", "sso", "rbac", "認証", "認可"],
      },
      {
        name: "暗号化",
        keywords: ["encrypt", "decrypt", "crypto", "tls", "ssl", "hash", "暗号化", "cipher"],
      },
      {
        name: "監査・コンプライアンス",
        keywords: ["audit", "compliance", "gdpr", "hipaa", "pci", "policy", "監査", "コンプライアンス"],
      },
    ],
  },
  {
    name: "AI・機械学習",
    icon: "🤖",
    keywords: ["ai", "ml", "llm", "model", "prompt", "rag", "embedding", "neural", "gpt", "claude"],
    subcategories: [
      {
        name: "モデル構築",
        keywords: ["model", "training", "neural network", "deep learning", "pytorch", "tensorflow", "sklearn"],
      },
      {
        name: "プロンプト最適化",
        keywords: ["prompt", "プロンプト", "prompt engineering", "few-shot", "chain of thought", "system prompt"],
      },
      {
        name: "データ前処理",
        keywords: ["preprocess", "preprocessing", "tokenize", "embedding", "feature", "データ前処理", "normalization"],
      },
      {
        name: "RAG",
        keywords: ["rag", "retrieval", "vector", "embedding", "semantic search", "langchain", "llamaindex", "pinecone"],
      },
      {
        name: "ファインチューニング",
        keywords: ["finetune", "fine-tune", "fine tuning", "lora", "qlora", "ファインチューニング", "sft"],
      },
      {
        name: "LLMツール",
        keywords: ["llm", "gpt", "claude", "gemini", "openai", "anthropic", "api integration", "agent", "tool use"],
      },
    ],
  },
  {
    name: "モバイル",
    icon: "📱",
    keywords: ["mobile", "ios", "android", "swift", "kotlin", "react native", "flutter", "app"],
    subcategories: [
      {
        name: "iOS",
        keywords: ["ios", "swift", "swiftui", "xcode", "objective-c", "apple", "uikit"],
      },
      {
        name: "Android",
        keywords: ["android", "kotlin", "java android", "jetpack", "android studio", "gradle"],
      },
      {
        name: "React Native",
        keywords: ["react native", "expo", "rn "],
      },
      {
        name: "Flutter",
        keywords: ["flutter", "dart"],
      },
      {
        name: "クロスプラットフォーム",
        keywords: ["cross platform", "capacitor", "ionic", "xamarin", "クロスプラットフォーム", "pwa"],
      },
    ],
  },
  {
    name: "学習・教育",
    icon: "📚",
    keywords: ["learn", "teach", "tutorial", "education", "explain", "study", "quiz", "学習", "教育"],
    subcategories: [
      {
        name: "プログラミング学習",
        keywords: ["programming tutorial", "coding exercise", "learn to code", "プログラミング学習", "bootcamp"],
      },
      {
        name: "数学・計算",
        keywords: ["math", "mathematics", "数学", "algebra", "calculus", "statistics", "formula"],
      },
      {
        name: "問題生成",
        keywords: ["quiz", "problem", "exercise", "question", "問題", "practice", "exam"],
      },
      {
        name: "解説",
        keywords: ["explain", "explanation", "解説", "breakdown", "walkthrough", "understand"],
      },
      {
        name: "語学",
        keywords: ["language learning", "grammar", "vocabulary", "pronunciation", "語学", "英語", "japanese"],
      },
    ],
  },
  {
    name: "ビジネス・業務",
    icon: "💼",
    keywords: ["business", "email", "meeting", "report", "project", "marketing", "sales", "業務", "电商", "客服", "企业", "飞书", "钉钉", "工作"],
    subcategories: [
      {
        name: "資料作成",
        keywords: ["presentation", "slide", "report", "proposal", "document", "資料", "スライド", "プレゼン", "汇报", "方案"],
      },
      {
        name: "メール",
        keywords: ["email", "メール", "mail", "newsletter", "outreach", "reply", "inbox", "邮件"],
      },
      {
        name: "スケジュール",
        keywords: ["schedule", "calendar", "スケジュール", "meeting", "planning", "task management", "日历", "会议"],
      },
      {
        name: "会計・経理",
        keywords: ["accounting", "invoice", "expense", "会計", "経理", "budget", "bookkeeping", "tax", "payroll", "报销", "财务", "账单"],
      },
      {
        name: "マーケティング",
        keywords: ["marketing", "マーケティング", "copywriting", "ad", "campaign", "seo content", "social media", "电商", "运营", "推广", "选品"],
      },
      {
        name: "プロジェクト管理",
        keywords: ["project management", "プロジェクト管理", "jira", "linear", "backlog", "sprint", "agile", "kanban", "飞书", "钉钉", "协作"],
      },
    ],
  },
  {
    name: "クリエイティブ",
    icon: "🎨",
    keywords: ["design", "art", "creative", "music", "video", "game", "3d", "write", "story", "创作", "动漫", "anime", "诗词", "绘画", "插画"],
    subcategories: [
      {
        name: "デザイン",
        keywords: ["design", "figma", "sketch", "ui design", "デザイン", "graphic", "icon", "logo", "设计", "绘画", "插画"],
      },
      {
        name: "音楽",
        keywords: ["music", "音楽", "audio", "midi", "chord", "melody", "composition", "音乐", "作曲"],
      },
      {
        name: "動画",
        keywords: ["video", "動画", "ffmpeg", "editing", "subtitle", "youtube", "clip", "视频", "抖音", "剪辑", "短视频"],
      },
      {
        name: "ゲーム開発",
        keywords: ["game", "ゲーム", "unity", "unreal", "pygame", "godot", "phaser", "shader", "游戏"],
      },
      {
        name: "3Dモデリング",
        keywords: ["3d", "blender", "cad", "mesh", "modeling", "render", "three.js"],
      },
      {
        name: "ライティング",
        keywords: ["writing", "content", "blog", "article", "copy", "story", "novel", "ライティング", "文章", "写作", "小说", "诗词", "anime", "动漫", "创作"],
      },
    ],
  },
  {
    name: "ユーティリティ",
    icon: "🛠️",
    keywords: ["file", "git", "cli", "convert", "automat", "shell", "script", "util"],
    subcategories: [
      {
        name: "ファイル操作",
        keywords: ["file", "directory", "folder", "rename", "organize", "ファイル", "path", "glob"],
      },
      {
        name: "Git操作",
        keywords: ["git", "commit", "branch", "merge", "rebase", "stash", "diff", "blame"],
      },
      {
        name: "環境構築",
        keywords: ["setup", "install", "environment", "dotenv", "env", "環境構築", "bootstrap", "init"],
      },
      {
        name: "CLI",
        keywords: ["cli", "command line", "terminal", "shell", "bash", "zsh", "fish", "コマンド"],
      },
      {
        name: "変換ツール",
        keywords: ["convert", "transform", "変換", "format convert", "json to", "csv to", "encode", "decode"],
      },
      {
        name: "自動化",
        keywords: ["automat", "自動化", "macro", "schedule", "cron", "hook", "trigger", "workflow"],
      },
    ],
  },
  {
    name: "言語・フレームワーク",
    icon: "💻",
    keywords: ["python", "javascript", "typescript", "rust", "go", "java", "ruby", "swift", "kotlin"],
    subcategories: [
      {
        name: "Python",
        keywords: ["python", "pip", "django", "flask", "fastapi", "pandas", "numpy", "asyncio"],
      },
      {
        name: "JavaScript/TypeScript",
        keywords: ["javascript", "typescript", "nodejs", "deno", "bun", "npm", "yarn", "pnpm", "js ", "ts "],
      },
      {
        name: "Rust",
        keywords: ["rust", "cargo", "rustup", "tokio", "serde", "ownership"],
      },
      {
        name: "Go",
        keywords: ["golang", "go ", " go ", "gopher", "goroutine", "gin", "echo"],
      },
      {
        name: "Java",
        keywords: ["java ", "spring", "maven", "gradle", "jvm", "kotlin", "jdk"],
      },
      {
        name: "Ruby",
        keywords: ["ruby", "rails", "gem", "rake", "bundler", "rspec"],
      },
      {
        name: "Swift",
        keywords: ["swift", "swiftui", "xcode", "cocoa"],
      },
      {
        name: "C/C++",
        keywords: ["c++", "cpp", "cmake", "clang", "gcc", "c language", "llvm"],
      },
    ],
  },
  {
    name: "化学・生命科学",
    icon: "🧬",
    keywords: ["molecular", "protein", "bioinformatics", "genomics", "docking", "ligand", "chemistry", "biology", "sequencing", "rna", "dna", "cell"],
    subcategories: [
      {
        name: "バイオインフォマティクス",
        keywords: ["bioinformatics", "genomics", "sequencing", "rna-seq", "dna", "blast", "fasta", "bam", "vcf"],
      },
      {
        name: "タンパク質・分子設計",
        keywords: ["protein", "molecular", "docking", "ligand", "alphafold", "rosetta", "pdb", "structure"],
      },
      {
        name: "化学計算",
        keywords: ["chemistry", "chemical", "rdkit", "smiles", "mol", "reaction", "compound", "simulation"],
      },
      {
        name: "細胞・生物学",
        keywords: ["cell", "biology", "microscopy", "organism", "gene", "crispr", "phenotype"],
      },
    ],
  },
  {
    name: "医療・ヘルスケア",
    icon: "🏥",
    keywords: ["medical", "health", "clinical", "diagnosis", "patient", "drug", "ehr", "fhir", "hospital", "医生", "医疗", "健康", "药", "诊断", "御医"],
    subcategories: [
      {
        name: "診断支援",
        keywords: ["diagnosis", "diagnostic", "symptom", "disease", "condition", "medical image", "radiology", "诊断", "症状"],
      },
      {
        name: "電子カルテ・HL7",
        keywords: ["ehr", "fhir", "hl7", "epic", "patient record", "clinical note", "医療記録"],
      },
      {
        name: "医薬品・治療",
        keywords: ["drug", "medication", "treatment", "prescription", "pharmacy", "clinical trial", "药", "治疗", "用药"],
      },
      {
        name: "ヘルスケアアプリ",
        keywords: ["health", "wellness", "fitness", "nutrition", "wearable", "sleep", "mental health", "健康", "养生", "医生", "御医"],
      },
    ],
  },
  {
    name: "数学・物理",
    icon: "🔢",
    keywords: ["numerical", "simulation", "physics", "mathematical", "optimization", "differential", "linear algebra", "signal"],
    subcategories: [
      {
        name: "数値計算・シミュレーション",
        keywords: ["numerical", "simulation", "finite element", "cfd", "monte carlo", "differential equation", "solver"],
      },
      {
        name: "最適化",
        keywords: ["optimization", "minimization", "gradient", "genetic algorithm", "scipy", "convex"],
      },
      {
        name: "物理・工学",
        keywords: ["physics", "mechanics", "thermodynamics", "electromagnetism", "signal processing", "control"],
      },
      {
        name: "線形代数・行列",
        keywords: ["linear algebra", "matrix", "eigenvalue", "svd", "numpy linalg", "tensor"],
      },
    ],
  },
  {
    name: "法律・コンプライアンス",
    icon: "⚖️",
    keywords: ["legal", "contract", "regulatory", "compliance", "law", "gdpr", "privacy", "policy", "terms"],
    subcategories: [
      {
        name: "契約書・法文書",
        keywords: ["contract", "agreement", "legal document", "clause", "terms", "nda", "sla", "法律文書"],
      },
      {
        name: "規制・コンプライアンス",
        keywords: ["regulatory", "compliance", "gdpr", "ccpa", "hipaa", "regulation", "法令", "コンプライアンス"],
      },
      {
        name: "プライバシー",
        keywords: ["privacy", "data protection", "personal data", "cookie", "consent", "プライバシー"],
      },
      {
        name: "知的財産",
        keywords: ["patent", "copyright", "trademark", "ip", "license", "intellectual property", "特許"],
      },
    ],
  },
  {
    name: "金融・経済",
    icon: "💰",
    keywords: ["finance", "stock", "trading", "investment", "crypto", "blockchain", "accounting", "risk", "economic", "投资", "交易", "财经", "量化", "港股", "a股", "期货", "基金"],
    subcategories: [
      {
        name: "株式・投資分析",
        keywords: ["stock", "equity", "investment", "portfolio", "backtest", "technical analysis", "fundamental", "株式", "投资", "股票", "港股", "a股", "量化", "选股"],
      },
      {
        name: "暗号通貨",
        keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "defi", "web3", "wallet", "nft", "solidity", "加密", "数字货币"],
      },
      {
        name: "リスク管理",
        keywords: ["risk", "var", "volatility", "hedge", "exposure", "risk management", "リスク", "风险"],
      },
      {
        name: "会計・財務",
        keywords: ["accounting", "financial statement", "balance sheet", "cash flow", "gaap", "ifrs", "決算", "財務", "财报", "财务分析", "研报"],
      },
      {
        name: "トレーディング",
        keywords: ["trading", "algo trading", "quant", "strategy", "execution", "market data", "order", "トレード", "交易", "量化交易", "回测", "期货"],
      },
      {
        name: "市場ニュース",
        keywords: ["market news", "financial news", "财经", "财经资讯", "market analysis", "经济", "宏观"],
      },
    ],
  },
  {
    name: "その他",
    icon: "📦",
    keywords: [],
    subcategories: [{ name: "未分類", keywords: [] }],
  },
];

export function classifySkill(
  name: string,
  description: string,
  content?: string
): { category: string; subcategory: string } {
  const text = `${name} ${description} ${content ?? ""}`.toLowerCase();

  for (const cat of CATEGORIES) {
    if (cat.name === "その他") continue;
    for (const sub of cat.subcategories) {
      if (sub.keywords.some((kw) => text.includes(kw))) {
        return { category: cat.name, subcategory: sub.name };
      }
    }
  }

  // fallback: check top-level category keywords
  for (const cat of CATEGORIES) {
    if (cat.name === "その他") continue;
    if (cat.keywords.some((kw) => text.includes(kw))) {
      return { category: cat.name, subcategory: cat.subcategories[0].name };
    }
  }

  return { category: "その他", subcategory: "未分類" };
}

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.name, c]));
