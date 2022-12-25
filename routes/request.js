const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/Authorization");

/* ROUTES */

// Create Request
router.post("/createrequest/:groupId/:playerId", authorization, async (req, res) => {
  try {
    const { groupId, playerId } = req.params;
    const preventManyRequests = await pool.query("SELECT request_id FROM requests WHERE request_user_id = $1 AND request_status = $2", [
      req.user,
      "pending",
    ]);

    const preventConcurrentLinks = await pool.query(
      "SELECT request_id FROM requests AS r WHERE r.group_id = $1 AND r.request_user_id = $2 AND r.request_status = $3",
      [groupId, req.user, "pending"]
    );

    if (preventConcurrentLinks.rows.length > 0) {
      return res.json({ type: "error", message: `Você já solicitou o link com outro jogador.` });
    }
    if (preventManyRequests.rows.length > 3)
      return res.json({ type: "error", message: `Você tem muitas solicitações pendentes. Aguarde as respostas para enviar mais.` });

    const newRequest = await pool.query(
      "INSERT INTO requests (request_status, request_user_id, user_name, group_id, player_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
      ["pending", req.user, req.userName, groupId, playerId]
    );
    res.json({ type: "success", message: "Solicitação Enviada!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Prevent Requests if a request is still pending
router.get("/preventrequests/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    const preventConcurrentLinks = await pool.query(
      "SELECT request_id FROM requests AS r WHERE r.group_id = $1 AND r.request_user_id = $2 AND r.request_status = $3",
      [id, req.user, "pending"]
    );
    const preventMultipleLinks = await pool.query("SELECT * FROM players AS p WHERE p.group_id = $1 AND p.player_user = $2", [id, req.user]);

    if (preventMultipleLinks.rows.length > 0) {
      return res.json({ type: "error", message: `Você já está linkado com um jogador neste grupo (${preventMultipleLinks.rows[0].player_name}).` });
    }

    if (preventConcurrentLinks.rows.length > 0) {
      return res.json({ type: "error", message: `Você já solicitou o link com outro jogador.` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Read Open Requests
router.get("/listrequests/", authorization, async (req, res) => {
  try {
    const requestStatusFilter = "pending";
    const requests = await pool.query(
      "SELECT * FROM requests AS r INNER JOIN groups AS g ON r.group_id = g.group_id INNER JOIN players AS p ON p.player_id = r.player_id WHERE r.request_status = $1 AND g.user_id = $2",
      [requestStatusFilter, req.user]
    );
    res.json(requests.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Approve/Deny Requests
router.put("/updaterequest/:id/:choice", authorization, async (req, res) => {
  try {
    const { id, choice } = req.params;
    const validateUser = await pool.query(
      "SELECT * FROM requests AS r INNER JOIN groups AS g ON r.group_id = g.group_id WHERE r.request_id = $1 AND g.user_id = $2",
      [id, req.user]
    );

    if (!validateUser.rows.length) {
      return res.json("Essa solicitação não foi enviada a você.");
    } else {
      const approvedRequest = validateUser.rows[0];
      const userToLink = approvedRequest.request_user_id;
      const playerToLink = approvedRequest.player_id;
      const constUpdateRequest = await pool.query("UPDATE requests SET request_status = $1 WHERE request_id = $2", [choice, id]);
      if (choice === "denied") {
        return res.json("Solicitação de link negada.");
      } else {
        const linkPlayer = await pool.query("UPDATE players SET player_user = $1 WHERE player_id = $2", [userToLink, playerToLink]);
        return res.json("Solicitação de link aprovada!");
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
