// Deterministic-ish classifier: sorts a free-text decision description into the
// fixed 18-category taxonomy. Ported from the `extract-concerns` spec — same
// prompt, model, retry policy and fail-open fallback.

export const VALID_CATEGORIES = [
  // Constraint (11)
  "Time",
  "Money",
  "Effort",
  "Quality",
  "Reliability",
  "Risk & Uncertainty",
  "Accessibility",
  "Availability",
  "Logistics",
  "Requirements",
  "Convenience",
  // Wellbeing (7)
  "Enjoyment & Satisfaction",
  "True Passion",
  "Social & Relational",
  "Values, Identity & Ethics",
  "Accomplishment",
  "Health",
  "Financial Stability",
] as const;

// Used when the AI call fails after all retries. Fails OPEN — shows every
// constraint category — rather than closed (shows none). An irrelevant extra
// category on the rating screen is a minor annoyance; a silently missing
// relevant one defeats the point of the screen entirely.
export const CONSTRAINT_FALLBACK: string[] = [
  "Time",
  "Money",
  "Effort",
  "Quality",
  "Reliability",
  "Risk & Uncertainty",
  "Accessibility",
  "Availability",
  "Logistics",
  "Requirements",
  "Convenience",
];

const SYSTEM_PROMPT = `You are sorting a person's free-text description of a decision they're weighing into a fixed set of categories.

Read the input and identify which of the following categories are explicitly present — meaning the person said something that clearly touches that category, not something you're inferring might be relevant.

A single input is very often relevant to MORE than one category. Include every category that applies — do not limit yourself to one.

CATEGORIES

Constraint (external, comparable facts):
- Time: how much time this takes, relative to the alternative. e.g. "I don't have time for that."
- Money: cost or income impact, spending vs. earning. e.g. "This costs more." / "The new job pays more."
- Effort: work or exertion demanded, apart from time/money. e.g. "That's a lot of hassle."
- Quality: how well the option performs at what it's meant to do — a statement about its CURRENT condition. e.g. "The product is buggy."
- Reliability: how consistently it can be counted on, apart from how well it performs. e.g. "He's talented but misses deadlines."
- Risk & Uncertainty: chance something goes wrong, or not knowing enough to be sure — a statement about an UNCERTAIN FUTURE outcome. e.g. "What if it doesn't work out?"
- Accessibility: how easy the option is to reach or obtain in the first place. e.g. "I can't even get an appointment."
- Availability: whether it's there, open, in stock, or on offer when needed — services, appointments, opportunities only, never a person's relational presence. e.g. "They're fully booked."
- Logistics: practical coordination needed to make it happen. e.g. "I'd have to figure out childcare too."
- Requirements: prerequisites that must be met before the option is even possible. e.g. "You need experience first."
- Convenience: how easy it is once you're already using it, apart from how hard it was to get there. e.g. "There's no grocery store nearby."

Wellbeing (internal, felt states):
- Enjoyment & Satisfaction: feels good or is liked in itself. e.g. "It's a joy to be around them."
- True Passion: enjoyed enough that time or money spent doesn't register. e.g. "I'd do this even if I wasn't paid."
- Social & Relational: effect on relationships with people who matter. e.g. "He never actually makes time for us."
- Values, Identity & Ethics: alignment with who you are or what you believe is right. e.g. "That's just not me."
- Accomplishment: sense of achievement or progress. e.g. "I'd finally be able to say I did it."
- Health: effect on physical or mental wellbeing. e.g. "It stresses me out."
- Financial Stability: felt security or precarity, separate from the cost itself (Money). e.g. "I'm not sure I could handle it if things went wrong."

OUTPUT
Return ONLY a JSON object of this exact shape, with no other text:
{"categories": ["<category name>", "<category name>", ...]}

Each string in "categories" must be copied EXACTLY from the category names above — spelling, punctuation, and capitalization included. Do not invent new categories. Do not include a category unless the input actually said something that touches it. If nothing in the input clearly touches a category, leave it out entirely.`;

export type ClassifySource = "ai" | "fallback" | "empty";

export interface ClassifyResult {
  categories: string[];
  source: ClassifySource;
}

function isValidCategoryArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (c) => typeof c === "string" && (VALID_CATEGORIES as readonly string[]).includes(c),
    )
  );
}

async function callOpenAI(userMessage: string, apiKey: string): Promise<string[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Classify response missing message content");
  }

  const parsed = JSON.parse(content) as { categories?: unknown };

  if (!isValidCategoryArray(parsed?.categories)) {
    throw new Error("Classify response failed schema validation");
  }

  return parsed.categories;
}

const MAX_RETRIES = 2; // total attempts = MAX_RETRIES + 1
const BACKOFF_MS = [300, 900]; // delay before retry 1, retry 2

export async function classifyWithRetries(
  userMessage: string,
  apiKey: string,
): Promise<ClassifyResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const categories = await callOpenAI(userMessage, apiKey);
      return { categories, source: "ai" };
    } catch (error) {
      lastError = error;
      console.error(`Classify attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt]));
      }
    }
  }

  console.error("Classify exhausted all retries, falling back to full constraint list:", lastError);
  return { categories: CONSTRAINT_FALLBACK, source: "fallback" };
}

// Guard against runaway token cost on an unexpectedly huge input.
export const MAX_INPUT_LENGTH = 4000;
