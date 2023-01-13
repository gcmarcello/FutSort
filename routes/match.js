const router = require("express").Router();
const { json } = require("express");
const pool = require("../db");
const authorization = require("../middleware/Authorization");

// Retrieve Players for Match Pick
router.get("/creatematch/:id/playerlist", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const players = await pool.query(
      "SELECT DISTINCT player_id,player_name,player_goals,player_assists,player_matches,player_stars FROM players AS p INNER JOIN groups AS g ON p.group_id = $1 ORDER BY player_name ASC",
      [id]
    );
    res.json(players.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Create Match Form Submit
router.post("/creatematch/", authorization, async (req, res) => {
  try {
    const { groupId, matchDate, numberOfTeams, playersPerTeam, pickedPlayers, pickedGoalkeepers } = req.body;
    let playersToSort = [];
    let seeds = [];
    var teams = [];

    const match = await pool.query(
      "INSERT INTO matches (group_id, match_date, match_numofteams, match_playersperteam, match_status) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [groupId, matchDate, numberOfTeams, playersPerTeam, "open"]
    );
    const matchId = match.rows[0].match_id;

    for (let i = 0; i < pickedPlayers.length; i++) {
      const response = await pool.query(
        "SELECT DISTINCT player_id, player_name, player_stars, player_goals, player_assists, player_matches FROM players WHERE player_id = $1",
        [pickedPlayers[i]]
      );
      playersToSort.push(...response.rows);
    }

    // Defining Top Scorer and Assistants from chosen players to use as reference
    const averageTopScorer = playersToSort.sort((a, b) => b.player_goals / b.player_matches - a.player_goals / a.player_matches)[0];
    const averageTopAssistant = playersToSort.sort((c, d) => d.player_assists / d.player_matches - c.player_assists / c.player_matches)[0];

    const topScorerAvg = averageTopScorer.player_goals / averageTopScorer.player_matches;
    const topAssistantAvg = averageTopAssistant.player_assists / averageTopAssistant.player_matches;

    // Defining ratings to start team sorting proccess
    for (let i = 0; i < playersToSort.length; i++) {
      if (playersToSort[i].player_matches > 0) {
        let starPoints =
          ((playersToSort[i].player_goals / playersToSort[i].player_matches / topScorerAvg) * 0.5 +
            (playersToSort[i].player_assists / playersToSort[i].player_matches / topAssistantAvg) * 0.5) *
          5;
        playersToSort[i].player_stars = starPoints;
      }
    }

    playersToSort.sort((e, f) => f.player_stars - e.player_stars);
    for (let i = 0; i < playersPerTeam; i++) {
      seeds[i] = playersToSort.splice(0, numberOfTeams);
    }

    function shuffle(array) {
      var m = array.length,
        t,
        i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
    }

    function seedShuffler(array) {
      for (let k = 0; k < playersPerTeam; k++) {
        shuffle(array[k]);
      }
    }
    seedShuffler(seeds);

    function teamMaker() {
      for (let i = 0; i < numberOfTeams; i++) {
        let sumOfStars = 0;
        var currentTeam = [];
        for (let j = 0; j < playersPerTeam; j++) {
          currentTeam.push(seeds[j][i]);
          sumOfStars += seeds[j][i].player_stars;
        }
        teams[i] = currentTeam;
        teams[i].teamAverage = sumOfStars / playersPerTeam;
        teams[i].teamNumber = i + 1;
      }
      teams = teams.sort((a, b) => a.teamAverage - b.teamAverage);
      return teams;
    }

    let attempts = 0;

    do {
      seedShuffler(seeds);
      teamMaker(seeds);
      attempts++;
    } while (teams[teams.length - 1].teamAverage - teams[0].teamAverage > 0.5 || attempts === 4);

    teams = teams.sort((a, b) => a.teamNumber - b.teamNumber);

    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[0].length; j++) {
        const players = await pool.query(
          "INSERT INTO matches_players (match_id, player_id,match_player_goals,match_player_assists,match_player_goalkeeper, match_player_team, match_mvp_gk, match_mvp_df, match_mvp_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
          [matchId, teams[i][j].player_id, 0, 0, false, teams[i].teamNumber, 0, 0, 0]
        );
      }
    }

    for (i = 0; i < pickedGoalkeepers.length; i++) {
      const keepers = await pool.query(
        "INSERT INTO matches_players (match_id, player_id,match_player_goals,match_player_assists,match_player_goalkeeper, match_mvp_gk, match_mvp_df, match_mvp_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
        [matchId, pickedGoalkeepers[i], 0, 0, true, 0, 0, 0]
      );
    }
    res.json(matchId);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of matches
router.get("/listmatches", authorization, async (req, res) => {
  try {
    const matches = await pool.query(
      "SELECT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE g.user_id = $1 ORDER BY m.match_status ASC, m.match_date DESC",
      [req.user]
    );
    res.json(matches.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of matches of specific user
router.get("/listmatches/player/", authorization, async (req, res) => {
  try {
    const matches = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id LEFT JOIN groups AS g ON p.group_id = g.group_id LEFT JOIN matches AS m ON m.match_id = mp.match_id WHERE p.player_user = $1",
      [req.user]
    );
    res.json(matches.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of matches in a group (PUBLIC)
router.get("/listmatches/group/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const matches = await pool.query(
      "SELECT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE g.group_id = $1 ORDER BY m.match_date DESC",
      [id]
    );
    res.json(matches.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of players in match (View/Edit pages) (PUBLIC)
router.get("/listmatchplayers/:id/", async (req, res) => {
  try {
    const { id } = req.params;
    var responseUserAuth;

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2",
      [id, req.user]
    );

    validateUser.rows.length < 1 ? (responseUserAuth = false) : (responseUserAuth = true);

    const matches = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN matches AS m ON mp.match_id = m.match_id LEFT JOIN groups AS g ON m.group_id = g.group_id LEFT JOIN players as p ON p.player_id = mp.player_id WHERE mp.match_id = $1 ORDER BY p.player_name ASC, m.match_date DESC",
      [id]
    );

    for (let i = 0; i < matches.rows.length; i++) {
      let dateToParse = new Date(matches.rows[i].match_date);
      let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
      let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(2, 0);
      let dateToParseYear = String(dateToParse.getFullYear());
      matches.rows[i].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
    }

    const responseData = matches.rows;
    const responsePlayersPerTeam = responseData[0].match_playersperteam;
    const responseStatus = responseData[0].match_status;
    const responseNumberOfTeams = responseData[0].match_numofteams;

    res.json({
      responseData,
      responsePlayersPerTeam,
      responseNumberOfTeams,
      responseStatus,
      responseUserAuth,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of players in match (View/Edit pages)
router.get("/listmatchplayers/edit/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    var responseUserAuth;

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2",
      [id, req.user]
    );

    validateUser.rows.length < 1 ? (responseUserAuth = false) : (responseUserAuth = true);

    const matches = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN matches AS m ON mp.match_id = m.match_id LEFT JOIN groups AS g ON m.group_id = g.group_id LEFT JOIN players as p ON p.player_id = mp.player_id WHERE mp.match_id = $1 ORDER BY p.player_name ASC, m.match_date DESC",
      [id]
    );

    for (let i = 0; i < matches.rows.length; i++) {
      let dateToParse = new Date(matches.rows[i].match_date);
      let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
      let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(2, 0);
      let dateToParseYear = String(dateToParse.getFullYear());
      matches.rows[i].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
    }

    const responseData = matches.rows;
    const responsePlayersPerTeam = responseData[0].match_playersperteam;
    const responseStatus = responseData[0].match_status;
    const responseNumberOfTeams = responseData[0].match_numofteams;

    res.json({
      responseData,
      responsePlayersPerTeam,
      responseNumberOfTeams,
      responseStatus,
      responseUserAuth,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Update values from match
router.put("/editmatch/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const matchStats = req.body;
    const userID = req.user;
    let responseData = [];

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id=$1 AND g.user_id = $2",
      [id, req.user]
    );

    for (let i = 0; i < matchStats.length; i++) {
      const updateMatch = await pool.query(
        "UPDATE matches_players SET match_player_goals = $1, match_player_assists = $2 WHERE matchplayer_id = $3 RETURNING *",
        [matchStats[i].match_player_goals, matchStats[i].match_player_assists, matchStats[i].matchplayer_id]
      );
      responseData.push(...updateMatch.rows);
    }

    const matchStatus = await pool.query("SELECT match_status FROM matches AS m WHERE m.match_id = $1", [id]);
    const responseStatus = matchStatus.rows[0].match_status;
    return res.json({ responseData, responseStatus });
  } catch (err) {
    console.log(err.message);
  }
});

// Get voting information
router.get("/voting/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    let arrayOfPlayers = [];
    let arrayOfUsers = [];

    const hasUserVoted = await pool.query("SELECT * FROM votes AS v WHERE v.user_id = $1", [req.user]);
    if (hasUserVoted.rows[0]) {
      return res.json(false);
    }

    const matchPlayers = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id WHERE mp.match_id = $1",
      [id]
    );

    matchPlayers.rows.map((player) => {
      arrayOfPlayers.push(player.player_id);
      arrayOfUsers.push(player.player_user);
    });

    if (!arrayOfUsers.includes(req.user)) {
      return res.json(false);
    }

    return res.status(200).json(true);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Process vote
router.post("/voting/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteGK, voteDF, voteAT } = req.body;
    let arrayOfPlayers = [];
    let arrayOfUsers = [];

    const hasUserVoted = await pool.query("SELECT * FROM votes AS v WHERE v.user_id = $1", [req.user]);
    if (hasUserVoted.rows[0]) {
      return res.json(false);
    }

    const matchPlayers = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id WHERE mp.match_id = $1",
      [id]
    );
    matchPlayers.rows.map((player) => {
      arrayOfPlayers.push(player.player_id);
      arrayOfUsers.push(player.player_user);
    });

    if (!arrayOfUsers.includes(req.user)) {
      return res.json(false);
    }

    if (!arrayOfPlayers.includes(Number(voteGK)) || !arrayOfPlayers.includes(Number(voteDF)) || !arrayOfPlayers.includes(Number(voteAT))) {
      return res.json(false);
    }

    const countVotes = await pool.query("INSERT INTO votes (user_id, match_id, mvp_gk, mvp_df, mvp_at) VALUES ($1,$2,$3,$4,$5)", [
      req.user,
      id,
      voteGK,
      voteDF,
      voteAT,
    ]);

    const results = await pool.query("SELECT * FROM votes WHERE match_id = $1", [id]);

    res.status(200).json(results.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get results information
router.get("/results/:id/", async (req, res) => {
  try {
    const { id } = req.params;

    const allVotes = await pool.query("SELECT * FROM votes AS v WHERE v.match_id = $1", [id]);
    const matchPlayers = await pool.query(
      "SELECT mp.player_id, p.player_name FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id WHERE mp.match_id = $1",
      [id]
    );

    const countVotes = (arr, key) => {
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
            playerName: matchPlayers.rows.find((player) => player["player_id"] === Number(key)).player_name,
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

    return res.status(200).json({
      parsedGKResults: parseVotes(countVotes(allVotes.rows, "mvp_gk")),
      parsedDFResults: parseVotes(countVotes(allVotes.rows, "mvp_df")),
      parsedATResults: parseVotes(countVotes(allVotes.rows, "mvp_at")),
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Finish match
router.put("/finishmatch/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const matchStats = req.body;
    const userID = req.user;
    let responseData = [];

    for (let i = 0; i < matchStats.length; i++) {
      const updateMatch = await pool.query(
        "UPDATE players SET player_goals = player_goals + $1, player_assists = player_assists + $2, player_matches = player_matches + 1 WHERE player_id = $3 RETURNING *",
        [matchStats[i].match_player_goals, matchStats[i].match_player_assists, matchStats[i].player_id]
      );
      responseData.push(...updateMatch.rows);
    }
    const finishMatch = await pool.query("UPDATE matches SET match_status = $1 WHERE match_id = $2", ["votes", matchStats[0].match_id]);

    return res.json(responseData);
  } catch (err) {
    console.log(err.message);
  }
});

// Save votes
router.put("/savevotes/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user;
    let responseData = [];

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2",
      [id, userID]
    );
    if (!validateUser.rows[0]) {
      return res.json("You are not authorized to do this.");
    }

    const fetchVotes = await pool.query("SELECT * FROM votes WHERE match_id = $1", [id]);
    const matchPlayers = await pool.query(
      "SELECT mp.player_id, p.player_name FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id WHERE mp.match_id = $1",
      [id]
    );

    const countVotes = (arr, key) => {
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
            playerName: matchPlayers.rows.find((player) => player["player_id"] === Number(key)).player_name,
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

    console.log({
      parsedGKResults: parseVotes(countVotes(fetchVotes.rows, "mvp_gk")),
      parsedDFResults: parseVotes(countVotes(fetchVotes.rows, "mvp_df")),
      parsedATResults: parseVotes(countVotes(fetchVotes.rows, "mvp_at")),
    });

    const countGK = await pool.query("UPDATE players SET mvp_gk = mvp_gk + 1 WHERE player_id = $1", [
      parseVotes(countVotes(fetchVotes.rows, "mvp_gk"))[0].playerId,
    ]);
    const countDF = await pool.query("UPDATE players SET mvp_df = mvp_df + 1 WHERE player_id = $1", [
      parseVotes(countVotes(fetchVotes.rows, "mvp_df"))[0].playerId,
    ]);
    const countAT = await pool.query("UPDATE players SET mvp_at = mvp_at + 1 WHERE player_id = $1", [
      parseVotes(countVotes(fetchVotes.rows, "mvp_at"))[0].playerId,
    ]);

    const updateMatch = await pool.query("UPDATE matches SET match_status = $1 WHERE match_id = $2", ["finished", id]);

    return res.json("Votação Finalizada!");
  } catch (err) {
    console.log(err.message);
  }
});

// Fast Sorting
router.post("/fastsorting/", async (req, res) => {
  try {
    const { players, teams } = req.body;
    let sortedTeams;
    let averageDifference = 10;
    let attempts = 0;

    const teamMaker = () => {
      const playersPerTeam = Math.round(players.length / teams.length);
      let playersToSort = [...players];
      const individualTeam = [];
      sortedTeams = Array.from({ length: teams.length }, () => [...individualTeam]);
      let seeds = [];

      playersToSort.sort((e, f) => f.stars - e.stars);

      for (let i = 0; i < teams.length; i++) {
        seeds[i] = playersToSort.splice(0, playersPerTeam);
      }

      if (playersToSort.length > 0) {
        playersToSort.sort((e, f) => e.stars - f.stars);
        for (let i = 0; i < playersToSort.length; i++) {
          seeds[seeds.length - (1 + i)].push(playersToSort[i]);
        }
      }

      for (let k = 0; k < seeds.length; k++) {
        let m = seeds[k].length,
          t,
          i;
        while (m) {
          i = Math.floor(Math.random() * m--);
          t = seeds[k][m];
          seeds[k][m] = seeds[k][i];
          seeds[k][i] = t;
        }
      }

      const joinedArray = seeds.flat();

      let teamNumber = 0;

      for (let i = 0; i < joinedArray.length; i++) {
        sortedTeams[teamNumber].push(joinedArray[i]);

        teamNumber++;
        if (teamNumber === teams.length) {
          teamNumber = 0;
        }
      }

      sortedTeams.forEach((team, index) => {
        team.average = team.reduce((total, object) => total + object.stars, 0) / team.length;
        team.name = teams[index].name;
      });

      sortedTeams.sort((a, b) => b.average - a.average);
      averageDifference = Math.abs(sortedTeams[sortedTeams.length - 1].average - sortedTeams[0].average);

      return sortedTeams;
    };

    while (averageDifference > 0.3 && attempts < 100) {
      teamMaker();
      attempts++;
      console.log(averageDifference);
    }
    res.json(sortedTeams);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
