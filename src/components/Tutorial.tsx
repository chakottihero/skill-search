"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { setCookie, getCookieWithMigration } from "@/lib/cookies";

const COOKIE_KEY = "tutorial_completed";
const SKIP_PATHS = ["/submit"];
const TOTAL_STEPS = 8;

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  ja: {
    step0Title: "言語を選択してください",
    langs: [
      { code: "ja", label: "🇯🇵 日本語" },
      { code: "en", label: "🇺🇸 English" },
      { code: "zh", label: "🇨🇳 中文" },
    ],
    skip: "スキップ",
    next: "次へ →",
    step1Title: "Skills リサーチへようこそ！",
    step1Body: "74,000件以上のAIエージェント向けスキルファイル（SKILL.md）を無料で横断検索できるプラットフォームです。簡単なガイドをご紹介します。",
    step2Tooltip: "キーワードを入力してスキルを検索できます。「code review」「git」「react」など何でも試してみてください！",
    step3Tooltip: "ホーム・検索・カテゴリ・出品の各ページにここからアクセスできます。",
    step4Tooltip: "ここから表示言語を日本語・English・中文に切り替えられます。",
    step5Tooltip: "このボタンをタップするとサイドメニューが開きます。",
    step5Tap: "☰ タップして開く",
    step6Title: "メニューを確認",
    step6Body: "カテゴリ・検索・出品など、サイドバーから各機能にアクセスできます。",
    step7Title: "ガイド完了！",
    step7Body: "これで基本的な使い方は以上です。さっそくスキルを検索してみましょう！",
    step7Search: "スキルを検索する",
    step7Home: "ホームに戻る",
    dots: (current: number) => `ステップ ${current + 1} / ${TOTAL_STEPS}`,
  },
  en: {
    step0Title: "Select your language",
    langs: [
      { code: "ja", label: "🇯🇵 日本語" },
      { code: "en", label: "🇺🇸 English" },
      { code: "zh", label: "🇨🇳 中文" },
    ],
    skip: "Skip",
    next: "Next →",
    step1Title: "Welcome to Skills Research!",
    step1Body: "Search over 74,000 skill files (SKILL.md) for AI agents — completely free. Let us walk you through the basics.",
    step2Tooltip: "Type any keyword to search for skills. Try \"code review\", \"git\", \"react\", or anything you need!",
    step3Tooltip: "Use the navigation to quickly jump to Home, Search, Categories, or the Skills Market.",
    step4Tooltip: "Switch the display language between 日本語, English, and 中文 here.",
    step5Tooltip: "Tap this button to open the side menu.",
    step5Tap: "☰ Tap to open",
    step6Title: "Check the Menu",
    step6Body: "Access categories, search, and submission features from the sidebar.",
    step7Title: "Guide Complete!",
    step7Body: "That covers the basics. Let's start searching for skills!",
    step7Search: "Search Skills",
    step7Home: "Back to Home",
    dots: (current: number) => `Step ${current + 1} / ${TOTAL_STEPS}`,
  },
  zh: {
    step0Title: "请选择语言",
    langs: [
      { code: "ja", label: "🇯🇵 日本語" },
      { code: "en", label: "🇺🇸 English" },
      { code: "zh", label: "🇨🇳 中文" },
    ],
    skip: "跳过",
    next: "下一步 →",
    step1Title: "欢迎来到 Skills Research！",
    step1Body: "免费搜索超过74,000个AI代理技能文件（SKILL.md）。让我们快速了解基本使用方法。",
    step2Tooltip: "输入关键词即可搜索技能。试试「code review」「git」「react」等关键词！",
    step3Tooltip: "通过导航栏快速跳转到首页、搜索、分类或技能市场。",
    step4Tooltip: "在这里可以将显示语言切换为日本語、English 或中文。",
    step5Tooltip: "点击此按钮可以打开侧边菜单。",
    step5Tap: "☰ 点击打开",
    step6Title: "查看菜单",
    step6Body: "您可以从侧边栏访问类别、搜索、提交等功能。",
    step7Title: "引导完成！",
    step7Body: "基本使用方法就介绍到这里。现在开始搜索技能吧！",
    step7Search: "搜索技能",
    step7Home: "返回首页",
    dots: (current: number) => `步骤 ${current + 1} / ${TOTAL_STEPS}`,
  },
} as const;

