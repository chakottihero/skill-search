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
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input name="q" defaultValue={q} placeholder="Search skills..."
            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />
        </div>
        <button type="submit"
          className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600">
          検索
        </button>
      </form>

      {/* Controls row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400 dark:text-gray-500">
        <span>
          {q ? (
            <>「<span className="text-gray-900 dark:text-white">{q}</span>」の検索結果{" "}
              <span className="text-gray-900 dark:text-white">{total.toLocaleString()}</span> 件
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400 dark:text-gray-600">
                  （{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} 件目）
                </span>
              )}
            </>
          ) : (
            <>全 <span className="text-gray-900 dark:text-white">{total.toLocaleString()}</span> 件のスキル</>
          )}
        </span>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[{ v: "", label: "全言語" }, { v: "ja", label: "日本語" }, { v: "en", label: "English" }]
              .map(({ v, label }) => (
                <Link key={v} href={buildHref(q, sort, v || undefined, 1)}
                  className={`transition-colors hover:text-gray-900 dark:hover:text-white ${(lang ?? "") === v ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                  {label}
                </Link>
              ))}
          </div>
          <span className="text-gray-200 dark:text-white/20">|</span>
          <div className="flex gap-2">
            {Object.entries(SORT_LABELS).map(([v, label]) => (
              <Link key={v} href={buildHref(q, v, lang, 1)}
                className={`transition-colors hover:text-gray-900 dark:hover:text-white ${sort === v ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
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
          <div className="divide-y divide-gray-100 dark:divide-white/[0.08]">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm">
              {page > 1 && (
                <Link href={buildHref(q, sort, lang, page - 1)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400">
                  ← 前へ
                </Link>
              )}
              <span className="px-4 text-gray-400 dark:text-gray-500">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildHref(q, sort, lang, page + 1)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400">
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
      <p className="text-lg text-gray-500 dark:text-gray-400">
        {query ? <>「{query}」に一致するスキルが見つかりませんでした</> : <>スキルデータがありません</>}
      </p>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">
        {query
          ? "別のキーワードで検索するか、クロールを実行してデータを増やしてください。"
          : "npm run crawl を実行して SKILL.md データを取得してください。"}
      </p>
      {!query && (
        <code className="mt-4 inline-block rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-400">
          npm run crawl
        </code>
      )}
    </div>
  );
}
