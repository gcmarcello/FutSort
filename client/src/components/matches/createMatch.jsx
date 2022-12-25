import React, { Fragment, useEffect, useState } from "react";

const CreateMatch = ({ group, setGroupsChange }) => {
  const [playerList, setPlayerList] = useState([]);
  const [pickedPlayers, setPickedPlayers] = useState([]);
  const [pickedGoalkeepers, setPickedGoalkeepers] = useState([]);
  const [numberOfTeams, setNumberOfTeams] = useState(4);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [playersNeeded, setPlayersNeeded] = useState(20);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [enableMatch, setEnableMatch] = useState({
    disabled: false,
    bsClass: "btn btn-outline-success",
  });

  const getPlayers = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/match/creatematch/${group.group_id}/playerlist`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await response.json();
      setPlayerList(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const addOrRemove = (id) => {
    const playerArray = [...pickedPlayers];
    const index = playerArray.indexOf(id);
    if (index === -1) {
      playerArray.push(id);
    } else {
      playerArray.splice(index, 1);
    }
    setPickedPlayers(playerArray);
  };

  const pickGoalkeepers = (id) => {
    const keeperArray = [...pickedGoalkeepers];
    const index = keeperArray.indexOf(id);
    const playerButton = document.querySelector(`#player-checkboxes-${id}`);
    if (index === -1) {
      keeperArray.push(id);
      if (playerButton.checked === true) {
        playerButton.checked = false;
        addOrRemove(id);
      }
      playerButton.disabled = "true";
    } else {
      keeperArray.splice(index, 1);
      playerButton.removeAttribute("disabled");
    }
    setPickedGoalkeepers(keeperArray);
  };

  const buttonState = () => {
    if (pickedPlayers.length === playersNeeded) {
      setEnableMatch({
        disabled: false,
        bsClass: "btn btn-success",
      });
    } else {
      setEnableMatch({
        disabled: true,
        bsClass: "btn btn-outline-success",
      });
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

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      // Match creation fetch
      const groupId = group.group_id;
      const body = {
        groupId,
        matchDate,
        numberOfTeams,
        playersPerTeam,
        pickedPlayers,
        pickedGoalkeepers,
      };
      const response = await fetch(`/api/match/creatematch/`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
      });

      const parseResponse = await response.json();
      window.location = `/editmatch/${parseResponse}`;
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    setPlayersNeeded(numberOfTeams * playersPerTeam);
  }, [numberOfTeams, playersPerTeam]);

  useEffect(() => {
    buttonState();
    // eslint-disable-next-line
  }, [pickedPlayers, playersNeeded]);

  return (
    <Fragment>
      <button type="button" className="btn btn-primary mx-1" data-bs-toggle="modal" data-bs-target={`#match-${group.group_id}`}>
        ⚽<span className="d-none d-md-inline-block">Criar Partida</span>
      </button>

      <div className="modal fade" id={`match-${group.group_id}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Criar Partida no {group.group_name}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={onSubmitForm}>
              <div className="modal-body">
                <div className="d-flex row  my-3">
                  <div className="col">
                    <label htmlFor={`numberofteams-input-${group.group_id}`}>Número de Times</label>
                    <select
                      id={`numberofteams-input-${group.group_id}`}
                      className="form-select"
                      aria-label="Default select example"
                      value={numberOfTeams}
                      onChange={(e) => {
                        setNumberOfTeams(e.target.value);
                      }}
                      required
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col">
                    <label htmlFor={`playersperteam-input-${group.group_id}`}>Jogadores por Time</label>
                    <select
                      id={`playersperteam-input-${group.group_id}`}
                      className="form-select"
                      aria-label="Default select example"
                      value={playersPerTeam}
                      onChange={(e) => {
                        setPlayersPerTeam(e.target.value);
                      }}
                      required
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="d-flex row mb-3">
                  <div className="col">
                    <label htmlFor="matchdate-input">Data da Partida</label>
                    <input
                      type="date"
                      name="matchdate-input"
                      id="matchdate-input"
                      className="form-control"
                      value={matchDate}
                      onChange={(e) => {
                        setMatchDate(e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th className="d-flex justify-content-center">
                        <h4 className="text-center">
                          Jogadores: {pickedPlayers.length}/{playersNeeded} | Goleiros: {pickedGoalkeepers.length}
                        </h4>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-borderless">
                    {playerList.map((player) => (
                      <tr key={`player-row-${player.player_id}`}>
                        <td className="d-flex row">
                          <div className="form-check col-9">
                            <input
                              type="checkbox"
                              name={player.player_name}
                              id={`player-checkboxes-${player.player_id}`}
                              className="btn-check"
                              onChange={() => addOrRemove(player.player_id)}
                            />
                            <label htmlFor={`player-checkboxes-${player.player_id}`} className="btn btn-outline-success form-control">
                              {player.player_name}
                            </label>
                          </div>
                          <div className="form-check col-3">
                            <input
                              type="checkbox"
                              name={player.player_name}
                              id={`goalkeeper-checkboxes-${player.player_id}`}
                              className="btn-check"
                              onChange={() => pickGoalkeepers(player.player_id)}
                            />
                            <label htmlFor={`goalkeeper-checkboxes-${player.player_id}`} className="btn btn-outline-warning form-control">
                              <span
                                style={{
                                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.4)",
                                }}
                              >
                                🧤
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/*                 <h4 className="text-center">
                  Jogadores: {pickedPlayers.length}/{playersNeeded} | Goleiros:{" "}
                  {pickedGoalkeepers.length}
                </h4> */}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className={enableMatch.bsClass} disabled={enableMatch.disabled}>
                  Criar Partida
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CreateMatch;
