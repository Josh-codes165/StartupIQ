import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/app/lib/supabase";
import { error } from "console";

export async function POST(req) {
  try {
    const { idea, userId } = await req.json();

    if (!userId) {
      return Response.json(
        {
          error: "User is not authenticated.",
        },
        {
          status: 401,
        },
      );
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const result = await model.generateContent(`
        Return ONLY valid JSON.
        Do NOT wrap it in markdown.
        Do NOT use triple backticks.
        Do NOT add explanation.

        Return exactly this format:

        {
        "swot" : {
        "strengths": [],
        "weaknesses": [],
        "opportunities": [],
        "threats": []
    },
    "competitors" : [
    "Competitor 1",
    "Competitor 2"
    ],

    "opportunityScore": 0,

    "risk" : [
    "Risk 1",
    "Risk 2"
    ],

    "pitch": "A short investor-ready pitch (max 4 lines)"
        }

        Startup idea:
        ${idea}
`);
    let text = result.response.text();
    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");

    const data = JSON.parse(text);

    const { data: savedData, error } = await supabase
      .from("analyses")
      .insert([
        {
          idea,
          analysis: data,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      console.log("supabase insert error", error);
      throw new Error(error.message);
    }
    console.log("saved to supabase", savedData);

    return Response.json(data);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to analyze idea",
      },
      {
        status: 500,
      },
    );
  }
}
