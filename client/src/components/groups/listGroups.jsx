import React, { Fragment, useState, useEffect } from "react";
import EditGroup from "./editGroup";
import CreateMatch from "../matches/createMatch";
import CreateGroup from "./createGroup";
import Table from "../utils/table";
import { Link } from "react-router-dom";

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

  const columns = [
    { Header: "Nome", accessor: "group_name" },
    {
      Header: "Opções",
      accessor: "group_id",
      Cell: ({ value }) => (
        <>
          <Link to={`/creatematch/${value}`} className="btn btn-primary mx-1">
            ⚽ <span className="d-none d-md-inline-block">Criar Partida</span>
          </Link>
          <EditGroup group={groups.filter((group) => group.group_id === value)[0]} groupChange={groupChange} setGroupChange={setGroupChange} />
          <Link to={`/grupo/${value}`} className="btn btn-secondary mx-1">
            📊 <span className="d-none d-md-inline-block">Estatísticas</span>
          </Link>
        </>
      ),
    },
  ];

  useEffect(() => {
    getGroups();
  }, [groupChange]);

  return (
    <Fragment>
      <div className="card flex-fill m-1 ">
        <h4 className="card-header">Grupos ({groups.length}/5) </h4>
        <Table data={groups} columns={columns} disablePagination={true} disableFilter={true} customPageSize={5} />
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
