import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditGroup = ({ group, setGroupsChange }) => {
  //editText function
  const [nameGroup, setNameGroup] = useState(group.group_name);
  const [playerList, setPlayerList] = useState([]);
  const [addPlayerName, setAddPlayerName] = useState("");
  const [addPlayerStars, setAddPlayerStars] = useState(2);
  const [playersChange, setPlayersChange] = useState(false);

  const getPlayers = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(
        `http://192.168.68.106:5000/match/creatematch/${group.group_id}/`,
        {
          method: "GET",
          headers: myHeaders,
        }
      );
      const parseData = await response.json();
      setPlayerList(parseData);
    } catch (err) {
      console.error(err.message);
    }
  };

  const editText = async (id) => {
    try {
      const body = { nameGroup };

      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      await fetch(`http://192.168.68.106:5000/dashboard/groups/${id}`, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(body),
      });

      setGroupsChange(true);

      // window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const body = { addPlayerName, addPlayerStars };
      const response = await fetch(
        `http://192.168.68.106:5000/dashboard/groups/${group.group_id}/players`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(body),
        }
      );
      // eslint-disable-next-line
      const parseResponse = await response.json();
      setPlayersChange(true);
      setAddPlayerName("");
      toast.success("Jogador Adicionado!", { theme: "colored" });
    } catch (err) {
      toast.error(err.message, { theme: "colored" });
    }
  };

  useEffect(() => {
    getPlayers();
    setPlayersChange(false);
    // eslint-disable-next-line
  }, [playersChange]);

  async function deleteGroup(id) {
    if (
      window.prompt(
        'Tem certeza de que quer deletar o grupo? Todas as partidas e jogadores serão removidos! \nDigite "Quero deletar este evento." para confirmar.'
      ) === "Quero deletar este evento."
    ) {
      try {
        const myHeaders = new Headers();

        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);
        await fetch(`http://192.168.68.106:5000/dashboard/groups/${id}`, {
          method: "DELETE",
          headers: myHeaders,
        });

        window.location = "/dashboard";
      } catch (err) {
        console.error(err.message);
      }
    }
  }

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
                <form onSubmit={onSubmitForm}>
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
                onClick={() => editText(group.group_id)}
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
