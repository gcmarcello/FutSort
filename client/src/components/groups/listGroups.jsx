import React, { Fragment, useState, useEffect } from "react";
import EditGroup from "./editGroup";
import CreateMatch from "../matches/createMatch";
import CreateGroup from "./createGroup";

const ListGroups = ({ allGroups, setGroupsChange }) => {
  const [groups, setGroups] = useState([]);

  //delete group function

  useEffect(() => {
    setGroups(allGroups);
  }, [allGroups]);

  return (
    <Fragment>
      <div className="card flex-fill m-1 ">
        <h4 className="card-header">Grupos </h4>

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
                    {
                      <EditGroup
                        group={group}
                        setGroupsChange={setGroupsChange}
                      />
                    }
                    <CreateMatch
                      group={group}
                      setGroupsChange={setGroupsChange}
                    />
                    <button className="btn btn-secondary mx-1">
                      📊{" "}
                      <span className="d-none d-md-inline-block">Ranking</span>
                    </button>
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
            <div
              id="collapseOne"
              className="accordion-collapse collapse"
              aria-labelledby="headingOne"
              data-bs-parent="#accordionNewGroup"
            >
              <div className="accordion-body">
                <CreateGroup setGroupsChange={setGroupsChange}></CreateGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ListGroups;
