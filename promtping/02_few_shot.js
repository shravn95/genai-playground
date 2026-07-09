import { OpenAI } from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// provide with a sample input and output the model to make the response more predictable and in a specific format. This is called few-shot prompting.
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: `Tell me a dark joke. In the format a comedian would do on stage for example 
        - comedian (samay): ---- question
        - audience: ---- guesses
        - comedian (samay): ---- punchline
        `,
    },
  ],
});

console.log(response.choices[0].message.content);
