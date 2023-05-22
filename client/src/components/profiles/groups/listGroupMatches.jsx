import React, { Fragment, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Loading from "../../utils/Loading";
import Pagination from "../../Pagination";

const ListMatches = () => {
  const { id } = useParams();
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

      const res = await fetch(`/api/match/listmatches/group/${id}`, {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();

      for (let i = 0; i < parseData.length; i++) {
        let dateToParse = new Date(parseData[i].match_date);
        let dateToParseDay = String(dateToParse.getDate()).padStart(2, 0);
        let dateToParseMonth = String(dateToParse.getMonth() + 1).padStart(2, 0);
        let dateToParseYear = String(dateToParse.getFullYear()).slice(2, 4);
        parseData[i].formattedDate = `${dateToParseDay}/${dateToParseMonth}/${dateToParseYear}`;
      }

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
      <div className="card flex-fill mx-1 my-1">
        <h4 className="card-header">Partidas</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhuma Partida Encontrada.
                </td>
              </tr>
            ) : (
              currentPosts[0].group_id !== null &&
              currentPosts.map((match) => (
                <tr key={`match-${match.match_id}`} id={`match-${match.match_id}`}>
                  <td>
                    <Link to={`/partida/${match.match_id}`} style={{ textDecoration: "underline" }}>
                      {match.formattedDate}
                    </Link>
                  </td>
                  <td>
                    {match.match_status === "open" ? (
                      <div className="d-flex">
                        <span className="text-bg-success p-1 rounded">Aberta</span>
                      </div>
                    ) : match.match_status === "finished" ? (
                      <div className="d-flex">
                        <span className="text-bg-secondary p-1 rounded">Finalizada</span>
                      </div>
                    ) : (
                      <div className="d-flex">
                        <span className="text-bg-warning p-1 rounded">Votação</span>
                      </div>
                    )}
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
