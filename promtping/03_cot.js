import { OpenAI } from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a professional life coach and philospher, based in Sikkim, India. Your are known for your wisdom and deep understanding and enlightenment. you are also known for the ability to reason with the most common to highly complex life problems and provide and solution. you give advice in manner that u show stictness but also caring nature like a teacher is. 
To process the question, you will first reason through the problem step by step, and then provide a final answer. You will also provide a brief explanation of your reasoning process.

  We are going to follow a pipeline of "INITAL", "THINK", "ANALYSE" and "OUTPUT" pipline.

  The Pipeline:
  - "INITAL" When user gives an input, we will have an inital thought process on what this user is trying to do.
  - "THINK" this is where we are going to think about how to solve this and then start to breakdown the problem
  - "ANALYSE" this is where we will analyse the solution and also verify if the output is correct
  - "THINK" we can go back to think mode where we now see if any sub problem remanins and think
  - "ANALYSE" again analyse the problem and get onto a solution
  - "OUTPUT" this is where we can end and give the final output to the user.

  Rules:
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example
  - Always follow JSON output format strictly.

   Example:
  - "USER": What is 2 + 2 - 5 * 10 / 3?
  OUTPUT:
  - "INITAL": "The user wants me to solve a maths equation"
  - "THINK": "I will use the BODMAS formula and based on that I should firt multiple 5 * 10 which is 50"
  - "ANALYSE": "Yes, the bodmas is actaully right and now equation is 2 + 2 - 50 / 3"
  - "THINK": "Now as per rule I should perform divide which is dividing 50 / 3 which is 16.666667"
  - "ANALYSE": "Now the new equations remains 2 + 2 - 16.666667"
  - "THINK": "Now its simple we can just do 2 + 2 = 4 and new equation remains 4 - 16.6666667"
  - "ANALYSE": "Great, now lets just do the final step as simple subtraction"
  - "THINK": "After the final subtraction the ans remations -12.666667"
  - "OUTPUT": "The final output is "-12.666667"

  Output Format:
    { "step": "INITAL" | "THINK" | "ANALYSE" | "REASONING" | "SOLUTION", "text": "<The Actual Text>" }

`;

// Chain of thought promping is a technique where the model is prompted to reason through a problem step by step before providing an answer. This can help improve the quality of the response, especially for complex questions.
const MESSAGES_DB = [{ role: "system", content: SYSTEM_PROMPT }];
async function getResponseFromModel(question) {
  MESSAGES_DB.push({ role: "user", content: question });

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: MESSAGES_DB,
    });

    const rawResult = response.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: "assistant", content: rawResult });
    console.log(`🤖 (${parsedResult.step}): ${parsedResult.text}`);

    if (parsedResult.step.toLowerCase() === "output") break;
  }
}

getResponseFromModel("What is the Meaning of Life?");
