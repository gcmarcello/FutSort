import React, { useState, Fragment } from "react";
import PlayerPick from "./sorting/PlayerPick";
import TeamPick from "./sorting/TeamPick";

const FastSorting = () => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(10);
  const [numberOfTeams, setNumberOfTeams] = useState(5);
  const [players, setPlayers] = useState(Array.from({ length: numberOfPlayers }, (player, index) => ({ name: ``, stars: 0, index: index })));
  const [teams, setTeams] = useState(Array.from({ length: numberOfTeams }, (team, index) => ({ name: ``, index: index })));
  const stars = Array.from({ length: 5 }, (star, index) => index);
  const [data, setData] = useState(null);

  /* const checkEmptyFields = () => {
    if (players.some((player) => player.name === "") === false && teams.some((team) => team.name === "") === false) {
      return false;
    } else {
      return true;
    }
  }; */

  const generateTeams = async () => {
    try {
      const body = { players, teams };
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);
      const res = await fetch(`/api/match/fastsorting/`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
      });
      let parseData = await res.json();
      parseData.forEach((team, index) => {
        team.name = teams[index].name;
        team.avg = team.reduce((total, object) => total + object.stars, 0) / team.length;
      });
      setData(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Fragment>
      <div className="container mb-5">
        <button className="btn btn-success" onClick={() => generateTeams()} /* disabled={checkEmptyFields()} */>
          Submit
        </button>
        <form className="d-flex flex-wrap">
          <PlayerPick
            numberOfPlayers={numberOfPlayers}
            setNumberOfPlayers={setNumberOfPlayers}
            setPlayers={setPlayers}
            players={players}
            stars={stars}
          />
          <TeamPick numberOfTeams={numberOfTeams} setNumberOfTeams={setNumberOfTeams} setTeams={setTeams} teams={teams} />
        </form>
      </div>
      {data !== null ? (
        data.map((team, index) => (
          <div key={`${index + 1}`} className="card flex-fill m-1">
            <h5 className="card-header">{`Time ${team.name} - Média: ${team.avg}`}</h5>
            <div className="card-body ps-0">
              <ul>
                {team.map((player, index) => (
                  <li key={`player-${index}`}>{player.name}</li>
                ))}
              </ul>
            </div>
          </div>
        ))
      ) : (
        <Fragment></Fragment>
      )}
    </Fragment>
  );
};

export default FastSorting;
