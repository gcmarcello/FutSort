export const verifyOwnership = async (type, id) => {
  const userID = req.user;
  const validateUser = await pool.query(
    "SELECT DISTINCT * FROM matches AS m LEFT JOIN groups AS g ON m.group_id = g.group_id WHERE m.match_id= $1 AND g.user_id = $2",
    [id, userID]
  );
};
