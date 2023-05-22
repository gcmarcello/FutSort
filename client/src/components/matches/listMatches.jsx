import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "../utils/table";
import dayjs from "dayjs";

const ListMatches = () => {
  const [allMatches, setAllMatches] = useState([]);

  const getMatches = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch("/api/match/listmatches", {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();
      setAllMatches(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const columns = [
    {
      Header: "Data",
      accessor: "match_date",
      Cell: ({ value, row }) => <Link to={`/partida/${row.original.match_id}`}>{dayjs(value).format("DD/MM/YYYY")}</Link>,
    },
    {
      Header: "Status",
      accessor: "match_status",
      Cell: ({ value }) => {
        switch (value) {
          case "open":
            return (
              <div className="d-flex">
                <span className="text-bg-success p-1 rounded">Aberta</span>
              </div>
            );
          case "finished":
            return (
              <div className="d-flex">
                <span className="text-bg-secondary p-1 rounded">Finalizada</span>
              </div>
            );
          case "votes":
            return (
              <div className="d-flex">
                <span className="text-bg-warning p-1 rounded">Votação</span>
              </div>
            );
          default:
            break;
        }
      },
    },
  ];

  useEffect(() => {
    getMatches();
  }, []);

  return (
    <Fragment>
      <div className="card flex-fill m-1">
        <h4 className="card-header">Partidas</h4>
        <Table data={allMatches} columns={columns} disableFilter={true} disablePagination={true} enableBottomPagination={true} />
      </div>
    </Fragment>
  );
};

export default ListMatches;
