import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Table from "../utils/table";

const ListGroups = ({}) => {
  let { id } = useParams();
  const [playerList, setPlayerList] = useState([]);
  const [playersChange, setPlayersChange] = useState(false);

  const getPlayers = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/match/creatematch/${id}/`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await response.json();
      setPlayerList(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getPlayers();
    setPlayersChange(false);
    // eslint-disable-next-line
  }, [playersChange]);

  return (
    <Fragment>
      <div className="table-responsive mt-3">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Jogador</th>
              <th>Gols</th>
              <th>Assists</th>
              <th>Partidas</th>
            </tr>
          </thead>
          <tbody className="table-borderless">
            {playerList.map((player) => (
              <tr key={`player-row-${player.player_id}`}>
                <td>{player.player_name}</td>
                <td>{player.player_goals}</td>
                <td>{player.player_assists}</td>
                <td>{player.player_matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

export default ListGroups;
