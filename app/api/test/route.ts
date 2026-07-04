import { supabase } from "@/app/lib/supabase";
export async function GET() {
  const { data, error } = await supabase
    .from("analyses")
    .insert([
      {
        idea: "Test Startup",
        analysis: {
          score: 8,
          message: "Database test",
        },
      },
    ])
    .select();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}