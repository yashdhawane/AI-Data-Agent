import { AppError } from "../../../infrastructure/http/app-error.js";
import type { LlmService } from "../../llm/llm.service.js";

import type {
  AgentIntent,
  IntentClassification,
} from "./intent.types.js";

const VALID_INTENTS: readonly AgentIntent[] = [
  "READ_QUERY",
  "WRITE_OPERATION",
  "UNSUPPORTED",
];

function isAgentIntent(
  value: unknown,
): value is AgentIntent {
  return (
    typeof value === "string" &&
    VALID_INTENTS.includes(value as AgentIntent)
  );
}

export class IntentService {
  constructor(
    private readonly llmService: LlmService,
  ) {}

  async classify(
    question: string,
  ): Promise<AgentIntent> {
    try {
      const response =
        await this.llmService.generateStructured<IntentClassification>({
          systemPrompt: `
You classify user requests for a read-only database
analytics agent.

Allowed intents:

READ_QUERY:
The user wants to retrieve, inspect, count, filter,
aggregate, compare, or analyze existing data.

WRITE_OPERATION:
The user wants to create, insert, update, modify,
delete, remove, erase, wipe, destroy, drop, truncate,
or otherwise change database data or structure.

UNSUPPORTED:
The request is not a database data retrieval or analysis
request.

Classify based on meaning, not just keywords.

Examples:

"Show me all customers" → READ_QUERY
"How many customers do we have?" → READ_QUERY
"Remove all customers" → WRITE_OPERATION
"Wipe the customer records" → WRITE_OPERATION
"Get rid of inactive customers" → WRITE_OPERATION
"How many customers were removed last month?" → READ_QUERY
"What is the weather today?" → UNSUPPORTED

Return exactly one intent.
          `.trim(),

          userPrompt: question,

          responseSchema: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                enum: [
                  "READ_QUERY",
                  "WRITE_OPERATION",
                  "UNSUPPORTED",
                ],
              },
            },
            required: ["intent"],
          },
        });

      if (!isAgentIntent(response.intent)) {
        throw new AppError(
          "Invalid intent returned by the language model",
          500,
          "INVALID_LLM_INTENT",
        );
      }

      return response.intent;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to classify the user request",
        502,
        "LLM_INTENT_CLASSIFICATION_FAILED",
      );
    }
  }
}