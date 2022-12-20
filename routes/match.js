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
    const {
      groupId,
      matchDate,
      numberOfTeams,
      playersPerTeam,
      pickedPlayers,
      pickedGoalkeepers,
    } = req.body;
    let playersToSort = [];
    let seeds = [];
    var teams = [];

    const match = await pool.query(
      "INSERT INTO matches (group_id, match_date, match_numofteams, match_playersperteam, match_status) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [groupId, matchDate, numberOfTeams, playersPerTeam, false]
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
    const averageTopScorer = playersToSort.sort(
      (a, b) =>
        b.player_goals / b.player_matches - a.player_goals / a.player_matches
    )[0];
    const averageTopAssistant = playersToSort.sort(
      (c, d) =>
        d.player_assists / d.player_matches -
        c.player_assists / c.player_matches
    )[0];

    const topScorerAvg =
      averageTopScorer.player_goals / averageTopScorer.player_matches;
    const topAssistantAvg =
      averageTopAssistant.player_assists / averageTopAssistant.player_matches;

    // Defining ratings to start team sorting proccess
    for (let i = 0; i < playersToSort.length; i++) {
      if (playersToSort[i].player_matches > 0) {
        let starPoints =
          ((playersToSort[i].player_goals /
            playersToSort[i].player_matches /
            topScorerAvg) *
            0.5 +
            (playersToSort[i].player_assists /
              playersToSort[i].player_matches /
              topAssistantAvg) *
              0.5) *
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
    } while (
      teams[teams.length - 1].teamAverage - teams[0].teamAverage > 0.5 ||
      attempts === 4
    );

    teams = teams.sort((a, b) => a.teamNumber - b.teamNumber);

    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[0].length; j++) {
        const players = await pool.query(
          "INSERT INTO matches_players (match_id, player_id,match_player_goals,match_player_assists,match_player_goalkeeper, match_player_team) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
          [matchId, teams[i][j].player_id, 0, 0, false, teams[i].teamNumber]
        );
      }
    }

    for (i = 0; i < pickedGoalkeepers.length; i++) {
      const keepers = await pool.query(
        "INSERT INTO matches_players (match_id, player_id,match_player_goals,match_player_assists,match_player_goalkeeper) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [matchId, pickedGoalkeepers[i], 0, 0, true]
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

// Get list of players in match (View/Edit pages) (PUBLIC)
router.get("/listmatchplayers/:id/", async (req, res) => {
  try {
    const { id } = req.params;
    var responseUserAuth;

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2",
      [id, req.user]
    );

    validateUser.rows.length < 1
      ? (responseUserAuth = false)
      : (responseUserAuth = true);

    const matches = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN matches AS m ON mp.match_id = m.match_id LEFT JOIN groups AS g ON m.group_id = g.group_id LEFT JOIN players as p ON p.player_id = mp.player_id WHERE mp.match_id = $1 ORDER BY p.player_name ASC, m.match_date DESC",
      [id]
    );

    for (let i = 0; i < matches.rows.length; i++) {
      let dateToParse = new Date(matches.rows[i].match_date);
      let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
      let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(2, 0);
      let dateToParseYear = String(dateToParse.getFullYear());
      matches.rows[
        i
      ].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
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

    validateUser.rows.length < 1
      ? (responseUserAuth = false)
      : (responseUserAuth = true);

    const matches = await pool.query(
      "SELECT * FROM matches_players AS mp LEFT JOIN matches AS m ON mp.match_id = m.match_id LEFT JOIN groups AS g ON m.group_id = g.group_id LEFT JOIN players as p ON p.player_id = mp.player_id WHERE mp.match_id = $1 ORDER BY p.player_name ASC, m.match_date DESC",
      [id]
    );

    for (let i = 0; i < matches.rows.length; i++) {
      let dateToParse = new Date(matches.rows[i].match_date);
      let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
      let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(2, 0);
      let dateToParseYear = String(dateToParse.getFullYear());
      matches.rows[
        i
      ].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
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
        [
          matchStats[i].match_player_goals,
          matchStats[i].match_player_assists,
          matchStats[i].matchplayer_id,
        ]
      );
      responseData.push(...updateMatch.rows);
    }

    const matchStatus = await pool.query(
      "SELECT match_status FROM matches AS m WHERE m.match_id = $1",
      [id]
    );
    const responseStatus = matchStatus.rows[0].match_status;
    return res.json({ responseData, responseStatus });
  } catch (err) {
    console.log(err.message);
  }
});

// Save match
router.put("/savematch/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const matchStats = req.body;
    const userID = req.user;
    let responseData = [];

    for (let i = 0; i < matchStats.length; i++) {
      const updateMatch = await pool.query(
        "UPDATE players SET player_goals = player_goals + $1, player_assists = player_assists + $2, player_matches = player_matches + 1 WHERE player_id = $3 RETURNING *",
        [
          matchStats[i].match_player_goals,
          matchStats[i].match_player_assists,
          matchStats[i].player_id,
        ]
      );
      responseData.push(...updateMatch.rows);
    }
    const finishMatch = await pool.query(
      "UPDATE matches SET match_status = $1 WHERE match_id = $2",
      [true, matchStats[0].match_id]
    );

    return res.json(responseData);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
