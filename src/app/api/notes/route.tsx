import { YoutubeTranscript } from "youtube-transcript";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function GET() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const ytTrans = await YoutubeTranscript.fetchTranscript(
    "https://www.youtube.com/watch?v=F4O1uvKOofI",
  );

  const data = ytTrans.map((item) => item.text).join(" ");

  const parts = [
    {
      text: `summarize ${ytTrans.map((item) => item.text).join(" ")} but in english`,
    },
    {
      text: `input: summarize ${ytTrans.map((item) => item.text).join(" ")}but in english`,
    },

    { text: "output: your response but in english" },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    safetySettings,
  });
  const responseText =
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(responseText);

  return new Response(responseText);
}
