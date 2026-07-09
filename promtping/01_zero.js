import { OpenAI } from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Directly Asking the question to the model in a single prompt style.
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Tell me a dark joke?" }],
});

console.log(response.choices[0].message.content);
