import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Loading from "../../utils/Loading";
import Pagination from "../../Pagination";

const ListUserGroups = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [postsPerPage, setPostsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  let pageNumbers = [];

  const getMatches = async () => {
    try {
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
    }
  };

  // TODO: Implement filtering match list
  /* const filterMatches = () => {
    console.log(filterIndex);
    switch (filterIndex) {
      case 1:
        boolean = false;
        break;
      case -1:
        boolean = true;
        break;
      default:
        return;
    }
    setFilterIndex(filterIndex * -1);
    setFilteredMatches(
      filteredMatches.filter((match) => match.match_status === boolean)
    );
  }; */

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredMatches.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    getMatches();
    for (let i = 1; i <= Math.ceil(filteredMatches.length / postsPerPage); i++) {
      pageNumbers.push(i);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [postsPerPage]);

  useEffect(() => {
    setFilteredMatches(allMatches);
  }, [allMatches]);

  return (
    <Fragment>
      <div className="card flex-fill m-1">
        <h4 className="card-header">Grupos</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Apelido</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhuma Partida Encontrada. Conecte sua conta com um jogador de um dos grupos que você joga para ter acesso as estatísticas.
                </td>
              </tr>
            ) : (
              currentPosts[0].group_id !== null &&
              currentPosts.map((group) => (
                <tr key={`match-${group.match_id}`} id={`match-${group.match_id}`}>
                  <td>
                    <Link to={`/group/${group.group_id}`} style={{ textDecoration: "underline" }}>
                      {group.group_name}
                    </Link>
                  </td>
                  <td>{group.player_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div>
          {isLoading ? (
            <Loading />
          ) : (
            <Pagination
              postsPerPage={postsPerPage}
              setPostsPerPage={setPostsPerPage}
              totalPosts={allMatches.length}
              setCurrentPage={setCurrentPage}
              paginate={paginate}
            />
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ListUserGroups;
