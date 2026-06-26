export async function fetchGFGStats(username: string) {
  const url = `https://gfgstatscard.vercel.app/${username}?raw=true`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(`GeeksforGeeks API request failed with status ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}

export async function fetchGFGPOTD() {
  const url = `https://practiceapi.geeksforgeeks.org/api/vr/problems-of-day/problem/today/`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(`GeeksforGeeks POTD API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}
