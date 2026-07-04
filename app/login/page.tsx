"use client";

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
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <button onClick={signIn} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Continue with Google
      </button>
    </main>
  );
}