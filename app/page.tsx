"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const swotData = analysis?.swot
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
    <main className="min-h-screen w-full bg-stone-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-4xl flex flex-col items-center gap-12">
        <section className="w-full text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            ai diagnostic for early-stage ideas
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 mb-6">
            Validate Your
            <span className="block text-stone-400">Startup Idea</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-stone-600 mb-12">
            Run your idea through the scanner for instant competitor analysis,
            SWOT reports, opportunity scores, market insights, and
            investor-ready summaries.
          </p>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="flex-1 flex items-center gap-3 px-6 py-5">
                  <span className="font-mono text-amber-400">$</span>
                  <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="describe your idea, e.g. an ai matchmaking platform for student internships"
                    className="flex-1 bg-transparent font-mono text-base text-zinc-100 placeholder-zinc-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !idea.trim()}
                  className="flex items-center justify-center gap-2 px-8 py-5 bg-amber-400 text-zinc-950 font-mono font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading && (
                    <span className="h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                  )}
                  {loading ? "analyzing" : "run analysis"}
                </button>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {tags.map((tag) => (
              <div
                key={tag}
                className="rounded-md border border-stone-300 px-4 py-1.5 text-sm font-mono text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
              >
                [{tag}]
              </div>
            ))}
          </div>
        </section>

        {analysis && (
          <div className="w-full max-w-5xl mt-16 space-y-10">
            {/* SWOT */}
            {analysis.swot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h2 className="font-bold text-green-700 mb-3">Strengths</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {analysis.swot.strengths?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h2 className="font-bold text-red-700 mb-3">Weaknesses</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {analysis.swot.weaknesses?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h2 className="font-bold text-blue-700 mb-3">
                    Opportunities
                  </h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {analysis.swot.opportunities?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <h2 className="font-bold text-yellow-700 mb-3">Threats</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {analysis.swot.threats?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {analysis?.swot && (
              <div className="w-full max-w-5xl mt-10 bg-white border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-center">
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
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-blue-600 mb-3">Competitors</h2>
                <ul className="list-disc pl-5 text-gray-700">
                  {analysis.competitors.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunity Score */}
            {analysis.opportunityScore !== undefined && (
              <div className="text-center bg-white border rounded-xl p-8 shadow-sm">
                <h2 className="text-blue-600 text-left font-bold mb-2">
                  Opportunity Score
                </h2>
                <p className="text-5xl font-bold text-green-600">
                  {analysis.opportunityScore} / 100
                </p>
              </div>
            )}

            {/* Investor Pitch */}
            {analysis.pitch && (
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="font-bold text-blue-600 mb-3">Investor Pitch</h2>
                <p className="text-gray-700 leading-relaxed">
                  {analysis.pitch}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
