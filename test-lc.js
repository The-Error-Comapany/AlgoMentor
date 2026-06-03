fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query matchedUser($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
      }
    `,
    variables: { username: "neal_wu" }
  })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2)));
