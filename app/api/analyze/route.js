import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { idea } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
        "threats": []"
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
