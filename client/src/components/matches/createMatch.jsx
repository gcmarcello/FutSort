import React, { Fragment, useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";

import Table from "../utils/table";
import Loading from "../utils/Loading";
const dayjs = require("dayjs");

const CreateMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playerList, setPlayerList] = useState([]);
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const [pickedGoalkeepers, setPickedGoalkeepers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hiddenBar, setHiddenBar] = useState(false);

  const { watch, getValues, setValue, control, register, handleSubmit } = useForm({
    mode: "onChange",
  });

  const { append } = useFieldArray({
    control,
    name: "players", // unique name for your Field Array
    mode: "onChange",
  });

  const togglePosition = (index) => {
    if (getValues("players")[index].player_picked) {
      setValue(`players.${index}.player_picked`, false);
    }
    if (getValues("players")[index].gk_picked) {
      setValue(`players.${index}.gk_picked`, false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        Header: "Jogador",
        accessor: "player_name",
        Cell: ({ row }) => (
          <Fragment key={`player-fragment-${row.index}`}>
            <div className="d-flex justify-content-between">
              <input
                type="hidden"
                defaultValue={row.original.player_name}
                id={`player-name-${row.index}`}
                {...register(`players.${row.index}.player_name`)}
              />
              <input
                type="hidden"
                defaultValue={row.original.player_id}
                id={`player-name-${row.index}`}
                {...register(`players.${row.index}.player_id`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.player_goals}
                id={`player-goals-${row.index}`}
                {...register(`players.${row.index}.player_goals`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.player_assists}
                id={`player-assists-${row.index}`}
                {...register(`players.${row.index}.player_assists`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.player_matches}
                id={`player-matches-${row.index}`}
                {...register(`players.${row.index}.player_matches`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.mvp_gk}
                id={`player-mvp_gk-${row.index}`}
                {...register(`players.${row.index}.mvp_gk`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.mvp_df}
                id={`player-mvp_df-${row.index}`}
                {...register(`players.${row.index}.mvp_df`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.mvp_at}
                id={`player-mvp_at-${row.index}`}
                {...register(`players.${row.index}.mvp_at`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                defaultValue={row.original.player_stars}
                id={`player-stars-${row.index}`}
                {...register(`players.${row.index}.player_stars`, { valueAsNumber: true })}
              />
              <input
                type="checkbox"
                id={`player-checkbox-${row.index}`}
                className="btn-check"
                onClick={() => togglePosition(row.index)}
                defaultValue={false}
                checked={Boolean(getValues(`players.${row.index}.player_picked`))}
                {...register(`players.${row.index}.player_picked`)}
              />
              <label htmlFor={`player-checkbox-${row.index}`} className="btn btn-outline-success" style={{ width: "85%" }}>
                {row.original.player_name}
              </label>{" "}
              <div className="flex-fill">
                <input
                  type="checkbox"
                  id={`gk-checkbox-${row.index}`}
                  className="btn-check"
                  onClick={() => togglePosition(row.index)}
                  {...register(`players.${row.index}.gk_picked`)}
                />
                <label htmlFor={`gk-checkbox-${row.index}`} className="btn btn-outline-warning ms-2 w-100">
                  <span
                    style={{
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    🧤
                  </span>
                </label>
              </div>
            </div>
          </Fragment>
        ),
      },
    ]; //eslint-disable-next-line
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const matchInfo = {
        numberOfTeams: data.numberOfTeams,
        date: data.matchDate,
        pickedPlayers: data.players.filter((player) => player.player_picked),
        pickedGoalkeepers: data.players.filter((player) => player.gk_picked),
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      // Match creation fetch
      const response = await fetch(`/api/match/sorting`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(matchInfo),
      });

      const parseResponse = await response.json();
      if (parseResponse.type === "success") {
        setGeneratedTeams(parseResponse.data.teams);
        setPickedGoalkeepers(parseResponse.data.pickedGoalkeepers);
      } else {
        toast.error(parseResponse.message, { theme: "colored" });
      }
    } catch (error) {
      toast.error(error, { theme: "colored" });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayers = async () => {
    try {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/match/creatematch/${id}/playerlist`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await response.json();
      setPlayerList(parseData);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createMatch = async () => {
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const body = {
        generatedTeams,
        goalkeepers: pickedGoalkeepers,
        matchSettings: { numberOfTeams: getValues("numberOfTeams"), date: getValues("matchDate") },
      };

      const response = await fetch(`/api/match/new/${id}`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
      });
      const parseResponse = await response.json();
      if (parseResponse.id) {
        navigate(`/partida/${parseResponse.id}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    { value: 2, text: "2" },
    { value: 3, text: "3" },
    { value: 4, text: "4" },
    { value: 5, text: "5" },
    { value: 6, text: "6" },
    { value: 7, text: "7" },
    { value: 8, text: "8" },
    { value: 9, text: "9" },
    { value: 10, text: "10" },
  ];

  useEffect(() => {
    getPlayers();
    append(playerList);
    //eslint-disable-next-line
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const DisplayTeams = () => {
    return (
      <>
        <div className="d-flex flex-column justify-content-evenly">
          <div>
            <h3>Times Sorteados</h3>
          </div>
          <div className="d-flex  flex-wrap flex-md-row justify-content-evenly align-items-center mb-3 ">
            {generatedTeams.map((team, index) => (
              <div key={`team-card-${index + 1}`} className="card my-2 " style={{ width: "10rem" }}>
                <div className="card-header">Time {index + 1}</div>
                <ul className="list-group list-group-flush">
                  {team &&
                    team.map(
                      (player, playerIndex) =>
                        player && (
                          <li key={`player-${playerIndex + 1}-${index + 1}`} className="list-group-item">
                            {player.player_name} {/* - {player.player_stars.toFixed(2)} */}
                          </li>
                        )
                    )}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h3>Goleiros</h3>
            <ul className="list-group list-group-horizontal">
              {pickedGoalkeepers.map((goalkeeper, index) => (
                <li className="list-group-item" key={`picked-goalkeeper-${index}`}>
                  {goalkeeper.player_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  };

  const PickedPlayers = () => {
    if (!getValues("players")) {
      return null;
    }

    return (
      <Fragment>
        <Table
          data={getValues("players")?.filter((player) => player.player_picked)}
          columns={[
            {
              Header: "Jogadores Escolhidos",
              accessor: "player_name",
              /* Cell: ({ value, row }) => (
                <>
                  {value} <button onClick={() => setValue(`players.${row.index}.player_picked`, false)}>Remover</button>
                </>
              ), */
            },
          ]}
          customPageSize={5}
        />
        <Table
          className="mt-1"
          data={getValues("players")?.filter((player) => player.gk_picked)}
          columns={[
            {
              Header: "Goleiros Escolhidos",
              accessor: "player_name",
            },
          ]}
        />
      </Fragment>
    );
  };

  const MatchSettings = () => {
    return (
      <div className="d-flex row mb-3">
        <div className="col-12 col-lg-6">
          <label htmlFor={`numberofteams-input-${id}`}>Número de Times</label>
          <select
            id={`numberofteams-input-${id}`}
            className="form-select"
            aria-label="Default select example"
            defaultValue={4}
            {...register(`numberOfTeams`, { required: true })}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-lg-6">
          <label htmlFor="matchdate-input">Data da Partida</label>
          <input
            type="date"
            name="matchdate-input"
            id="matchdate-input"
            className="form-control"
            defaultValue={dayjs().format("YYYY-MM-DD")}
            {...register(`matchDate`, { required: true })}
          />
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="bg-light">
        <div className="px-lg-5 py-lg-5">
          <div className="p-3 bg-white rounded rounded-2 shadow">
            <div className="d-flex justify-content-between">
              <h1>Criar Partida</h1>{" "}
              <button className="btn btn-secondary my-auto" onClick={() => navigate("/painel")}>
                <i className="bi bi-arrow-left"></i>
              </button>
            </div>
            <hr />
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                {!generatedTeams && <MatchSettings />}
                {!generatedTeams ? (
                  <>
                    <div className="col-12 col-lg-6">{isLoading ? <p>Loading...</p> : <Table data={playerList} columns={columns} />}</div>
                    <div className="col-12 col-lg-6 d-none d-lg-block">
                      <PickedPlayers />
                    </div>
                  </>
                ) : (
                  <div className="col-12 d-lg-block">
                    <DisplayTeams />
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabIndex="-1"
        id="offcanvasPlayers"
        aria-labelledby="offcanvasScrollingLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasScrollingLabel">
            Jogadores de Linha:
          </h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="list-group">
            {watch("players")
              ?.filter((player) => player.player_picked)
              .map((player, index) => (
                <li className="list-group-item" key={`${index}-nav-list`}>
                  {player.player_name}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabIndex="-1"
        id="offcanvasKeepers"
        aria-labelledby="offcanvasScrollingLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasScrollingLabel">
            Goleiros
          </h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="list-group">
            {watch("players")
              ?.filter((player) => player.gk_picked)
              .map((player) => (
                <li className="list-group-item" key={`${player.player_id}-gk-list`}>
                  {player.player_name}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-0" style={{ height: hiddenBar ? "0px" : "80px" }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            setHiddenBar(!hiddenBar);
          }}
          className={`btn btn-success rounded-0 ${hiddenBar ? "rounded-bottom" : "rounded-top"}`}
          style={{ position: "fixed", bottom: hiddenBar ? "0px" : "80px", transform: hiddenBar ? "rotate(180deg)" : "" }}
        >
          <i className={`bi bi-chevron-bar-down`} style={{ transitionDuration: "0.5s" }}></i>
        </button>
        <div
          className={`create-match-footer bg-success ${
            hiddenBar && "h-0"
          } d-flex justify-content-evenly justify-content-lg-end align-items-center w-100 pe-3 ${!isAtBottom && "shadow-lg"}`}
          style={{ opacity: hiddenBar ? "0" : "1", height: hiddenBar ? "0px" : "80px" }}
        >
          {!generatedTeams && !hiddenBar && (
            <>
              <button
                className="btn btn-light mx-2 d-inline-block d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasPlayers"
                aria-controls="offcanvasPlayers"
              >
                Linha: {watch("players")?.filter((player) => player.player_picked).length}
              </button>
              <button
                className="btn btn-warning mx-2 d-inline-block d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasKeepers"
                aria-controls="offcanvasKeepers"
              >
                Goleiros: {watch("players")?.filter((player) => player.gk_picked).length}
              </button>
            </>
          )}
          {generatedTeams && !hiddenBar && (
            <button
              className="btn btn-outline-light mx-2"
              onClick={(e) => {
                e.preventDefault();
                setGeneratedTeams(null);
              }}
            >
              Alterar
            </button>
          )}
          <button className="btn btn-outline-light mx-3" onClick={() => onSubmit(getValues())}>
            {generatedTeams ? "Resortear" : "Sortear"}
          </button>
          {generatedTeams && !hiddenBar && (
            <>
              <div className="vr" style={{ height: "38px", margin: "21px 10px" }}></div>
              <button
                className="btn btn-warning mx-2"
                onClick={(e) => {
                  e.preventDefault();
                  createMatch();
                }}
              >
                Criar Partida
              </button>
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default CreateMatch;
