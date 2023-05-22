const countVotes = (arr, key, matchPlayers) => {
  // Create an empty object to store frequency of each key value
  let freq = {};
  let ranking = [];

  // Loop through the array and increment the count for each key value
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i][key];
    if (freq[value] === undefined) {
      freq[value] = 1;
    } else {
      freq[value]++;
    }
  }

  // Iterate over the object and return the key-value pairs where the value is greater than one
  for (let key in freq) {
    if (freq[key] > 0) {
      ranking.push({
        playerId: Number(key),
        votes: freq[key],
        playerName: matchPlayers.find((player) => player["player_id"] === Number(key)).player_name,
      });
    }
  }
  return ranking;
};

const parseVotes = (array) => {
  return [...array]
    .sort((a, b) => b.votes - a.votes)
    .splice(0, 3)
    .filter((player) => player.votes > 0);
};

module.exports = { countVotes, parseVotes };
