import React, { Fragment } from "react";

const Pagination = ({
  totalPosts,
  postsPerPage,
  setPostsPerPage,
  setCurrentPage,
  paginate,
}) => {
  const pageNumbers = [];
  const options = [
    { value: 1, text: "1" },
    { value: 2, text: "2" },
    { value: 3, text: "3" },
    { value: 4, text: "4" },
    { value: 5, text: "5" },
    { value: 6, text: "6" },
    { value: 7, text: "7" },
    { value: 8, text: "8" },
    { value: 9, text: "9" },
    { value: 10, text: "10" },
  ];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Fragment>
      <div
        className="btn-toolbar mb-3 justify-content-around"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group me-2" role="group" aria-label="First group">
          {pageNumbers.map((number) => (
            <button
              key={`matchPage-${number}`}
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <div className="input-group">
          <div className="input-group-text" id="btnGroupAddon">
            <i className="bi bi-list-ol"></i>
          </div>
          <select
            className="form-select"
            value={postsPerPage}
            onChange={(e) => {
              setPostsPerPage(e.target.value);
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Fragment>
  );
};

export default Pagination;
