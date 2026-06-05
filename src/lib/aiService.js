
// Predefined high-quality cards for standard library problems to ensure instant load times and perfect accuracy
const PREDEFINED_CARDS = {
  "coin change": {
    pattern: "Unbounded Knapsack / Dynamic Programming",
    coreIdea: "Build the minimum number of coins needed for every amount from 1 to 'amount' by utilizing previously computed subproblems.",
    stateDefinition: "dp[i] = minimum coins needed to make amount i.",
    transitionLogic: "dp[i] = min(dp[i], dp[i - coin] + 1) for each coin in coins.",
    timeComplexity: "O(N * amount) where N is the number of coins.",
    spaceComplexity: "O(amount) for the 1D DP table.",
    commonMistakes: "1. Incorrectly initializing the DP array with 0 or a value too small instead of 'amount + 1' (representing infinity).\n2. Forgetting to check if amount - coin is valid (>= 0).",
    interviewInsights: "This is a classic DP problem that interviews frequently use to test your understanding of bottom-up state construction. Be prepared to explain why a greedy approach (always choosing the largest coin) fails (e.g. coins=[1, 3, 4], amount=6).",
    relatedProblems: ["House Robber", "Partition Equal Subset Sum", "Perfect Squares"]
  },
  "two sum": {
    pattern: "Hashing / Array",
    coreIdea: "Use a hash map to look up the complement (target - current_value) in O(1) time while iterating through the array.",
    stateDefinition: "hash_map[value] = index. We check if (target - num) exists in the map.",
    transitionLogic: "For each element, check if target - num is in map. If yes, return index and map[target - num]. Else, insert (num, index).",
    timeComplexity: "O(N) where N is the length of the array.",
    spaceComplexity: "O(N) to store elements in the hash map.",
    commonMistakes: "1. Using the same element twice (e.g. target is 6, element is 3, map finds the same index).\n2. Incorrectly sorting the array and using two pointers if they need to return original indices.",
    interviewInsights: "The foundational problem of coding interviews. Demonstrate efficiency by showing why a hash map is better than the O(N^2) brute-force nested loops.",
    relatedProblems: ["3Sum", "Two Sum II - Input Array Is Sorted", "4Sum"]
  },
  "longest consecutive sequence": {
    pattern: "HashSet / Array",
    coreIdea: "Insert all numbers into a HashSet to allow O(1) lookups. Only start building a sequence from a number if it is the start of a sequence (i.e. number - 1 is not in the set).",
    stateDefinition: "Set lookup for existence. Increment length while number + 1 exists.",
    transitionLogic: "For each num: if (num - 1) is not in Set, trace sequence: check if num + current_length is in Set and count.",
    timeComplexity: "O(N) because each element is visited at most twice.",
    spaceComplexity: "O(N) to store elements in the Set.",
    commonMistakes: "1. Not checking if (num - 1) is present, leading to an O(N^2) runtime due to repeating sequence checks.",
    interviewInsights: "Shows how to trade space for time. The interviewer will look for the start-of-sequence check (num - 1) as the key optimization.",
    relatedProblems: ["Longest Increasing Subsequence", "Find Consecutive Integers from a Data Stream"]
  },
  "valid anagram": {
    pattern: "Frequency Counter / Hashing / String",
    coreIdea: "Count the occurrences of each character in both strings and compare counts. A single array of size 26 can act as the frequency counter.",
    stateDefinition: "count_array[char - 'a'] = frequency difference.",
    transitionLogic: "Increment count for each char in s, decrement for each char in t. Verify all index values are 0.",
    timeComplexity: "O(N) where N is the length of the strings.",
    spaceComplexity: "O(1) auxiliary space (fixed size 26 for English lowercase letters).",
    commonMistakes: "1. Not handling unicode or uppercase characters correctly if not specified.\n2. Assuming strings of different lengths can be anagrams (check lengths first).",
    interviewInsights: "A simple problem that tests clean code, boundary checks (length inequality), and space optimization (using a 26-int array instead of two hash maps).",
    relatedProblems: ["Group Anagrams", "Find All Anagrams in a String"]
  },
  "best time to buy and sell stock": {
    pattern: "Sliding Window / Dynamic Programming / Array",
    coreIdea: "Track the minimum price seen so far as you iterate through prices, and calculate the potential profit at each day.",
    stateDefinition: "min_price_so_far, max_profit.",
    transitionLogic: "For each price: min_price = min(min_price, price); max_profit = max(max_profit, price - min_price).",
    timeComplexity: "O(N) where N is the number of prices.",
    spaceComplexity: "O(1) auxiliary space.",
    commonMistakes: "1. Trying to buy on a day that is after the sell day.\n2. Using nested loops resulting in O(N^2) timeout.",
    interviewInsights: "Classic single-pass greedy approach. Often used as an introductory sliding window problem.",
    relatedProblems: ["Best Time to Buy and Sell Stock II", "Best Time to Buy and Sell Stock with Cooldown"]
  }
};

// Generates a mock card dynamically in case of API failure or missing keys
const generateHeuristicCard = (title, difficulty, tags) => {
  const primaryTag = tags && tags.length > 0 ? tags[0] : "General";
  return {
    pattern: `${primaryTag.toUpperCase()} / Dynamic Analysis`,
    coreIdea: `Solve the problem "${title}" by leveraging data structures or algorithms suitable for ${primaryTag}.`,
    stateDefinition: `For ${primaryTag} problems, define a search space, state parameters, or optimal sub-structures.`,
    transitionLogic: `Construct the output step-by-step or combine results from sub-states iteratively.`,
    timeComplexity: difficulty === "Easy" ? "O(N)" : difficulty === "Medium" ? "O(N log N) or O(N)" : "O(N^2) or O(2^N)",
    spaceComplexity: difficulty === "Easy" ? "O(1)" : "O(N) auxiliary space",
    commonMistakes: "1. Missing base case boundary checks.\n2. Incorrect array size index or stack overflow from deep recursion.",
    interviewInsights: "Be ready to explain the trade-offs between space and time complexity for this solution, and write code cleanly.",
    relatedProblems: ["Two Sum", "Coin Change", "Climbing Stairs"]
  };
};

/**
 * Generates an AI Revision Card using the Python FastAPI Backend
 * @param {string} title 
 * @param {string} difficulty 
 * @param {string[]} tags 
 * @returns {Promise<IKnowledgeCard>}
 */
export async function generateRevisionCard(title, difficulty, tags) {
  const cleanTitle = title.trim().toLowerCase();
  
  // 1. Check predefined cards first for instant load
  if (PREDEFINED_CARDS[cleanTitle]) {
    return PREDEFINED_CARDS[cleanTitle];
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/generate-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        difficulty,
        tags: tags || []
      })
    });

    if (!response.ok) {
      throw new Error(`Python AI Service response status ${response.status}`);
    }

    const card = await response.json();
    return card;
  } catch (error) {
    console.error("Failed to generate AI card using Python Backend. Falling back to heuristics.", error);
    return generateHeuristicCard(title, difficulty, tags);
  }
}
