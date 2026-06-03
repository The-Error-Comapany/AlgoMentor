const query = `
  query userProfileCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        streak
        totalActiveDays
        dccBadges {
          timestamp
          badge { name }
        }
      }
    }
  }
`;
fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { username: 'RrbsNNzHrK' } })
}).then(r => r.json()).then(data => console.log(JSON.stringify(data.data.matchedUser, null, 2))).catch(console.error);
