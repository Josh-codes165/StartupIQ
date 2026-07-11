"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Clock,
  Settings,
  LogOut,
  Send,
  Lightbulb,
  Menu,
  X,
} from "lucide-react";

type Analysis = {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: string[];
  opportunityScore: number;
  risk: string[];
  pitch: string;
};

const EXAMPLE_PROMPTS = [
  "A marketplace for hiring vetted freelance product designers in 24 hours.",
  "AI copilot for solo real-estate agents to write listings and respond to leads.",
  "A subscription box that ships seasonal artisan snacks from South-East Asia.",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        loadHistory();
        return;
      }
      router.replace("/login");
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        loadHistory();
      } else {
        router.replace("/login");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOUT = () => {
    supabase.auth.signOut().then(() => {
      router.replace("/login");
    });
  };

  const handleNewAnalysis = () => {
    setIdea("");
    setAnalysis(null);
    setError(false);
    setMobileMenuOpen(false);
  };

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error Loading History", error);
      return;
    }
    setLoadingHistory(false);
    setHistory(data);
  };

  const swotData: { name: string; value: number }[] = analysis?.swot
    ? [
        { name: "Strengths", value: analysis.swot.strengths.length },
        { name: "Weaknesses", value: analysis.swot.weaknesses.length },
        { name: "Opportunities", value: analysis.swot.opportunities.length },
        { name: "Threats", value: analysis.swot.threats.length },
      ]
    : [];

  const runAnalysis = async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) throw new Error("Failed to analyze idea");

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    runAnalysis();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runAnalysis();
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900">StartupIQ</span>
        </div>
        {/* Close button, mobile only */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New analysis */}
      <div className="px-5 pb-5">
        <button
          onClick={handleNewAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New analysis
        </button>
      </div>

      <div className="flex items-center gap-2 px-5 pb-3">
        <Clock className="h-3.5 w-3.5 text-zinc-400" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Recent Analyses
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {loadingHistory ? (
          <p className="px-2 text-sm text-zinc-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="px-2 text-sm text-zinc-500">
            Your recent analyses will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setAnalysis(item.analysis);
                  setIdea(item.idea);
                  setMobileMenuOpen(false);
                }}
                className="group w-full rounded-xl border border-transparent bg-white p-4 text-left transition-all duration-200 hover:border-amber-200 hover:bg-amber-50"
              >
                <p className="truncate text-sm font-semibold text-zinc-800 group-hover:text-zinc-900">
                  {item.idea}
                </p>
                <p className="mt-1 text-xs text-zinc-500">Startup Analysis</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
              {user?.user_metadata?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-800">
              {user?.user_metadata?.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-zinc-500">
          <button className="flex items-center gap-1.5 transition hover:text-zinc-800">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            onClick={handleSignOUT}
            className="flex items-center gap-1.5 transition hover:text-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-stone-100 lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-zinc-900">StartupIQ</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed slide-in drawer on mobile, static column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out
        lg:static lg:z-auto lg:h-screen lg:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 lg:h-screen overflow-y-auto px-6 py-10 lg:px-16">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            AI-powered validation
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
            Validate your <span className="text-amber-500">startup idea</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Describe your startup idea and let AI analyze its strengths,
            weaknesses, competitors, risks, and market opportunity.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mt-10 max-w-3xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your startup idea..."
              rows={3}
              className="w-full resize-none bg-transparent text-base text-zinc-800 placeholder:text-zinc-400 outline-none"
            />

            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
             

              <button
                type="submit"
                disabled={loading || idea.trim().length < 10}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Analyzing..." : "Run Analysis"}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">
              Something went wrong analyzing that idea. Try again.
            </p>
          )}
        </form>

        {!analysis && (
          <div className="mt-8 max-w-3xl rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <Lightbulb className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-zinc-900">
              Your startup journey starts here.
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try one of these to see how it works.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setIdea(prompt)}
                  className="w-full max-w-xl rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm text-zinc-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-14 max-w-6xl space-y-8">
            {/* SWOT */}
            {analysis.swot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-green-700 mb-3">Strengths</h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.strengths?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-red-700 mb-3">Weaknesses</h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.weaknesses?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-blue-700 mb-3">
                    Opportunities
                  </h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.opportunities?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-yellow-700 mb-3">Threats</h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.threats?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {analysis?.swot && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-zinc-800">
                  SWOT Overview Chart
                </h2>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={swotData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Competitors */}
            {analysis.competitors?.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-zinc-800">
                  Competitors
                </h2>
                <div className="flex flex-wrap gap-3">
                  {analysis.competitors.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunity Score */}
            {analysis.opportunityScore !== undefined && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="text-sm uppercase tracking-widest text-zinc-500">
                  Opportunity Score
                </h2>

                <p className="mt-3 text-6xl font-bold text-amber-500">
                  {analysis.opportunityScore}
                  <span className="text-2xl text-zinc-400">/100</span>
                </p>
              </div>
            )}

            {/* Investor Pitch */}
            {analysis.pitch && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-zinc-800">
                  Investor Pitch
                </h2>

                <p className="leading-8 text-zinc-600">{analysis.pitch}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}