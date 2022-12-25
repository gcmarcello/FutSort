import React, { Fragment, useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Dashboard Components
import ListGroupMatches from "./listGroupMatches";
import ListGroupSeasons from "./listGroupSeasons";
import Pagination from "../../Pagination";

const GroupProfile = ({ isAuthenticated }) => {
  const { id } = useParams();
  const [ranking, setRanking] = useState([]);
  const [groupName, setGroupName] = useState();
  const [sortDirection, setSortDirection] = useState({
    player_name: "DESC",
    player_goals: "DESC",
    player_assists: "DESC",
    player_matches: "DESC",
  });
  const [requestAvailability, setRequestAvailability] = useState(true);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  let pageNumbers = [];

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPlayers.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const sortData = async (field) => {
    let sortedPlayers = [...ranking];

    if (sortDirection[field] === "ASC") {
      sortedPlayers.sort(function (a, b) {
        if (a[field] < b[field]) {
          return -1;
        }
        if (a[field] > b[field]) {
          return 1;
        }
        return 0;
      });
    } else if (sortDirection[field] === "DESC") {
      sortedPlayers.sort(function (a, b) {
        if (a[field] > b[field]) {
          return -1;
        }
        if (a[field] < b[field]) {
          return 1;
        }
        return 0;
      });
    }
    sortDirection[field] === "ASC" ? setSortDirection({ ...sortDirection, [field]: "DESC" }) : setSortDirection({ ...sortDirection, [field]: "ASC" });
    setRanking(sortedPlayers);
  };

  useEffect(() => {
    preventRequests();
    getGroup();
    getPlayers();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    for (let i = 1; i <= Math.ceil(filteredPlayers.length / postsPerPage); i++) {
      pageNumbers.push(i);
    }
    // eslint-disable-next-line
  }, [postsPerPage]);

  useEffect(() => {
    setFilteredPlayers(ranking);
  }, [ranking]);

  return (
    <Fragment>
      <div className="container my-3">
        <div className="d-flex justify-content-between mb-3">
          <h1>{groupName || "Carregando..."}</h1>
          {
            //TODO: Implement follow group tool
            /* <button type="button" className="btn btn-primary">
            <i className="bi bi-plus-circle"> </i>Seguir
          </button> */
          }
        </div>

        <table className="table">
          <thead className="table-light">
            <tr>
              <th>
                Jogador{" "}
                <i
                  role="button"
                  className={`bi bi-caret-${sortDirection.player_name === "ASC" ? "up" : "down"}-fill`}
                  onClick={() => sortData("player_name")}
                ></i>
              </th>
              <th>
                Gols{" "}
                <i
                  role="button"
                  className={`bi bi-caret-${sortDirection.player_goals === "ASC" ? "up" : "down"}-fill`}
                  onClick={() => sortData("player_goals")}
                ></i>
              </th>
              <th>
                Assists{" "}
                <i
                  role="button"
                  className={`bi bi-caret-${sortDirection.player_assists === "ASC" ? "up" : "down"}-fill`}
                  onClick={() => sortData("player_assists")}
                ></i>
              </th>
              <th>
                Partidas{" "}
                <i
                  role="button"
                  className={`bi bi-caret-${sortDirection.player_matches === "ASC" ? "up" : "down"}-fill`}
                  onClick={() => sortData("player_matches")}
                ></i>
              </th>
              {isAuthenticated ? <th>Usuário</th> : <Fragment />}
            </tr>
          </thead>
          <tbody className="table-borderless">
            {currentPosts.map((player) => (
              <tr key={`player-row-${player.player_id}`}>
                <td>{player.player_name}</td>
                <td>{player.player_goals}</td>
                <td>{player.player_assists}</td>
                <td>{player.player_matches}</td>
                {isAuthenticated ? (
                  <td>
                    {player.user_name ? (
                      <i className="bi bi-patch-check-fill text-primary"> {player.user_name}</i>
                    ) : requestAvailability ? (
                      <button
                        type="link"
                        className="btn btn-link text-secondary link-button"
                        style={{ padding: "0" }}
                        onClick={() => sendRequest(player.player_id)}
                      >
                        <i className="bi bi-link-45deg fs-6">Link</i>
                      </button>
                    ) : (
                      <Fragment />
                    )}
                  </td>
                ) : (
                  <Fragment />
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          postsPerPage={postsPerPage}
          setPostsPerPage={setPostsPerPage}
          totalPosts={ranking.length}
          setCurrentPage={setCurrentPage}
          paginate={paginate}
        />
        <div className="d-flex mt-1">
          <ListGroupMatches />
          <ListGroupSeasons />
        </div>
      </div>
    </Fragment>
  );
};

export default GroupProfile;
