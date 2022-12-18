import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Loading from "../Loading";
import Pagination from "../Pagination";

const ListMatches = ({ allGroups, setGroupsChange }) => {
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

      const res = await fetch("http://192.168.68.106:5000/match/listmatches", {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();

      for (let i = 0; i < parseData.length; i++) {
        let dateToParse = new Date(parseData[i].match_date);
        let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
        let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(
          2,
          0
        );
        let dateToParseYear = String(dateToParse.getFullYear()).slice(2, 4);
        parseData[
          i
        ].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
      }

      setAllMatches(parseData);
    } catch (err) {
      console.error(err.message);
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
    for (
      let i = 1;
      i <= Math.ceil(filteredMatches.length / postsPerPage);
      i++
    ) {
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
        <h4 className="card-header">Partidas</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Grupo</th>
              <th>Status</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhuma Partida Encontrada
                </td>
              </tr>
            ) : (
              currentPosts[0].group_id !== null &&
              currentPosts.map((match) => (
                <tr
                  key={`match-${match.match_id}`}
                  id={`match-${match.match_id}`}
                >
                  <td>{match.formattedDate}</td>
                  <td>
                    <Link
                      to={`/editmatch/${match.match_id}`}
                      style={{ textDecoration: "underline" }}
                    >
                      {match.group_name}
                    </Link>
                  </td>
                  <td>
                    {!match.match_status ? (
                      <div className="d-flex">
                        <span className="text-bg-success p-1 rounded">
                          Aberta
                        </span>
                      </div>
                    ) : (
                      <div className="d-flex">
                        <span className="text-bg-secondary p-1 rounded">
                          Finalizada
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="dropdown">
                      <button
                        className="btn btn-dark dropdown-toggle "
                        type="button"
                        id="dropdownMenuButton1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span className="d-none d-md-inline-block">
                          ⚙️ Opções
                        </span>
                      </button>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton1"
                      >
                        <li>
                          <Link
                            to={`/viewmatch/${match.match_id}`}
                            style={{ textDecoration: "none" }}
                            className="dropdown-item"
                          >
                            Ver
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <Link
                            to={`/editmatch/${match.match_id}`}
                            style={{ textDecoration: "none" }}
                            className="dropdown-item"
                          >
                            Editar
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </td>
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

export default ListMatches;
