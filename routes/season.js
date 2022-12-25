const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/Authorization");

/* ROUTES */

// Finish Season
router.post("/finishseason/:groupId", authorization, async (req, res) => {
  try {
    const { groupId } = req.params;
    const now = new Date();

    const validateUser = await pool.query(
      "SELECT * FROM groups AS g LEFT JOIN users AS u ON g.user_id = u.user_id WHERE g.group_id = $1 AND u.user_id = $2",
      [groupId, req.user]
    );

    const lastEnteredSeason = await pool.query("SELECT season_date_entered FROM seasons AS s WHERE s.season_group_id = $1", [groupId]);

    if (lastEnteredSeason.rows.length) {
      if (now - lastEnteredSeason.rows[0].season_date_entered < 15778800000 /*6 Months in Milliseconds*/) {
        return res.json({ type: "error", message: "Você só pode encerrar uma temporada à cada 6 meses." });
      }
    }

    if (!validateUser.rows.length) {
      return res.json({ type: "error", message: "Esse grupo não pertence à sua conta." });
    } else {
      const players = await pool.query("SELECT * FROM players AS p LEFT JOIN groups AS g ON p.group_id = g.group_id WHERE p.group_id = $1", [
        groupId,
      ]);
      const parsedPlayers = players.rows;

      const averageTopScorer = parsedPlayers.sort((a, b) => b.player_goals / b.player_matches - a.player_goals / a.player_matches)[0];
      const averageTopAssistant = parsedPlayers.sort((c, d) => d.player_assists / d.player_matches - c.player_assists / c.player_matches)[0];
      const topScorerAvg = averageTopScorer.player_goals / averageTopScorer.player_matches;
      const topAssistantAvg = averageTopAssistant.player_assists / averageTopAssistant.player_matches;

      for (let i = 0; i < parsedPlayers.length; i++) {
        if (parsedPlayers[i].player_matches > 0) {
          let starPoints =
            ((parsedPlayers[i].player_goals / parsedPlayers[i].player_matches / topScorerAvg) * 0.5 +
              (parsedPlayers[i].player_assists / parsedPlayers[i].player_matches / topAssistantAvg) * 0.5) *
            5;
          parsedPlayers[i].player_stars = starPoints;
        }
      }

      for (let i = 0; i < parsedPlayers.length; i++) {
        const playerSeason = await pool.query(
          "INSERT INTO seasons (season_group_id,season_player_id,season_player_name,season_year,season_goals,season_assists,season_matches,season_score,season_date_entered) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
          [
            Number(groupId),
            parsedPlayers[i].player_id,
            parsedPlayers[i].player_name,
            2022,
            parsedPlayers[i].player_goals,
            parsedPlayers[i].player_assists,
            parsedPlayers[i].player_matches,
            parsedPlayers[i].player_stars,
            now,
          ]
        );

        const resetPlayerStats = await pool.query(
          "UPDATE players SET player_goals = $1, player_assists = $1, player_matches = $1 WHERE player_id = $2",
          [0, parsedPlayers[i].player_id]
        );
      }
      res.status(200).json({ type: "success", message: "Temporada Finalizada com Sucesso!" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// List Group Seasons
router.get("/listseasons/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const seasons = await pool.query("SELECT DISTINCT season_year FROM seasons WHERE season_group_id=$1", [groupId]);
    parsedSeasons = [];
    seasons.rows.map((season) => {
      parsedSeasons.push(season.season_year);
    });
    const playerSeasons = await pool.query("SELECT * FROM seasons WHERE season_group_id=$1 ORDER BY season_goals DESC", [groupId]);
    const parsedPlayerSeasons = playerSeasons.rows;

    res.json({ parsedSeasons, parsedPlayerSeasons });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
