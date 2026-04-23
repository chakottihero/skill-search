import { searchSkills } from "@/lib/search";
import SkillCard from "@/components/SkillCard";
import Link from "next/link";
import type { SearchOptions } from "@/lib/types";

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; lang?: string; page?: string }>;
};

const SORT_LABELS: Record<string, string> = {
  relevance: "関連度",
  stars: "スター数",
  updatedAt: "更新日",
};

function isSortBy(v: string | undefined): v is NonNullable<SearchOptions["sortBy"]> {
  return v === "relevance" || v === "stars" || v === "updatedAt";
}

function buildHref(q: string, sort: string, lang: string | undefined, page: number) {
  const params = new URLSearchParams({ q, sort });
  if (lang) params.set("lang", lang);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", sort = "relevance", lang, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);

  const options: SearchOptions = {
    sortBy: isSortBy(sort) ? sort : "relevance",
    language: lang === "ja" || lang === "en" ? lang : undefined,
  };

  const allSkills = await searchSkills(q, options);
  const total = allSkills.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const skills = allSkills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Mini search bar */}
      <form action="/search" method="GET" className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input name="q" defaultValue={q} placeholder="スキルを検索..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        <button type="submit"
          className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-green-400">
          検索
        </button>
      </form>

      {/* Controls row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <span>
          {q ? (
            <>「<span className="text-white">{q}</span>」の検索結果{" "}
              <span className="text-white">{total.toLocaleString()}</span> 件
              {totalPages > 1 && (
                <span className="ml-2 text-gray-600">
                  （{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} 件目）
                </span>
              )}
            </>
          ) : (
            <>全 <span className="text-white">{total.toLocaleString()}</span> 件のスキル</>
          )}
        </span>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[{ v: "", label: "全言語" }, { v: "ja", label: "日本語" }, { v: "en", label: "English" }]
              .map(({ v, label }) => (
                <Link key={v} href={buildHref(q, sort, v || undefined, 1)}
                  className={`transition-colors hover:text-white ${(lang ?? "") === v ? "text-green-400" : ""}`}>
                  {label}
                </Link>
              ))}
          </div>
          <span className="text-white/20">|</span>
          <div className="flex gap-2">
            {Object.entries(SORT_LABELS).map(([v, label]) => (
              <Link key={v} href={buildHref(q, v, lang, 1)}
                className={`transition-colors hover:text-white ${sort === v ? "text-green-400" : ""}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {skills.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <>
          <div className="divide-y divide-white/[0.08]">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm">
              {page > 1 && (
                <Link href={buildHref(q, sort, lang, page - 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-gray-400 hover:border-green-500 hover:text-green-400 transition-colors">
                  ← 前へ
                </Link>
              )}
              <span className="px-4 text-gray-500">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildHref(q, sort, lang, page + 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-gray-400 hover:border-green-500 hover:text-green-400 transition-colors">
                  次へ →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-lg text-gray-400">
        {query ? <>「{query}」に一致するスキルが見つかりませんでした</> : <>スキルデータがありません</>}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {query
          ? "別のキーワードで検索するか、クロールを実行してデータを増やしてください。"
          : "npm run crawl を実行して SKILL.md データを取得してください。"}
      </p>
      {!query && (
        <code className="mt-4 inline-block rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-green-400">
          npm run crawl
        </code>
      )}
    </div>
  );
}
