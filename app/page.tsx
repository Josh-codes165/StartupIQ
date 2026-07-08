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
export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
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
      return () => {
        subscription?.unsubscribe();
      };
    });
  }, []);

  const handleSignOUT = () => {
    supabase.auth.signOut().then(() => {
      router.replace("/login")
    })
  }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!idea.trim()) return;
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
  const tags = ["market", "competitors", "swot", "score"];

  return (
    <main className="min-h-screen bg-stone-100 flex">
      <aside className="hidden lg:flex w-72 h-screen flex-col border-r border-zinc-200 bg-white">
        {loadingHistory && (
          <p className="px-5 pt-5 text-sm text-zinc-500">Loading history...</p>
        )}

        <div className="px-5 py-6 border-b border-zinc-100">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Recent Analyses
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
              No analyses yet
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAnalysis(item.analysis);
                    setIdea(item.idea);
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
        <div className=" mt-4 mb-3 flex items-center gap-3 px-5">
          {user?.user_metadata?.avatar_url && (
            <Image
              src={user?.user_metadata.avatar_url}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className=" text-sm font-medium text-zinc-700">
              {user?.user_metadata.name}
            </p>

            <button onClick={handleSignOUT} className=" bg-amber-500 rounded-2xl py-0.5 px-3 font-semibold text-white transition-all duration-200 hover:bg-amber-600 hover:shadow-lg active:scale-[0.98]">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 h-screen overflow-y-auto px-6 py-8 lg:px-12">
        <section className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            AI Startup Validator
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
            Validate your startup idea
            <span className="block text-zinc-400">before you build it.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Get instant competitor research, SWOT analysis, opportunity scores,
            market insights, and investor-ready summaries in seconds.
          </p>
        </section>
        <form onSubmit={handleSubmit} className="mt-10 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100">
            <div className="flex flex-col lg:flex-row">
              <div className="flex flex-1 items-center gap-3 px-6 py-5">
                <span className="text-xl">💡</span>

                <input
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your startup idea..."
                  className="w-full bg-transparent text-base text-zinc-800 placeholder:text-zinc-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !idea.trim()}
                className="flex items-center justify-center bg-amber-500 px-8 py-5 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Run Analysis"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {analysis && (
          <div className="mt-14 max-w-6xl space-y-8 ">
            {/* SWOT */}
            {analysis.swot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-4 text-lg font-semibold text-green-600">
                  <h2 className="font-bold text-green-700 mb-3">Strengths</h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.strengths?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 text-lg font-semibold text-green-600">
                  <h2 className="font-bold text-red-700 mb-3">Weaknesses</h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.weaknesses?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 text-lg font-semibold text-blue-600">
                  <h2 className="font-bold text-blue-700 mb-3">
                    Opportunities
                  </h2>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {analysis.swot.opportunities?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 text-lg font-semibold text-yellow-600">
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
              <div className="flex flex-wrap gap-3 mt-4">
                <h2 className="mb-6 text-xl font-semibold text-zinc-800">
                  Competitors
                </h2>
                <br />
                {analysis.competitors.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700"
                  >
                    {c}
                  </span>
                ))}
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
