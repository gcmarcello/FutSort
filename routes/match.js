const router = require("express").Router();
const { json } = require("express");
const pool = require("../db");
const authorization = require("../middleware/Authorization");
const verifyOwnership = require("../middleware/verifyOwnership");
const { parseVotes, countVotes } = require("../utils/votingFunctions");
const enableAdmin = require("../middleware/enableAdmin");

// Retrieve Players for Match Pick
router.get("/creatematch/:id/playerlist", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const players = await pool.query(
      "SELECT DISTINCT player_id,player_name,player_goals,player_assists,player_matches,player_stars,mvp_gk,mvp_df,mvp_at FROM players AS p INNER JOIN groups AS g ON p.group_id = $1 ORDER BY player_name ASC",
      [id]
    );
    res.json(players.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Create Match Form Submit
router.post("/sorting", authorization, async (req, res) => {
  try {
    const { numberOfTeams, pickedPlayers, pickedGoalkeepers } = req.body;
    const numberOfPlayers = pickedPlayers.length;

    if (numberOfTeams > numberOfPlayers) {
      return res.status(400).json({ message: "O número de jogadores precisa ser superior ou igual ao de times.", type: "error" });
    }

    let seeds = [];
    var teams = [];

    // Defining Top Scorer and Assistants from chosen players to use as reference
    for (let i = 0; i < pickedPlayers.length; i++) {
      pickedPlayers[i].goalAvg = pickedPlayers[i].player_goals / pickedPlayers[i].player_matches || 0;
      pickedPlayers[i].assistAvg = pickedPlayers[i].player_assists / pickedPlayers[i].player_matches || 0;
      pickedPlayers[i].mvpAvg =
        (pickedPlayers[i].mvp_df + pickedPlayers[i].mvp_at + pickedPlayers[i].mvp_gk * 2) / pickedPlayers[i].player_matches || 0;
    }

    const topScorerAvg = pickedPlayers.filter((player) => player.player_matches > 1).sort((a, b) => b.goalAvg - a.goalAvg)[0].goalAvg;
    const topAssistantAvg = pickedPlayers.filter((player) => player.player_matches > 1).sort((c, d) => d.assistAvg - c.assistAvg)[0].assistAvg;
    const topMvpSort = pickedPlayers.sort((a, b) => b.mvpAvg - a.mvpAvg)[0].mvpAvg;

    // Defining ratings to start team sorting proccess
    for (let i = 0; i < pickedPlayers.length; i++) {
      if (pickedPlayers[i].player_matches > 1) {
        pickedPlayers[i].mvps = pickedPlayers[i].mvpAvg;
        let starCoefficient =
          (pickedPlayers[i].goalAvg / topScorerAvg + pickedPlayers[i].assistAvg / topAssistantAvg + pickedPlayers[i].mvps / 3) * 10;
        let stars = 10 * (1 - Math.exp(0.5 * starCoefficient * -0.28));
        pickedPlayers[i].player_stars = stars;
      }
    }

    pickedPlayers.sort((e, f) => f.player_stars - e.player_stars);

    for (let i = 0; i < Math.ceil(numberOfPlayers / numberOfTeams); i++) {
      seeds[i] = pickedPlayers.splice(0, numberOfTeams);
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
      for (let k = 0; k < seeds.length; k++) {
        shuffle(array[k]);
      }
    }

    seedShuffler(seeds);

    function teamMaker() {
      for (let i = 0; i < numberOfTeams; i++) {
        var currentTeam = [];
        let j = 0;
        for (let j = 0; j < Math.round(numberOfPlayers / numberOfTeams); j++) {
          if (seeds[j][i]) {
            seeds[j][i] = { ...seeds[j][i], team: i + 1 };
          }
          currentTeam.push(seeds[j][i]);
        }

        teams[i] = currentTeam;
      }

      if (seeds.length > Math.round(numberOfPlayers / numberOfTeams)) {
        for (let k = 0; k < seeds[seeds.length - 1].length; k++) {
          seeds[seeds.length - 1][k] = { ...seeds[seeds.length - 1][k], team: i + 1 };
          teams[k].push(seeds[seeds.length - 1][k]);
        }
      }
      return teams;
    }

    teamMaker();
    res.json({ data: { teams, pickedGoalkeepers }, type: "success" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

router.post("/new/:id", authorization, async (req, res) => {
  const { generatedTeams, matchSettings, goalkeepers } = req.body;
  const { id } = req.params;
  try {
    const match = await pool.query("INSERT INTO matches (group_id, match_date, match_numofteams, match_status) VALUES($1,$2,$3,$4) RETURNING *", [
      id,
      matchSettings.date,
      matchSettings.numberOfTeams,
      "open",
    ]);

    const matchId = match.rows[0].match_id;

    const mergedArray = generatedTeams.reduce((acc, currentArray) => {
      return [...acc, ...currentArray];
    }, []);

    mergedArray.push(...goalkeepers);

    const playerSQLValues = mergedArray
      .filter((player) => player)
      .map((player) => {
        if (player) {
          return `(${matchId},${player.player_id},0,0,${player.gk_picked ? true : false},${player.gk_picked ? null : player.team})`;
        }
      })
      .join(",");

    const sqlQuery = `INSERT INTO matches_players (match_id, player_id, match_player_goals,match_player_assists,match_player_goalkeeper, match_player_team) VALUES ${playerSQLValues}`;

    const addPlayers = await pool.query(sqlQuery);

    res.status(200).json({ message: "Partida criada com sucesso!", type: "success", id: matchId });
  } catch (error) {
    res.status(400).json({ message: `Erro ao criar partida. ${error.message}`, type: "error" });
    console.log(error.message);
  }
});

// Get list of matches
router.get("/listmatches", authorization, async (req, res) => {
  try {
    const matches = await pool.query(
      "SELECT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE g.user_id = $1 ORDER BY m.match_status DESC, m.match_date DESC",
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
      "SELECT * FROM matches_players AS mp LEFT JOIN players AS p ON mp.player_id = p.player_id LEFT JOIN groups AS g ON p.group_id = g.group_id LEFT JOIN matches AS m ON m.match_id = mp.match_id WHERE p.player_user = $1 ORDER BY m.match_date DESC",
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
    const responseStatus = responseData[0].match_status;
    const responseNumberOfTeams = responseData[0].match_numofteams;

    res.json({
      responseData,
      responseNumberOfTeams,
      responseStatus,
      responseUserAuth,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Get Match Details (View/Edit pages)
router.get("/:id/", enableAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2",
      [id, user]
    );

    const players = await pool.query(
      "SELECT matchplayer_id, p.player_id, match_player_goals, match_player_assists, match_player_goalkeeper, match_player_team, match_player_voted, match_mvp_gk, match_mvp_df, match_mvp_at, player_name FROM matches_players AS mp LEFT JOIN matches AS m ON mp.match_id = m.match_id LEFT JOIN groups AS g ON m.group_id = g.group_id LEFT JOIN players as p ON p.player_id = mp.player_id WHERE mp.match_id = $1 ORDER BY p.player_name ASC, m.match_date DESC",
      [id]
    );

    const match = await pool.query(
      "SELECT match_id, match_date, match_numofteams, match_status, group_name, matches.group_id FROM matches LEFT JOIN groups ON matches.group_id = groups.group_id WHERE match_id = $1",
      [id]
    );

    const matchStatus = match.rows[0];
    const playersStatus = players.rows;
    res.status(200).json({
      matchStatus,
      playersStatus,
      isAdmin: validateUser.rows[0] ? true : false,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Update values from match
router.put("/:id/statistics/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { playerToUpdate } = req.body;
    const userID = req.user;

    const validateUser = await pool.query(
      "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id= $1 AND g.user_id = $2",
      [id, userID]
    );

    if (!validateUser.rows.length) {
      return res.status(403).json({ message: "Esse grupo não pertence a você.", type: "error" });
    }

    const updatePlayer = await pool.query(
      "UPDATE matches_players SET match_player_goals = $1, match_player_assists = $2 WHERE matchplayer_id = $3 RETURNING *",
      [playerToUpdate.match_player_goals, playerToUpdate.match_player_assists, playerToUpdate.matchplayer_id]
    );

    return res.status(200).json({ message: "Dados atualizados!", type: "success" });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ message: "Erro ao enviar dados. Por favor atualize a página.", type: "error" });
  }
});

// Get voting information
router.get("/voting/:id/", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    let arrayOfPlayers = [];
    let arrayOfUsers = [];

    const hasUserVoted = await pool.query("SELECT * FROM votes AS v WHERE v.user_id = $1 AND v.match_id = $2", [req.user, id]);
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

    const hasUserVoted = await pool.query("SELECT * FROM votes AS v WHERE v.user_id = $1 AND v.match_id = $2", [req.user, id]);
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

// Alter Match Status
router.put("/:id/:status", [authorization, verifyOwnership("match")], async (req, res) => {
  try {
    const { id, status } = req.params;
    let responseData = [];
    let responseMessage = null;
    const matchStats = (await pool.query("SELECT * FROM matches_players WHERE match_id = $1", [id])).rows;

    switch (status) {
      case "votes":
        for (let i = 0; i < matchStats.length; i++) {
          const updateMatch = await pool.query(
            "UPDATE players SET player_goals = player_goals + $1, player_assists = player_assists + $2, player_matches = player_matches + 1 WHERE player_id = $3 RETURNING *",
            [matchStats[i].match_player_goals, matchStats[i].match_player_assists, matchStats[i].player_id]
          );
          responseData.push(...updateMatch.rows);
        }
        responseMessage = "Votação iniciada!";
      case "finished":
        const fetchVotes = await pool.query("SELECT * FROM votes WHERE match_id = $1", [id]);
        const voteTypes = ["mvp_gk", "mvp_df", "mvp_at"];

        for (const voteType of voteTypes) {
          const votes = parseVotes(countVotes(fetchVotes.rows, voteType, matchStats));

          for (let i = 0; i < Math.min(votes.length, 3); i++) {
            const { playerId } = votes[i];
            const updateValue = 3 - i;

            await pool.query(`UPDATE players SET ${voteType} = ${voteType} + $1 WHERE player_id = $2`, [updateValue, playerId]);
          }
        }
        responseMessage = "Partida finalizada com sucesso!";
      default:
        break;
    }
    const updateMatch = await pool.query("UPDATE matches SET match_status = $1 WHERE match_id = $2", [status, id]);
    return res.status(200).json({ message: responseMessage, type: "success" });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ message: "Erro ao finalizar partida", type: "error" });
  }
});

module.exports = router;
