const pool = require("../db");

const verifyOwnership = (type) => async (req, res, next) => {
  const userID = req.user;
  let query;
  let id;

  switch (type) {
    case player:
      id = req.player_id;
      query = "SELECT DISTINCT * FROM players AS p LEFT JOIN groups AS g ON p.group_id = g.group_id WHERE p.player_id= $1 AND g.user_id = $2";
      break;
    case matchPlayer:
      id = req.matchplayer_id;
      query =
        "SELECT DISTINCT * FROM matches_players AS mp LEFT JOIN groups AS g ON mp.group_id = g.group_id WHERE m.matchplayer_id = $1 AND g.user_id = $2";
      break;
    case match:
      id = req.match_id;
      query = "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id = $1 AND g.user_id = $2";
      break;
    case group:
      id = req.group_id;
      query = "SELECT DISTINCT * FROM groups AS g WHERE group_id = $1 AND user_id = $2";
      break;
    default:
      return;
  }

  try {
    const validateUser = await pool.query(query, [id, userID]);
    if (!validateUser.rows.length) return res.status(403).json({ message: "Você não está autorizado a fazer isto.", type: "error" });
  } catch (error) {
    console.log(error.message);
    return res.status(403).json({ message: "Você não está autorizado a fazer isto.", type: "error" });
  }
  next();
};

module.exports = verifyOwnership;
