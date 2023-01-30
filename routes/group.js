const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/Authorization");

/* ROUTES */

// Create Groups
router.post("/creategroup", authorization, async (req, res) => {
  try {
    const { nameGroup } = req.body;
    const checkNumberOfGroups = await pool.query("SELECT * FROM groups WHERE user_id = $1", [req.user]);
    if (checkNumberOfGroups.rows.length > 4) {
      return res.json({ type: "error", message: "Você não pode ter mais de 5 grupos ao mesmo tempo. Remova um para criar outro." });
    }

    const newGroup = await pool.query("INSERT INTO groups (user_id, group_name) VALUES($1,$2) RETURNING *", [req.user, nameGroup]);
    return res.json({ type: "success", message: "Grupo criado com sucesso." });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Read Groups
router.get("/listgroups", authorization, async (req, res) => {
  try {
    const groups = await pool.query("SELECT * FROM groups AS g WHERE g.user_id=$1", [req.user]);

    res.json(groups.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Read Individual Group Profile
router.get("/listgroup/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await pool.query("SELECT group_name FROM groups AS g WHERE g.group_id=$1", [id]);
    const groupName = groups.rows[0].group_name;

    res.json(groupName);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Groups
router.put("/updategroup/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { nameGroup } = req.body;

    if (nameGroup.length < 5) {
      return res.json("O nome do grupo tem de ser maior do que 5 caracteres.");
    }

    const validateUser = await pool.query(
      "SELECT * FROM groups AS g LEFT JOIN users AS u ON g.user_id = u.user_id WHERE g.group_id = $1 AND u.user_id = $2",
      [id, req.user]
    );

    if (!validateUser.rows.length) {
      return res.json("This group does not belong to your account.");
    } else {
      const updateGroup = await pool.query("UPDATE groups SET group_name = $1 WHERE group_id = $2 AND user_id = $3 RETURNING *", [
        nameGroup,
        id,
        req.user,
      ]);
      res.json("Informações do grupo foram atualizadas!");
    }
  } catch (err) {
    console.log(err.message);
  }
});

// Delete Groups
router.delete("/deletegroup/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const validateUser = await pool.query(
      "SELECT * FROM groups AS g LEFT JOIN users AS u ON g.user_id = u.user_id WHERE g.group_id = $1 AND u.user_id = $2",
      [id, req.user]
    );

    if (!validateUser.rows.length) {
      return res.json("Esse grupo não pertence à sua conta.");
    }
    const deleteRequests = await pool.query("DELETE FROM requests WHERE group_id = $1 RETURNING *", [id]);
    const deleteSeasons = await pool.query("DELETE FROM seasons WHERE season_group_id = $1 RETURNING *", [id]);
    const deleteMatchPlayers = await pool.query(
      "DELETE FROM matches_players USING matches_players AS mp LEFT JOIN players AS p ON p.player_id = mp.player_id WHERE group_id = $1",
      [id]
    );
    const deleteVotes = await pool.query(
      "DELETE FROM votes USING votes AS v LEFT JOIN matches AS m ON v.match_id = m.match_id WHERE m.group_id = $1",
      [id]
    );
    const deleteMatches = await pool.query("DELETE FROM matches WHERE group_id = $1 RETURNING *", [id]);
    const deletePlayers = await pool.query("DELETE FROM players WHERE group_id = $1 RETURNING *", [id]);
    const deleteGroup = await pool.query("DELETE FROM groups WHERE group_id = $1 RETURNING *", [id]);
    res.json("O grupo foi removido.");
  } catch (err) {
    console.log(err.message);
  }
});

// Get list of groups of specific user
router.get("/listgroups/player/", authorization, async (req, res) => {
  try {
    const groups = await pool.query("SELECT * FROM players AS p LEFT JOIN groups AS g ON p.group_id = g.group_id WHERE p.player_user = $1", [
      req.user,
    ]);
    res.json(groups.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
