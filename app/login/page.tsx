"use client";

import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) {
      console.error(error);
    }
  };
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-lg sm:p-10">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900">StartupIQ</span>
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">
              Validate your startup idea before you build.
            </h1>

            <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              Use AI to analyze startup ideas, discover competitors, identify
              risks, and generate investor-ready insights in seconds.
            </p>
          </div>

          <button
            onClick={signIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 px-4 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-amber-600 hover:shadow-lg active:scale-[0.98] sm:px-6 sm:py-4 sm:text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.7 6.8l6.2 5.2C38.5 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <p className="text-sm text-stone-500 text-center">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </main>
  );
}