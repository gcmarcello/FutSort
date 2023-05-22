import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "../../utils/table";
import Loading from "../../utils/Loading";

const ListUserGroups = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getMatches = async () => {
    try {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/group/listgroups/player/`, {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();
      setAllMatches(parseData);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { Header: "Nome", accessor: "group_name" },
    { Header: "Apelido", accessor: "player_name" },
  ];

  useEffect(() => {
    getMatches();
  }, []);

  return (
    <Fragment>
      <div className="card flex-fill m-1">
        <h4 className="card-header">Grupos</h4>
        <Table data={allMatches} columns={columns} disablePagination={true} disableFilter={true} />
      </div>
    </Fragment>
  );
};

export default ListUserGroups;
