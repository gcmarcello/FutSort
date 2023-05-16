import React, { Fragment, useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loading from "../utils/Loading";
import MvpVotes from "./mvpVotes";
import Table from "../utils/table";
import { useMemo } from "react";

const EditMatch = () => {
  let id = useParams().id;
  const [isLoading, setIsLoading] = useState(true);
  const [matchStats, setMatchStats] = useState([]);
  const [matchStatus, setMatchStatus] = useState(null);
  const [playerToBeUpdated, setPlayerToBeUpdated] = useState(null);
  const [teams, setTeams] = useState([]);
  const [hideStats, setHideStats] = useState(false);

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
        setMatchStats(parseData.playersStatus);
        setMatchStatus(parseData.matchStatus);
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
      setMatchStats(
        matchStats.map((object) => {
          if (object.matchplayer_id === playerId) {
            return {
              ...object,
              [`match_player_${statistic}`]: operation === "add" ? Number(++playerStat) : Number(--playerStat),
            };
          } else return object;
        })
      );
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
        setIsLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const playerToUpdate = matchStats.filter((player) => player.matchplayer_id === playerToBeUpdated)[0];
        const response = await fetch(`/api/match/${id}/players`, {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({ playerToUpdate }),
          cache: "no-store",
        });
        const parseResponse = await response.json();
        toast[parseResponse.type](parseResponse.message, { theme: "colored" });
      } catch (error) {
        toast.error("Erro ao atualizar a partida.", { theme: "colored" });
      } finally {
        setPlayerToBeUpdated(null);
        setIsLoading(false);
      }
    };
    updateMatchDB();
  }, [playerToBeUpdated]);

  const finishMatch = async (event) => {
    event.preventDefault();
    if (window.confirm("Deseja finalizar a partida?")) {
      try {
        /* const body = submitStats; */

        const myHeaders = new Headers();

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const response = await fetch(`/api/match/finishmatch/${id}`, {
          method: "PUT",
          headers: myHeaders,
          /* body: JSON.stringify(body), */
        });
        // eslint-disable-next-line
        const parseResponse = await response.json();
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
            <button
              className="btn btn-light rounded-1 d-inline-block"
              onClick={(e) => {
                e.preventDefault();
                updateStats("goals", "add", row.original.matchplayer_id, row.original.match_player_goals);
              }}
              disabled={isLoading}
            >
              +
            </button>
            <span className="text-center mx-1 ">{row.original.match_player_goals}</span>
            <button
              className="btn btn-light rounded-1 d-inline-block"
              onClick={(e) => {
                e.preventDefault();
                updateStats("goals", "subtract", row.original.matchplayer_id, row.original.match_player_goals);
              }}
              disabled={isLoading}
            >
              -
            </button>
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
            <button
              className="btn btn-light rounded-1 d-inline-block"
              onClick={(e) => {
                e.preventDefault();
                updateStats("assists", "add", row.original.matchplayer_id, row.original.match_player_assists);
              }}
              disabled={isLoading}
            >
              +
            </button>
            <span className="text-center mx-1 ">{row.original.match_player_assists}</span>
            <button
              className="btn btn-light rounded-1 d-inline-block"
              onClick={(e) => {
                e.preventDefault();
                updateStats("assists", "subtract", row.original.matchplayer_id, row.original.match_player_assists);
              }}
              disabled={isLoading}
            >
              -
            </button>
          </>
        ),
      },
    ],
    [hideStats, matchStats]
  );

  return (
    <Fragment>
      <div className="container my-3 px-3">
        <div className="d-flex justify-content-between">
          <h1 className="mb-0">Partida</h1>
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
            <button className="btn btn-secondary my-auto">Voltar</button>
          </div>
        </div>
        <hr />
        {matchStatus === "votes" && (
          <Fragment>
            <div className="container-fluid d-flex flex-column">
              <MvpVotes matchStats={matchStats} matchStatus={matchStatus} setIsLoading={setIsLoading} isLoading={isLoading} />
              <button className="btn btn-success my-3" onClick={(e) => finishVotes(e)}>
                Finalizar Votação
              </button>
            </div>
          </Fragment>
        )}
        <h3>Times</h3>
        <div className="d-flex flex-wrap justify-content-evenly">
          {teams.map((team) => (
            <div key={team} className={`card my-1 mx-0 mx-lg-2 vw-${hideStats ? "50" : "100"}`} style={{ minWidth: "9em" }}>
              <div className="card-header">Time {team + 1}</div>
              <div>
                <Table
                  data={matchStats.filter((player) => player.match_player_team === team + 1)}
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
              <Table
                data={matchStats.filter((player) => player.match_player_goalkeeper)}
                columns={columns}
                customPageSize={20}
                disableFilter
                disablePagination
                hideHeader={hideStats ? true : false}
              />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditMatch;
