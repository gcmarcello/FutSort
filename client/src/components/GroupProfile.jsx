import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Dashboard Components

const GroupProfile = ({ isAuthenticated }) => {
  const { id } = useParams();
  const [ranking, setRanking] = useState([]);
  const [groupName, setGroupName] = useState();

  const getGroup = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/group/listgroup/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseData = await response.json();
      setGroupName(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getPlayers = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/player/listplayers/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseData = await response.json();
      console.log(parseData);
      setRanking(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const sendRequest = async (playerId) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/request/createrequest/${id}/${playerId}`, {
        method: "POST",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseRes = await response.json();
      if (parseRes.type === "error") {
        toast.error(parseRes.message, { theme: "colored" });
      } else {
        toast.success(parseRes.message, { theme: "colored" });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getGroup();
    getPlayers();
    // eslint-disable-next-line
  }, []);

  return (
    <Fragment>
      <div className="container my-3">
        <h1>{groupName || "Carregando..."}</h1>
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Jogador</th>
              <th>Gols</th>
              <th>Assists</th>
              <td>Usuário</td>
            </tr>
          </thead>
          <tbody className="table-borderless">
            {ranking.map((player) => (
              <tr key={`player-row-${player.player_id}`}>
                <td>{player.player_name}</td>
                <td>{player.player_goals}</td>
                <td>{player.player_assists}</td>
                <td>
                  {player.user_name ? (
                    <i className="bi bi-patch-check-fill text-primary"> {player.user_name}</i>
                  ) : !isAuthenticated ? (
                    <p></p>
                  ) : (
                    <button type="button" className="btn btn-primary mx-1" onClick={() => sendRequest(player.player_id)}>
                      <i className="bi bi-link-45deg fs-6">Link</i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

export default GroupProfile;
