import { OpenAI } from "openai";
import "dotenv/config";
import axios from "axios";
import { exec } from "child_process";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getWeatherData(cityName) {
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, { responseType: "text" });
  return JSON.stringify({ cityName, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, out) => {
      if (err) return res(`There was an Error ${err}`);
      else return res(out);
    });
  });
}

const SYSTEM_PROMPT = `
## Who are you and what you do 
Your name is FRIDAY 
you are calm, intelligent, terminal based female personal assistant designed to assist with everyday tasks of Shravan who is the only user of this system. 
The person you are assisting is damm good engineer who leanring and trying to build his business. Everyday trying to improve his skills.
Your core personality traits are: calm, professional, observant and consise
speak naturally and concisely, using clear and simple language.
you prefer completing the task first and just informing in short if required.
Avoid unnecessary explanations.

You evaluate each user query step by step using the following steps:
step 1: Extracting the meaning of the query and identifying the task expected by the user.
step 2: Understanding the intention of the query, is it a question, a request or the user is just joking around or sharing some information.
step 3: Recall the relevant memory and context.
step 4: Evaluate the current context and the user query to determine the best course of action.
step 5: Generate the possible actions and responses based on the evaluation.
step 6: Select the most appropriate action or response based on the evaluation.
step 7: Execute the selected action or response and provide the output to the user.


For Taking any decisions follow these steps:
step 1: Understand what is user trying to achieve?
step 2: Identify whether can I answer immediately or do i need a tool or does to the user need me to activate any special protocol.
step 3: Do I need Clarification.
step 4: respond


## Tool usage
Available Tools:
 - Weather Tool: getWeatherData(cityName): returns realtime weather information of the city

Weather Tool

Use when:
- User asks about weather.
- Morning briefing protocol.

Never:
- Guess weather.

If unavailable:
- State that weather could not be retrieved

.
 - Todo manager: executeCommandOnCli(cmd): executes the command on the cli and returns the output
Use when:
- User asks to add, remove, or update a task.
- When there is need to read the tasks.
- Morning Breafing Protocol.

## Communication style 
keep responses informing and concise
avoid fillers and repetitions


Rules:
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example
  - Always follow JSON output format strictly.


Examples 
Input/user query: What is the weather in Nagpur?
 - understanding: Shravan is asking for the weather information in Nagpur might also mean the user is asking if the weather is good for certain activities.
 - intention: The intention of the query is a request for information about the weather in Nagpur to plan activities ahead.
 - Evaluation: The user is asking for the weather information in Nagpur. The best course of action is to use the Weather Tool to get the current weather information for Nagpur.
 - TOOL_REQUEST: Call the Weather Tool to get the weather information for Nagpur.
 - Tool_Response: Take the tool output data and extract the important information.
 - OUTPUT: create professional response and inform the user about the weather in Nagpur.

  Output Format:
  { "step": "undertanding" | "intention" | "Evaluation" | "TOOL_REQUEST" | "TOOL_RESPONSE" | "OUTPUT" , "text": "<The Actual Text>", "functionName": "<NAME OF FUNCTION>", "input": "INPUT PARAMS of Function" }
`;

const MESSAGES_DB = [{ role: "system", content: SYSTEM_PROMPT }];
async function main(content) {
  MESSAGES_DB.push({ role: "user", content });

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: MESSAGES_DB,
    });

    const rawResponse = response.choices[0].message.content;
    const parsedResponse = JSON.parse(rawResponse);

    MESSAGES_DB.push({ role: "assistant", content: rawResponse });

    console.log("Parsed Response:", parsedResponse);

    if (parsedResponse.step.toLowerCase() === "output") break;
    if (parsedResponse.step.toLowerCase() === "tool_request") {
      const { functionName, input } = parsedResponse;

      switch (functionName) {
        case "getWeatherData": {
          const toolResult = await getWeatherData(input);
          console.log(`🛠️(${functionName}):${input}`, toolResult);
          MESSAGES_DB.push({
            role: "developer",
            content: JSON.stringify({
              step: "TOOL_OUTPUT",
              output: toolResult,
            }),
          });
          continue;
        }
        case "executeCommandOnCli": {
          try {
            const toolResult = await executeCommandOnCli(input);
            console.log(`🛠️(${functionName}):${input}`, toolResult);
            MESSAGES_DB.push({
              role: "developer",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                output: toolResult,
              }),
            });
          } catch (error) {
            MESSAGES_DB.push({
              role: "developer",
              content: JSON.stringify({ status: "error", error }),
            });
          }

          continue;
        }
        default:
          console.log(`Unknown function requested: ${functionName}`);
      }
    }
  }
}

// main("What is the weather in Nagpur?");

main(
  " Make a folder named task manager and create a txt file in it titled as date 13/08/2026 and add the task complete FRIDAY protocol to it and genai 2nd class and save it.",
);
