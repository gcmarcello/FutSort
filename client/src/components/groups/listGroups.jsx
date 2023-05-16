import React, { Fragment, useState, useEffect } from "react";
import EditGroup from "./editGroup";
import CreateMatch from "../matches/createMatch";
import CreateGroup from "./createGroup";

const ListGroups = () => {
  const [groups, setGroups] = useState([]);
  const [groupChange, setGroupChange] = useState(false);

  const getGroups = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/group/listgroups/`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await response.json();

      setGroups(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getGroups();
  }, [groupChange]);

  return (
    <Fragment>
      <div className="card flex-fill m-1 ">
        <h4 className="card-header">Grupos ({groups.length}/5) </h4>

        <table className="table table-lg" style={{ marginBottom: "0" }}>
          <thead>
            <tr>
              <th>Nome</th>
              {/* <th className="d-none d-sm-table-cell">Jogadores</th> */}
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {groups.length !== 0 &&
              groups[0].group_id !== null &&
              groups.map((group) => (
                <tr key={group.group_id} id={`${group.group_id}`}>
                  <td>{group.group_name}</td>
                  {/* <td className="d-none d-sm-table-cell">20</td> */}
                  <td>
                    <a href={`/creatematch/${group.group_id}`} className="btn btn-primary mx-1" role="button">
                      <span className="d-none d-md-inline-block">Criar Partida</span>
                    </a>
                    {<EditGroup group={group} groupChange={groupChange} setGroupChange={setGroupChange} />}
                    <a href={`/group/${group.group_id}`} className="btn btn-secondary mx-1" role="button">
                      📊 <span className="d-none d-md-inline-block">Estatísticas</span>
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="accordion accordion-flush m-1" id="accordionNewGroup">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button
                className="accordion-button collapsed rounded-0"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Adicionar Grupo
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionNewGroup">
              <div className="accordion-body">
                <CreateGroup groupChange={groupChange} setGroupChange={setGroupChange}></CreateGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ListGroups;