// ─── spotlight overlay ─────────────────────────────────────────────────────────

function SpotlightOverlay({ targetId, padding = 8 }: { targetId: string; padding?: number }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    const timer = setInterval(update, 200);
    window.addEventListener("resize", update);
    return () => { clearInterval(timer); window.removeEventListener("resize", update); };
  }, [targetId]);

  if (!rect) return <div className="fixed inset-0 z-[9990] bg-black/70" />;

  const t = Math.max(0, rect.top - padding);
  const b = rect.bottom + padding;
  const l = Math.max(0, rect.left - padding);
  const r = rect.right + padding;

  return (
    <>
      <div className="fixed z-[9990] bg-black/70" style={{ top: 0, left: 0, right: 0, height: t }} />
      <div className="fixed z-[9990] bg-black/70" style={{ top: b, left: 0, right: 0, bottom: 0 }} />
      <div className="fixed z-[9990] bg-black/70" style={{ top: t, left: 0, width: l, height: b - t }} />
      <div className="fixed z-[9990] bg-black/70" style={{ top: t, left: r, right: 0, height: b - t }} />
      <div className="fixed z-[9990] border-2 border-indigo-400 rounded-lg pointer-events-none"
           style={{ top: t, left: l, width: r - l, height: b - t }} />
    </>
  );
}

// ─── step dots ────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mt-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current ? "w-3 h-3 bg-indigo-500" : i < current ? "w-2 h-2 bg-indigo-300" : "w-2 h-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ─── cards ────────────────────────────────────────────────────────────────────

function TooltipCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`fixed z-[9991] bg-white rounded-xl shadow-2xl p-4 w-[calc(100vw-32px)] sm:w-72 bottom-4 left-4 right-4 ${className}`}
      style={{ animation: "tutFade 0.3s ease" }}
    >
      {children}
    </div>
  );
}

function ModalCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.88)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7" style={{ animation: "tutFade 0.3s ease" }}>
        {children}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Tutorial() {
  const { setLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [lang, setLangState] = useState<"ja" | "en" | "zh">("ja");

  const txt = T[lang];

  // ── show/hide logic ────────────────────────────────────────────
  useEffect(() => {
    if (SKIP_PATHS.includes(pathname)) return;
    if (getCookieWithMigration(COOKIE_KEY) !== "true") {
      setVisible(true);
    }
  }, [pathname]);

  // ── scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    };
  }, [visible]);

  const complete = useCallback(() => {
    setCookie(COOKIE_KEY, "true");
    setCookie(`${COOKIE_KEY}_at`, new Date().toISOString());
    window.dispatchEvent(new CustomEvent("tutorial:close-sidebar"));
    setVisible(false);
  }, []);

  const skip = useCallback(() => complete(), [complete]);

  const pickLang = (code: string) => {
    const l = code as Lang;
    setLangState(l as "ja" | "en" | "zh");
    setLang(l);
    setStep(1);
  };

  const handleNext = () => {
    if (step === 5) {
      // open sidebar then advance to step 6 (sidebar explanation)
      window.dispatchEvent(new CustomEvent("tutorial:open-sidebar"));
      setTimeout(() => setStep(6), 420);
    } else if (step === 6) {
      // close sidebar then show completion modal
      window.dispatchEvent(new CustomEvent("tutorial:close-sidebar"));
      setTimeout(() => setStep(7), 300);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes tutFade {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Step 0: language selection */}
      {step === 0 && (
        <ModalCard>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
            {T.ja.step0Title}
            <br />
            <span className="text-base font-normal text-gray-500">{T.en.step0Title}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { code: "ja", label: "🇯🇵 日本語" },
              { code: "en", label: "🇺🇸 English" },
              { code: "zh", label: "🇨🇳 中文" },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => pickLang(l.code)}
                className="py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-lg font-semibold text-gray-800 transition-all"
              >
                {l.label}
              </button>
            ))}
          </div>
          <StepDots current={0} />
        </ModalCard>
      )}

      {/* Step 1: welcome */}
      {step === 1 && (
        <ModalCard>
          <button onClick={skip} className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-600">
            {txt.skip}
          </button>
          <div className="text-4xl text-center mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">{txt.step1Title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed text-center mb-6">{txt.step1Body}</p>
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {txt.next}
          </button>
          <StepDots current={1} />
        </ModalCard>
      )}

      {/* Step 2: search form highlight */}
      {step === 2 && (
        <>
          <SpotlightOverlay targetId="tutorial-search" padding={12} />
          <div className="fixed inset-0 z-[9989] pointer-events-none" />
          <TooltipCard className="sm:top-[45%] sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <button onClick={skip} className="absolute top-2 right-3 text-xs text-gray-400 hover:text-gray-600">
              {txt.skip}
            </button>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Step 2</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{txt.step2Tooltip}</p>
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {txt.next}
            </button>
            <StepDots current={2} />
          </TooltipCard>
        </>
      )}

      {/* Step 3: nav highlight */}
      {step === 3 && (
        <>
          <SpotlightOverlay targetId="tutorial-nav" padding={6} />
          <div className="fixed inset-0 z-[9989] pointer-events-none" />
          <TooltipCard className="sm:top-24 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <button onClick={skip} className="absolute top-2 right-3 text-xs text-gray-400 hover:text-gray-600">
              {txt.skip}
            </button>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Step 3</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{txt.step3Tooltip}</p>
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {txt.next}
            </button>
            <StepDots current={3} />
          </TooltipCard>
        </>
      )}

      {/* Step 4: language switcher highlight */}
      {step === 4 && (
        <>
          <SpotlightOverlay targetId="tutorial-language" padding={8} />
          <div className="fixed inset-0 z-[9989] pointer-events-none" />
          <TooltipCard className="sm:top-16 sm:bottom-auto sm:left-auto sm:right-4">
            <button onClick={skip} className="absolute top-2 right-3 text-xs text-gray-400 hover:text-gray-600">
              {txt.skip}
            </button>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Step 4</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{txt.step4Tooltip}</p>
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {txt.next}
            </button>
            <StepDots current={4} />
          </TooltipCard>
        </>
      )}

      {/* Step 5: hamburger button spotlight */}
      {step === 5 && (
        <>
          <SpotlightOverlay targetId="tutorial-hamburger" padding={8} />
          <div className="fixed inset-0 z-[9989] pointer-events-none" />
          <TooltipCard className="sm:top-16 sm:bottom-auto sm:left-16 sm:right-auto">
            <button onClick={skip} className="absolute top-2 right-3 text-xs text-gray-400 hover:text-gray-600">
              {txt.skip}
            </button>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Step 6</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{txt.step5Tooltip}</p>
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {txt.step5Tap}
            </button>
            <StepDots current={5} />
          </TooltipCard>
        </>
      )}

      {/* Step 6: sidebar open — menu explanation */}
      {step === 6 && (
        <>
          {/* darken everything to the right of the sidebar */}
          <div
            className="fixed top-0 bottom-0 z-[9990] bg-black/60 pointer-events-none"
            style={{ left: "min(320px, 85vw)" }}
          />
          {/* explanation sheet — bottom sheet on mobile, right-aligned card on sm+ */}
          <div
            className="fixed z-[9991] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5
                       bottom-0 left-0 right-0
                       sm:bottom-auto sm:top-1/2 sm:left-auto sm:right-4 sm:-translate-y-1/2 sm:w-72"
            style={{ animation: "tutFade 0.3s ease" }}
          >
            <button onClick={skip} className="absolute top-3 right-4 text-xs text-gray-400 hover:text-gray-600">
              {txt.skip}
            </button>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Step 7</p>
            <p className="text-sm font-bold text-gray-900 mb-2">{txt.step6Title}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{txt.step6Body}</p>
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {txt.next}
            </button>
            <StepDots current={6} />
          </div>
        </>
      )}

      {/* Step 7: completion modal */}
      {step === 7 && (
        <ModalCard>
          <div className="text-4xl text-center mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">{txt.step7Title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed text-center mb-6">{txt.step7Body}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { complete(); router.push("/search"); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {txt.step7Search}
            </button>
            <button
              onClick={complete}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              {txt.step7Home}
            </button>
          </div>
          <StepDots current={7} />
        </ModalCard>
      )}
    </>
  );
}
