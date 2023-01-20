import React, { Fragment, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loading from "../utils/Loading";
import MvpVotes from "./mvpVotes";

const EditMatch = ({ isAuthenticated }) => {
  let id = useParams().id;
  const [isLoading, setIsLoading] = useState(true);
  const [matchStats, setMatchStats] = useState([]);
  const [submitStats, setSubmitStats] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [matchGoalkeepers, setMatchGoalkeepers] = useState([]);
  const [editButtonState, setEditButtonState] = useState({ disabled: false });
  const [saveButtonState, setSaveButtonState] = useState({ disabled: false });
  const [matchStatus, setMatchStatus] = useState();
  const [userAuth, setUserAuth] = useState(true);
  const [teams, setTeams] = useState([]);
  const [numberOfTeams, setNumberOfTeams] = useState();
  const [containerClass, setContainerClass] = useState("d-flex flex-wrap justify-content-center");
  const [teamCardWidth, setTeamCardWidth] = useState({ width: "40%" });

  useEffect(() => {
    getMatch();

    // eslint-disable-next-line
  }, [matchStats.length]);

  useEffect(() => {
    updateMatch();
    getTeams();
    if (teams.length < 3) {
      setTeamCardWidth({ width: "50%", flexDirection: "column" });
    } else {
      setTeamCardWidth({ width: "40%" });
    }
    // eslint-disable-next-line
  }, [submitStats]);

  const getMatch = async () => {
    try {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/match/listmatchplayers/edit/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await res.json();
      setMatchStatus(parseData.responseStatus);
      setMatchStats(parseData.responseData);
      setUserAuth(parseData.responseUserAuth);
      if (matchStatus === "finished" || matchStatus === "votes") {
        setEditButtonState({ disabled: true });
      } else {
        setEditButtonState({ disabled: false });
      }

      setMatchGoalkeepers(matchStats.filter((player) => player.match_player_goalkeeper === true));

      setMatchPlayers(matchStats.filter((player) => player.match_player_goalkeeper === false));
      setSubmitStats(parseData.responseData);
      setNumberOfTeams(parseData.responseNumberOfTeams);
      setIsLoading(false);
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

  const updateMatch = async () => {
    if (matchStatus === "finished" || matchStatus === "votes") return;
    setSaveButtonState({ disabled: true });
    setEditButtonState({ disabled: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const body = submitStats;

      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/match/editmatch/${id}`, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(body),
      });
      const parseResponse = await response.json();
      setSaveButtonState({ disabled: false });
      if (parseResponse.responseStatus === "finished") {
        setEditButtonState({ disabled: true });
      } else {
        setEditButtonState({ disabled: false });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const finishMatch = async (event) => {
    event.preventDefault();
    if (window.confirm("Deseja finalizar a partida?")) {
      try {
        const body = submitStats;

        const myHeaders = new Headers();

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const response = await fetch(`/api/match/finishmatch/${id}`, {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify(body),
        });
        // eslint-disable-next-line
        const parseResponse = await response.json();
        setSaveButtonState({ disabled: true });
        toast.success("Partida Finalizada!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        window.location = `/editmatch/${matchStats[0].match_id}`;
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  const finishVotes = async (e) => {
    e.preventDefault();
    if (window.confirm("Deseja encerrar a votação?")) {
      try {
        const myHeaders = new Headers();

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const response = await fetch(`/api/match/savevotes/${id}`, {
          method: "PUT",
          headers: myHeaders,
        });
        // eslint-disable-next-line
        const parseResponse = await response.json();
        toast.success(parseResponse, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        window.location = `/dashboard/`;
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  const toggleTeams = () => {
    if (containerClass === "d-none") {
      setContainerClass("d-flex flex-wrap justify-content-center");
    } else {
      setContainerClass("d-none");
    }
  };

  return (
    <Fragment>
      {isLoading ? (
        <Loading />
      ) : userAuth === true || userAuth === undefined ? (
        <Fragment>
          {matchStatus === "votes" ? (
            <Fragment>
              <div className="container-fluid d-flex flex-column">
                <MvpVotes
                  matchStats={matchStats}
                  matchStatus={matchStatus}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  isAuthenticated={isAuthenticated}
                />
                <button className="btn btn-success my-3" onClick={(e) => finishVotes(e)}>
                  Finalizar Votação
                </button>
              </div>
            </Fragment>
          ) : (
            <Fragment />
          )}
          <div className="container-fluid">
            <div className="d-flex flex-wrap justify-content-center align-items-center">
              <h2 className="mt-3 text-center align-middle">
                {matchStats[0].group_name} - {matchStats[0].formattedDate}
              </h2>
              <a href={`/group/${matchStats[0].group_id}`}>
                <div className="btn btn-success mx-3">Voltar ao grupo</div>
              </a>
            </div>
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
                            <li key={`${index + 1}-${player.player_id}`}>{player.player_name}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="table-responsive rounded-2 my-1 border flex-fill ">
                <form>
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="w-25">Jogador</th>
                        <th className="w-25 text-center">Gols</th>
                        <th className="w-25 text-center">Assists</th>
                      </tr>
                    </thead>
                    <tbody className="table-borderless">
                      {matchPlayers.map((player) => (
                        <tr key={`player-row-${player.matchplayer_id}`}>
                          <td>{player.player_name}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id) {
                                        return {
                                          ...object,
                                          match_player_goals: Number(++player.match_player_goals),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                +
                              </button>
                              <span className="text-center mx-1 w-50">{player.match_player_goals}</span>
                              <button
                                className="form-control btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id && player.match_player_goals > 0) {
                                        return {
                                          ...object,
                                          match_player_goals: Number(--player.match_player_goals),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                -
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id) {
                                        return {
                                          ...object,
                                          match_player_assists: Number(++player.match_player_assists),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                +
                              </button>
                              <span className="text-center mx-1 w-50">{player.match_player_assists}</span>
                              <button
                                className="form-control btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id && player.match_player_assists > 0) {
                                        return {
                                          ...object,
                                          match_player_assists: Number(--player.match_player_assists),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                -
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="w-25">Goleiros</th>
                        <th className="w-25 text-center">Gols</th>
                        <th className="w-25 text-center">Assists</th>
                      </tr>
                    </thead>
                    <tbody className="table-borderless">
                      {matchGoalkeepers.map((player) => (
                        <tr key={`player-row-${player.player_id}`}>
                          <td>{player.player_name}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id) {
                                        return {
                                          ...object,
                                          match_player_goals: Number(++player.match_player_goals),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                +
                              </button>
                              <span className="text-center mx-1 w-50">{player.match_player_goals}</span>
                              <button
                                className="form-control btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();

                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id && player.match_player_goals > 0) {
                                        return {
                                          ...object,
                                          match_player_goals: Number(--player.match_player_goals),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                -
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id) {
                                        return {
                                          ...object,
                                          match_player_assists: Number(++player.match_player_assists),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                +
                              </button>
                              <span className="text-center mx-1 w-50">{player.match_player_assists}</span>
                              <button
                                className="form-control btn btn-light rounded-1 w-50"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSubmitStats(
                                    submitStats.map((object) => {
                                      if (object.matchplayer_id === player.matchplayer_id && player.match_player_assists > 0) {
                                        return {
                                          ...object,
                                          match_player_assists: Number(--player.match_player_assists),
                                        };
                                      } else return object;
                                    })
                                  );
                                }}
                                disabled={editButtonState.disabled}
                              >
                                -
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="table mb-0">
                    <tfoot>
                      <tr>
                        <td colSpan="4">
                          {matchStats[0].match_status === "open" ? (
                            <div className="d-flex align-items-center justify-content-end my-3">
                              {!saveButtonState.disabled ? (
                                <span className="text-success align-middle me-3">Dados Atualizados!</span>
                              ) : (
                                <div className="spinner-border text-danger me-3" role="status"></div>
                              )}

                              <button type="submit" className="btn btn-success mx-1" onClick={finishMatch} disabled={saveButtonState.disabled}>
                                Finalizar Partida
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-end align-items-center">
                              <p className="text-danger align-middle text-center me-3" style={{ marginBlockEnd: "0" }}>
                                Essa partida foi finalizada.
                              </p>
                              <a href="/dashboard" className="btn btn-secondary">
                                Menu Principal
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </form>
              </div>
            </div>
          </div>
        </Fragment>
      ) : (
        <Navigate to={`/viewmatch/${id}`} />
      )}
    </Fragment>
  );
};

export default EditMatch;
