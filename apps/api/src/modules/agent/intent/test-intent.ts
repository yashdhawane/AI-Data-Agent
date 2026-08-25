import "dotenv/config";

import { createLlmService } from "../../llm/llm.factory.js";
import { IntentService } from "./intent.service.js";

const llmService = createLlmService();
const intentService = new IntentService(llmService);

const questions = [
  "Show me all customers",
  "How many customers do we have?",
  "Remove all customers",
  "Wipe the customer records",
  "Get rid of inactive customers",
  "How many customers were removed last month?",
  "What is the weather today?",
];

for (const question of questions) {
  const intent = await intentService.classify(question);

  console.log(
    `${intent.padEnd(20)} | ${question}`,
  );
}