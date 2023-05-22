import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Dashboard Components
import ListGroupMatches from "./listGroupMatches";
import ListGroupSeasons from "./listGroupSeasons";
import Pagination from "../../Pagination";
import Table from "../../utils/table";

const GroupProfile = ({ isAuthenticated }) => {
  const { id } = useParams();
  const [ranking, setRanking] = useState([]);
  const [groupName, setGroupName] = useState();
  const [requestAvailability, setRequestAvailability] = useState(true);
  const navigate = useNavigate();

  const getGroup = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/group/listgroup/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseData = await response.json();
      setGroupName(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getPlayers = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/player/listplayers/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseData = await response.json();
      setRanking(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const sendRequest = async (playerId) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/request/createrequest/${id}/${playerId}`, {
        method: "POST",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseRes = await response.json();
      if (parseRes.type === "error") {
        toast.error(parseRes.message, { theme: "colored" });
      } else {
        toast.success(parseRes.message, { theme: "colored" });
        let linkButtons = document.querySelectorAll(".link-button");
        linkButtons.forEach((element) => {
          element.remove();
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const preventRequests = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/request/preventrequests/${id}`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseRes = await response.json();
      if (parseRes.type === "error") {
        setRequestAvailability(false);
      } else {
        setRequestAvailability(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    preventRequests();
    getGroup();
    getPlayers();

    // eslint-disable-next-line
  }, []);

  const columns = [
    { Header: "Nome", accessor: "player_name" },
    { Header: "G", accessor: "player_goals" },
    { Header: "A", accessor: "player_assists" },
    { Header: "P", accessor: "player_matches" },
    {
      Header: "Usuário",
      accessor: "user_name",
      Cell: ({ value, row }) =>
        value ? (
          <i className="bi bi-patch-check-fill text-primary"> {value}</i>
        ) : (
          requestAvailability && (
            <button
              type="link"
              className="btn btn-link text-secondary link-button"
              style={{ padding: "0" }}
              onClick={() => sendRequest(row.original.player_id)}
            >
              <i className="bi bi-link-45deg fs-6">Link</i>
            </button>
          )
        ),
    },
  ];

  return (
    <Fragment>
      <div className="container my-3">
        <div className="d-flex justify-content-between mb-3">
          <h1>{groupName || "Carregando..."}</h1>
          <button className="btn btn-secondary my-auto" onClick={() => navigate("/painel")}>
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>
        <hr />
        <h3>Jogadores</h3>
        <Table data={ranking} columns={columns} disablePagination={true} enableBottomPagination={true} />
        <div className="d-flex flex-wrap mt-1">
          <ListGroupMatches />
          <ListGroupSeasons />
        </div>
      </div>
    </Fragment>
  );
};

export default GroupProfile;
