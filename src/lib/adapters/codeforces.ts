const CF_BASE_URL = "https://codeforces.com/api";

async function fetchCF(endpoint: string) {
  const response = await fetch(`${CF_BASE_URL}/${endpoint}`, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(`Codeforces API request failed with status ${response.status}`);
  }

  const json = await response.json();
  if (json.status !== "OK") {
    throw new Error(json.comment || "Unknown Codeforces error");
  }
  return json.result;
}

export async function fetchCFUser(handle: string) {
  const result = await fetchCF(`user.info?handles=${handle}`);
  return result[0];
}

export async function fetchCFRatingHistory(handle: string) {
  return await fetchCF(`user.rating?handle=${handle}`);
}

export async function fetchCFSubmissions(handle: string, count: number = 20) {
  return await fetchCF(`user.status?handle=${handle}&count=${count}`);
}

export async function computeCFTopicStats(handle: string): Promise<{ topicStats: Record<string, number>, activeDates: string[], weeklySolved: number, totalUniqueSolved: number }> {
  const submissions = await fetchCF(`user.status?handle=${handle}&count=10000`);
  const acceptedUnique = new Map<string, string[]>(); // Map problemKey -> tags[]
  const activeDatesSet = new Set<string>();
  
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  let weeklySolved = 0;

  for (const sub of submissions) {
    if (sub.verdict === "OK" && sub.problem) {
      const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
      
      let isNewUnique = false;
      if (!acceptedUnique.has(problemKey)) {
        acceptedUnique.set(problemKey, sub.problem.tags || []);
        isNewUnique = true;
      }
      
      if (sub.creationTimeSeconds) {
        const date = new Date(sub.creationTimeSeconds * 1000);
        activeDatesSet.add(date.toDateString());
        
        if (isNewUnique && date >= startOfWeek) {
          weeklySolved++;
        }
      }
    }
  }

  const tagCounts: Record<string, number> = {};
  for (const tags of acceptedUnique.values()) {
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return { topicStats: tagCounts, activeDates: Array.from(activeDatesSet), weeklySolved, totalUniqueSolved: acceptedUnique.size };
}

export async function fetchCFUpcomingContests() {
  const contests = await fetchCF("contest.list");
  // Filter for upcoming contests (phase === 'BEFORE')
  const upcoming = contests.filter((c: any) => c.phase === "BEFORE");
  return upcoming.map((c: any) => ({
    id: c.id,
    name: c.name,
    startTimeSeconds: c.startTimeSeconds,
    durationSeconds: c.durationSeconds,
  }));
}
