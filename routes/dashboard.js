const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/Authorization");

/* ROUTES */

// Get Profile
router.get("/", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT * FROM users AS u LEFT JOIN groups AS g ON u.user_id = g.user_id WHERE u.user_id = $1",
      [req.user]
    );
    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Create Groups
router.post("/groups", authorization, async (req, res) => {
  try {
    const { nameGroup } = req.body;
    const newGroup = await pool.query(
      "INSERT INTO groups (user_id, group_name) VALUES($1,$2) RETURNING *",
      [req.user, nameGroup]
    );
    res.json(newGroup.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Groups
router.put("/groups/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { nameGroup } = req.body;
    const updateGroup = await pool.query(
      "UPDATE groups SET group_name = $1 WHERE group_id = $2 AND user_id = $3 RETURNING *",
      [nameGroup, id, req.user]
    );

    if (updateGroup.rows.length === 0) {
      return res.json("This group does not belong to your account.");
    }

    res.json(updateGroup.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Delete Groups
router.delete("/groups/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteMatchPlayers = await pool.query(
      "DELETE FROM matches_players USING matches_players AS mp LEFT JOIN players AS p ON p.player_id = mp.player_id WHERE group_id = $1",
      [id]
    );
    const deletePlayers = await pool.query(
      "DELETE FROM players WHERE group_id = $1 AND user_id = $2  RETURNING *",
      [id, req.user]
    );
    const deleteGroup = await pool.query(
      "DELETE FROM groups WHERE group_id = $1 AND user_id = $2  RETURNING *",
      [id, req.user]
    );

    if (deleteGroup.rows.length === 0) {
      return res.json("This group does not belong to your account.");
    }

    res.json("Group was deleted.");
  } catch (err) {
    console.error(err.message);
  }
});

// Create Players
router.post("/groups/:id/players", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { addPlayerName, addPlayerStars } = req.body;
    const newPlayer = await pool.query(
      "INSERT INTO players (group_id, player_name, player_stars,player_goals,player_assists,player_matches) VALUES($1,$2,$3,$4,$4,$4) RETURNING *",
      [id, addPlayerName, addPlayerStars, 0]
    );
    res.json(newPlayer.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
