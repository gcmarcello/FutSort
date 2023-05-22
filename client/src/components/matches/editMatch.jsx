import React, { Fragment, useState, useEffect } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import Loading from "../utils/Loading";
import MvpVotes from "./mvpVotes";
import Table from "../utils/table";
import { useMemo } from "react";
import dayjs from "dayjs";

const EditMatch = () => {
  let id = useParams().id;
  const [isLoading, setIsLoading] = useState(true);
  const [matchStats, setMatchStats] = useState(null);
  const [playerToBeUpdated, setPlayerToBeUpdated] = useState(null);
  const [teams, setTeams] = useState([]);
  const [hideStats, setHideStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getMatch = async () => {
      try {
        setIsLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const res = await fetch(`/api/match/${id}`, {
          method: "GET",
          headers: myHeaders,
        });

        const parseData = await res.json();
        setMatchStats({ players: parseData.playersStatus, match: parseData.matchStatus, isAdmin: parseData.isAdmin });
        setTeams(Array.from(Array(parseData.matchStatus.match_numofteams).keys()));
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getMatch();
  }, [id]);

  const updateStats = async (statistic, operation, playerId, playerStat) => {
    try {
      // Do not allow negative stats
      if (operation === "subtract" && playerStat === 0) return;
      if (operation === "add" && playerStat === 99) return;

      // Update the values on the client
      setMatchStats({
        isAdmin: matchStats.isAdmin,
        match: matchStats.match,
        players: matchStats.players.map((object) => {
          if (object.matchplayer_id === playerId) {
            return {
              ...object,
              [`match_player_${statistic}`]: operation === "add" ? Number(++playerStat) : Number(--playerStat),
            };
          } else return object;
        }),
      });
      setPlayerToBeUpdated(playerId);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (!playerToBeUpdated) return;
    // Fetch server to update values on the DB
    const updateMatchDB = async () => {
      try {
        /* setIsLoading(true); */
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const playerToUpdate = matchStats.players.filter((player) => player.matchplayer_id === playerToBeUpdated)[0];
        const response = await fetch(`/api/match/${id}/statistics`, {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({ playerToUpdate }),
          cache: "no-store",
        });
        const parseResponse = await response.json();
        toast[parseResponse.type](parseResponse.message, { theme: "colored" });
      } catch (error) {
        console.log(error);
        toast.error(`Erro ao atualizar a partida. ${error.message}`, { theme: "colored" });
      } finally {
        /* setIsLoading(false); */
      }
    };
    updateMatchDB();
    setPlayerToBeUpdated(null);
  }, [playerToBeUpdated]);

  const alterMatchStatus = async (status) => {
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/match/${id}/${status}`, {
        method: "PUT",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseResponse = await response.json();
      toast[parseResponse.type](parseResponse.message, { theme: "colored" });
      if (parseResponse.type === "success") {
        window.location = `/partida/${matchStats[0].match_id}`;
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const columns = useMemo(
    () => [
      { Header: "Jogador", accessor: "player_name" },
      {
        Header: "Gols",
        accessor: "",
        disableSortBy: true,
        className: hideStats && `d-none`,
        Cell: ({ row, value }) => (
          <>
            {matchStats.isAdmin && matchStats.match.match_status === "open" && (
              <button
                className="btn btn-light rounded-1 d-inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  updateStats("goals", "add", row.original.matchplayer_id, row.original.match_player_goals);
                }}
              >
                +
              </button>
            )}

            <span className="text-center mx-1 ">{row.original.match_player_goals}</span>
            {matchStats.isAdmin && matchStats.match.match_status === "open" && (
              <button
                className="btn btn-light rounded-1 d-inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  updateStats("goals", "subtract", row.original.matchplayer_id, row.original.match_player_goals);
                }}
              >
                -
              </button>
            )}
          </>
        ),
      },
      {
        Header: "Assists",
        accessor: "",
        disableSortBy: true,
        className: hideStats && `d-none`,
        Cell: ({ row }) => (
          <>
            {matchStats.isAdmin && matchStats.match.match_status === "open" && (
              <button
                className="btn btn-light rounded-1 d-inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  updateStats("assists", "add", row.original.matchplayer_id, row.original.match_player_assists);
                }}
              >
                +
              </button>
            )}
            <span className="text-center mx-1 ">{row.original.match_player_assists}</span>
            {matchStats.isAdmin && matchStats.match.match_status === "open" && (
              <button
                className="btn btn-light rounded-1 d-inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  updateStats("assists", "subtract", row.original.matchplayer_id, row.original.match_player_assists);
                }}
              >
                -
              </button>
            )}
          </>
        ),
      },
    ],
    [hideStats, matchStats]
  );

  if (isLoading) {
    return <Loading />;
  }

  const StatusButton = ({ status }) => {
    switch (status) {
      case "open":
        return (
          <>
            <button type="button" className="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#finishMatchModal">
              <i className="bi bi-check-circle"></i>
            </button>
            <ChangeMatchStatusModal status={status} />
          </>
        );
      case "votes":
        return (
          <>
            <button type="button" className="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#finishMatchModal">
              <i className="bi bi-list-check"></i>
            </button>
            <ChangeMatchStatusModal status={status} />
          </>
        );
      default:
        break;
    }
  };

  const ChangeMatchStatusModal = ({ status }) => {
    return (
      <>
        <div className="modal fade" id="finishMatchModal" tabIndex="-1" aria-labelledby="finishMatchModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="finishMatchModalLabel">
                  {status === "open" ? "Finalizar Partida" : "Encerrar Votação"}
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {status === "open" ? "Deseja finalizar a partida e iniciar a votação?" : "Deseja encerrar a votação e contabilizar os votos?"}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  data-bs-dismiss="modal"
                  onClick={() => alterMatchStatus(status === "open" ? "votes" : "finished")}
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Fragment>
      <div className="container my-3 px-3">
        <div className="d-flex justify-content-between">
          <h1 className="mb-0">
            {matchStats && (
              <>
                <Link to={`/grupo/${matchStats.match.group_id}`}>{matchStats.match.group_name}</Link>{" "}
                {`- ${dayjs(matchStats.match.match_date).format("DD/MM/YYYY")}`}
              </>
            )}
          </h1>
          <div className="d-flex justify-content-evenly my-auto">
            <button
              className="btn btn-warning me-2"
              onClick={(e) => {
                e.preventDefault();
                setHideStats(!hideStats);
              }}
            >
              <i className={`bi bi-eye${!hideStats ? "-slash" : ""}-fill`}></i>
            </button>
            {matchStats.isAdmin && <StatusButton status={matchStats.match.match_status} />}
            <button className="btn btn-secondary my-auto" onClick={() => navigate("/painel")}>
              <i className="bi bi-arrow-left"></i>
            </button>
          </div>
        </div>

        <hr />
        {matchStats.match.match_status === "votes" && (
          <Fragment>
            <div className="container-fluid d-flex flex-column">
              <MvpVotes
                matchStats={matchStats.players}
                matchStatus={matchStats.match.match_status}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                id={id}
              />
            </div>
          </Fragment>
        )}
        <h3>Times</h3>
        <div className="d-flex flex-wrap justify-content-evenly">
          {matchStats &&
            teams.map((team) => (
              <div key={team} className={`card my-1 mx-0 mx-lg-2 vw-${hideStats ? "50" : "100"}`} style={{ minWidth: "9em" }}>
                <div className="card-header">Time {team + 1}</div>
                <div>
                  <Table
                    data={matchStats.players.filter((player) => player.match_player_team === team + 1)}
                    columns={columns}
                    customPageSize={20}
                    disableFilter
                    disablePagination
                    hideHeader={hideStats ? true : false}
                  />
                </div>
              </div>
            ))}
        </div>
        <hr />
        <h3>Goleiros</h3>
        <div className="d-flex justify-content-center justify-content-lg-start">
          <div className="card my-1 mx-2 vw-100">
            <div className="card-header">Goleiros</div>
            <div>
              {matchStats && (
                <Table
                  data={matchStats.players.filter((player) => player.match_player_goalkeeper)}
                  columns={columns}
                  customPageSize={20}
                  disableFilter
                  disablePagination
                  hideHeader={hideStats ? true : false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditMatch;
