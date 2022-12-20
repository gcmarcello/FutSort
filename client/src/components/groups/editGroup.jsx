import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditGroup = ({ group, groupChange, setGroupChange }) => {
  const [nameGroup, setNameGroup] = useState(group.group_name);
  const [playerList, setPlayerList] = useState([]);
  const [addPlayerName, setAddPlayerName] = useState("");
  const [addPlayerStars, setAddPlayerStars] = useState(2);
  // eslint-disable-next-line
  const [playersChange, setPlayersChange] = useState(false);

  const getPlayers = async () => {
    setPlayersChange(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(
        `/api/match/creatematch/${group.group_id}/playerlist/`,
        {
          method: "GET",
          headers: myHeaders,
        }
      );
      const parseData = await response.json();
      setPlayerList(parseData);
      setPlayersChange(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const updateGroup = async (id) => {
    try {
      setGroupChange(true);
      const body = { nameGroup };
      if (body.nameGroup.length < 5) {
        setNameGroup(group.group_name);
        return toast.error("O nome do grupo tem de ter mais de 5 caracteres.", {
          theme: "colored",
        });
      }

      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const responseData = await fetch(`/api/group/updategroup/${id}`, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(body),
      });
      const parseResponse = await responseData.json();
      setGroupChange(false);
      toast.success(parseResponse, { theme: "colored" });
    } catch (err) {
      console.log(err.message);
    }
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const body = { addPlayerName, addPlayerStars };
      const response = await fetch(
        `/api/player/createplayer/${group.group_id}`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(body),
        }
      );
      // eslint-disable-next-line
      const parseResponse = await response.json();
      if (typeof parseResponse === "string") {
        toast.error(`${parseResponse}`, { theme: "colored" });
      } else {
        setPlayersChange(true);
        setAddPlayerName("");
        toast.success("Jogador Adicionado!", { theme: "colored" });
      }
    } catch (err) {
      toast.error(err.message, { theme: "colored" });
    }
  };

  const deleteGroup = async (id) => {
    if (
      window.prompt(
        `Tem certeza de que quer deletar o grupo? Todas as partidas e jogadores serão removidos! \n\nDigite "${group.group_name}" para confirmar.`
      ) === `${group.group_name}`
    ) {
      try {
        const myHeaders = new Headers();

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);
        await fetch(`/api/group/deletegroup/${id}`, {
          method: "DELETE",
          headers: myHeaders,
        });
        window.location = "/dashboard";
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  useEffect(() => {
    getPlayers();
    // eslint-disable-next-line
  }, [playerList]);

  return (
    <Fragment>
      <button
        type="button"
        className="btn btn-dark mx-1"
        data-bs-toggle="modal"
        data-bs-target={`#id-${group.group_id}`}
      >
        ⚙️ <span className="d-none d-md-inline-block">Editar</span>
      </button>
      <div
        className="modal "
        id={`id-${group.group_id}`}
        onClick={() => setNameGroup(nameGroup)}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Editar {group.group_name}</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={() => setNameGroup(nameGroup)}
              ></button>
            </div>

            <div className="modal-body">
              <label
                htmlFor={`group-name-input-${group.group_id}`}
                className="form-label"
              >
                Nome
              </label>
              <input
                type="text"
                className="form-control"
                value={nameGroup}
                onChange={(e) => setNameGroup(e.target.value)}
                id={`group-name-input-${group.group_id}`}
              />

              <div className="my-3" id="add-player-form">
                <form onSubmit={addPlayer}>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="add-player-input">
                        <h6>Adicionar Jogador</h6>
                      </label>
                      <input
                        type="text"
                        placeholder="Nome"
                        className="form-control"
                        id="add-player-input"
                        value={addPlayerName}
                        onChange={(e) => setAddPlayerName(e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="add-player-range" className="form-label">
                        <h6>Estrelas</h6>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        className="form-range"
                        id="add-player-range"
                        value={addPlayerStars}
                        onChange={(e) => setAddPlayerStars(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="btn btn-success btn-block form-control my-3">
                    Adicionar
                  </button>
                </form>
              </div>
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
              <button
                className="btn btn-danger form-control mt-3"
                onClick={() => deleteGroup(group.group_id)}
              >
                Deletar Grupo
              </button>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={() => updateGroup(group.group_id)}
              >
                Salvar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setNameGroup(nameGroup)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditGroup;
