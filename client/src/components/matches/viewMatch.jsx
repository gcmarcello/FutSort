import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Loading from "../utils/Loading";
import MvpVotes from "./mvpVotes";

const ViewMatch = ({ isAuthenticated, setIsLoading, isLoading }) => {
  let { id } = useParams();
  const [matchStats, setMatchStats] = useState([]);
  const [submitStats, setSubmitStats] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [matchGoalkeepers, setMatchGoalkeepers] = useState([]);
  // eslint-disable-next-line
  const [matchStatus, setMatchStatus] = useState();
  const [teams, setTeams] = useState([]);
  const [numberOfTeams, setNumberOfTeams] = useState();
  const [containerClass, setContainerClass] = useState("d-flex flex-wrap justify-content-center");
  const [teamCardWidth, setTeamCardWidth] = useState({ width: "40%" });

  const getMatch = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/match/listmatchplayers/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await res.json();

      setMatchStatus(parseData.responseStatus);
      setMatchStats(parseData.responseData);
      setMatchGoalkeepers(matchStats.filter((player) => player.match_player_goalkeeper === true));
      setMatchPlayers(matchStats.filter((player) => player.match_player_goalkeeper === false));
      setSubmitStats(parseData.responseData);
      setNumberOfTeams(parseData.responseNumberOfTeams);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getTeams = () => {
    setTeams([]);
    let temporaryTeams = [];
    for (let i = 0; i < numberOfTeams; i++) {
      temporaryTeams.push(matchStats.filter((player) => player.match_player_team === i + 1));
    }
    setTeams(temporaryTeams);
  };

  const toggleTeams = () => {
    if (containerClass === "d-none") {
      setContainerClass("d-flex flex-wrap justify-content-center align-items-center");
    } else {
      setContainerClass("d-none");
    }
  };

  useEffect(() => {
    getMatch();
    // eslint-disable-next-line
  }, [matchStats.length]);

  useEffect(() => {
    getTeams();
    if (teams.length < 3) {
      setTeamCardWidth({ width: "50%", flexDirection: "column" });
    } else {
      setTeamCardWidth({ width: "40%" });
    }
    // eslint-disable-next-line
  }, [submitStats]);

  return (
    <Fragment>
      {matchStats.length ? (
        <div className="container-fluid my-3">
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <h2 className="mt-3 text-center">
              {matchStats[0].group_name} - {matchStats[0].formattedDate}
            </h2>
            <a href={`/group/${matchStats[0].group_id}`}>
              <div className="btn btn-success mx-3">Voltar ao grupo</div>
            </a>
          </div>
          <MvpVotes
            matchStats={matchStats}
            matchStatus={matchStatus}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
          />

          <button className="btn btn-light w-100 my-1" onClick={toggleTeams}>
            Mostrar/Esconder Times
          </button>
          <div className="d-flex flex-wrap justify-content-center">
            <div className={containerClass}>
              {teams.map((team, index) => (
                <div key={`${index + 1}`} className="card flex-fill m-1" style={teamCardWidth}>
                  <h5 className="card-header">{`Time ${index + 1}`}</h5>
                  <div className="card-body ps-0">
                    <ul>
                      {matchStats
                        .filter((player) => player.match_player_team === index + 1)
                        .map((player) => (
                          <li key={`${index + 1}-${player.player_id}`} className="my-2">
                            {player.player_name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="table-responsive rounded-2 my-1 border flex-fill">
              <form>
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th>Jogador</th>
                      <th>Gols</th>
                      <th>Assists</th>
                    </tr>
                  </thead>
                  <tbody className="table-borderless">
                    {matchPlayers.map((player) => (
                      <tr key={`player-row-${player.player_id}`}>
                        <td>{player.player_name}</td>
                        <td>{player.match_player_goals}</td>
                        <td>{player.match_player_assists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th>Goleiros</th>
                      <th>Gols</th>
                      <th>Assists</th>
                    </tr>
                  </thead>
                  <tbody className="table-borderless">
                    {matchGoalkeepers.map((player) => (
                      <tr key={`player-row-${player.player_id}`}>
                        <td>{player.player_name}</td>
                        <td>{player.match_player_goals}</td>
                        <td>{player.match_player_assists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </Fragment>
  );
};

export default ViewMatch;
