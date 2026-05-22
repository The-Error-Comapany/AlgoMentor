const LEETCODE_GQL_URL = "https://leetcode.com/graphql";

async function queryLeetCode(query: string, variables: any = {}) {
  const response = await fetch(LEETCODE_GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API request failed with status ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`LeetCode GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

export async function fetchLCStats(username: string) {
  const query = `
    query matchedUser($username: String!) {
      matchedUser(username: $username) {
        profile { ranking }
        submitStats {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;
  const data = await queryLeetCode(query, { username });
  return data?.matchedUser || null;
}

export async function fetchLCTopics(username: string) {
  const query = `
    query matchedUser($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          fundamental { tagName problemsSolved }
        }
      }
    }
  `;
  const data = await queryLeetCode(query, { username });
  return data?.matchedUser?.tagProblemCounts || null;
}

export async function fetchLCSubmissions(username: string, limit: number = 10) {
  const query = `
    query recentAcSubmissionList($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title titleSlug timestamp lang
      }
    }
  `;
  const data = await queryLeetCode(query, { username, limit });
  return data?.recentAcSubmissionList || [];
}

export async function fetchLCContestRating(username: string) {
  const query = `
    query userContestRanking($username: String!) {
      userContestRanking(username: $username) {
        rating globalRanking attendedContestsCount
      }
    }
  `;
  const data = await queryLeetCode(query, { username });
  return data?.userContestRanking || null;
}

export async function fetchLCPOTD() {
  const query = `
    query activeDailyCodingChallengeQuestion {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title difficulty titleSlug
          topicTags { name }
        }
      }
    }
  `;
  const data = await queryLeetCode(query);
  return data?.activeDailyCodingChallengeQuestion || null;
}

export async function fetchLCUpcomingContests() {
  const query = `
    query upcomingContests {
      upcomingContests {
        title titleSlug startTime duration
      }
    }
  `;
  const data = await queryLeetCode(query);
  return data?.upcomingContests || [];
}
