const query = `
  query getPOTDStreak($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        streak
      }
    }
  }
`;
fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { username: 'RrbsNNzHrK' } })
}).then(r => r.json()).then(data => console.dir(data, {depth: null})).catch(console.error);
