// Base URL for the Python FastAPI AI service.
// Override with AI_SERVICE_URL env var in production.
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Generates a mock card dynamically in case of API failure or missing keys
const generateHeuristicCard = (title, difficulty, tags, patternUsed = "") => {
  const primaryTag = tags && tags.length > 0 ? tags[0] : "General";
  const patt = patternUsed || `${primaryTag.toUpperCase()} / Dynamic Analysis`;
  return {
    pattern: patt,
    coreIdea: `Solve the problem "${title}" by leveraging data structures or algorithms suitable for ${patt}.`,
    stateDefinition: `For ${patt} problems, define a search space, state parameters, or optimal sub-structures.`,
    transitionLogic: `Construct the output step-by-step or combine results from sub-states iteratively.`,
    timeComplexity: difficulty === "Easy" ? "O(N)" : difficulty === "Medium" ? "O(N log N) or O(N)" : "O(N^2) or O(2^N)",
    spaceComplexity: difficulty === "Easy" ? "O(1)" : "O(N) auxiliary space",
    commonMistakes: "1. Missing base case boundary checks.\n2. Incorrect array size index or stack overflow from deep recursion.",
    interviewInsights: "Be ready to explain the trade-offs between space and time complexity for this solution, and write code cleanly.",
    relatedProblems: ["Two Sum", "Coin Change", "Climbing Stairs"]
  };
};

/**
 * Generates an AI Revision Card using the Python FastAPI Backend (Quick Add Mode)
 */
export async function generateQuickCard(title, difficulty, tags, patternUsed, personalNotes) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/generate-quick-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, difficulty, tags: tags || [], patternUsed, personalNotes })
    });

    if (!response.ok) throw new Error(`Python AI Service response status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to generate quick AI card. Falling back.", error);
    return generateHeuristicCard(title, difficulty, tags, patternUsed);
  }
}

/**
 * Generates an AI Revision Card using the Python FastAPI Backend (Solution Mode)
 */
export async function generateSolutionCard(title, difficulty, tags, programmingLanguage, solutionCode) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/generate-solution-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, difficulty, tags: tags || [], programmingLanguage, solutionCode })
    });

    if (!response.ok) throw new Error(`Python AI Service response status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to generate solution AI card. Falling back.", error);
    return generateHeuristicCard(title, difficulty, tags);
  }
}

/**
 * Alias used by the generate-card API route for standalone card regeneration.
 * Delegates to generateQuickCard with empty pattern/notes so the LLM infers them.
 */
export async function generateRevisionCard(title, difficulty, tags) {
  return generateQuickCard(title, difficulty, tags, "", "");
}
