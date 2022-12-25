const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/Authorization");

// Create Players
router.post("/createplayer/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { addPlayerName, addPlayerStars } = req.body;

    if (addPlayerName.length < 3) {
      return res.json("Nome de jogador não pode ser menor de 3 caracteres.");
    }

    const validateUser = await pool.query(
      "SELECT * FROM groups AS g LEFT JOIN users AS u ON g.user_id = u.user_id WHERE g.group_id = $1 AND u.user_id = $2",
      [id, req.user]
    );

    if (!validateUser.rows.length) {
      return res.json("Esse grupo não pertence a sua conta.");
    }

    const validatePlayer = await pool.query("SELECT * FROM players AS p WHERE p.player_name = $1 AND p.group_id = $2", [addPlayerName, id]);

    console.log(validatePlayer.rows);

    if (validatePlayer.rows.length > 0) {
      return res.json("O grupo não pode ter 2 jogadores com o mesmo nome.");
    }
    console.log(validatePlayer.rows);

    const newPlayer = await pool.query(
      "INSERT INTO players (group_id, player_name, player_stars,player_goals,player_assists,player_matches) VALUES($1,$2,$3,$4,$4,$4) RETURNING *",
      [id, addPlayerName, addPlayerStars, 0]
    );
    res.json(newPlayer.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Read Players in a Group
router.get("/listplayers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const players = await pool.query(
      "SELECT DISTINCT player_id,player_name,player_goals,player_assists,player_matches,player_stars,player_user,user_name FROM players AS p INNER JOIN groups AS g ON p.group_id = $1 LEFT JOIN users AS u ON u.user_id = p.player_user ORDER BY player_goals DESC",
      [id]
    );
    res.json(players.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Read Players in a Group
router.get("/listlinkedplayers/", authorization, async (req, res) => {
  try {
    const userId = req.user;
    const players = await pool.query("SELECT * FROM players AS p LEFT JOIN groups AS g ON p.group_id = g.group_id WHERE p.player_user = $1", [
      userId,
    ]);
    res.json(players.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
