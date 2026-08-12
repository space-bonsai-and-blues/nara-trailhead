import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ClassifyResult } from "./extract-concerns.server";

const ExtractConcernsInput = z.object({ userMessage: z.string() });

export const extractConcerns = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ExtractConcernsInput.parse(input))
  .handler(async ({ data }): Promise<ClassifyResult> => {
    const { CONSTRAINT_FALLBACK, MAX_INPUT_LENGTH, classifyWithRetries } = await import(
      "./extract-concerns.server"
    );

    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return { categories: CONSTRAINT_FALLBACK, source: "fallback" };
    }

    const userMessage = data.userMessage;
    if (!userMessage.trim()) {
      // Nothing to classify — distinct from an AI failure, so this stays an
      // empty list rather than the fail-open fallback.
      return { categories: [], source: "empty" };
    }

    const trimmedMessage =
      userMessage.length > MAX_INPUT_LENGTH ? userMessage.slice(0, MAX_INPUT_LENGTH) : userMessage;

    try {
      return await classifyWithRetries(trimmedMessage, apiKey);
    } catch (error) {
      console.error("Unexpected error in classify handler:", error);
      return { categories: CONSTRAINT_FALLBACK, source: "fallback" };
    }
  });
