import React, { Fragment, useEffect } from "react";

const PlayerPick = ({ numberOfPlayers, setNumberOfPlayers, players, setPlayers, stars }) => {
  const handlePlayerChange = (e, player, key) => {
    setPlayers(
      players.map((selectedPlayer) => {
        if (selectedPlayer.index === player.index) {
          return { ...selectedPlayer, [key]: key === "stars" ? Number(e.target.value) : e.target.value };
        } else {
          return selectedPlayer;
        }
      })
    );
  };

  const addPlayer = (index) => {
    let nextIndex = players.sort((a, b) => b.index - a.index)[0].index + 1;
    setPlayers([...players, { name: ``, stars: 0, index: nextIndex }]);
  };

  const removePlayer = (playerIndex) => {
    if (players.length > 1) {
      setPlayers(players.filter((player) => player.index !== playerIndex));
    }
  };

  useEffect(() => {
    setNumberOfPlayers(players.length);
    // eslint-disable-next-line
  }, [players]);

  return (
    <div className="flex-fill">
      <h3>Jogadores: {numberOfPlayers}</h3>{" "}
      <table>
        <thead>
          <tr>
            <th scope="col">Jogador</th>
            <th scope="col">Estrelas</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={`player-name-${index}`}>
              <td style={{ padding: "0.5rem 0rem" }}>
                <div className="input-group">
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    id={`remove-player-button-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      removePlayer(player.index);
                    }}
                  >
                    <i className="bi bi-x-circle fw-bolder"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Jogador ${index + 1}`}
                    name={`player-${index}`}
                    value={player.name}
                    onChange={(e) => handlePlayerChange(e, player, `name`)}
                  />
                </div>
              </td>

              <td style={{ verticalAlign: "middle" }}>
                <div className="btn-group mx-1" role="group" aria-label="Basic radio toggle button group">
                  {stars.map((star, radioIndex) => (
                    <Fragment key={`player-star-${radioIndex}`}>
                      <input
                        type="radio"
                        className="btn-check"
                        value={Number(radioIndex) + 1}
                        onChange={(e) => handlePlayerChange(e, player, "stars")}
                        name={`radio-player-${index}`}
                        id={`player-${index}-radio-${radioIndex}`}
                      />
                      <label className="btn btn-outline-secondary" htmlFor={`player-${index}-radio-${radioIndex}`}>
                        {star + 1}
                      </label>
                    </Fragment>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex mt-3">
        <button
          className="btn btn-primary me-3"
          onClick={(e) => {
            e.preventDefault();
            addPlayer(players.length);
          }}
        >
          Adicionar Jogador
        </button>
      </div>
    </div>
  );
};

export default PlayerPick;
