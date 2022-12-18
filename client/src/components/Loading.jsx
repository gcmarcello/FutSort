import React, { Fragment } from "react";

const Loading = () => {
  return (
    <Fragment>
      <div className="container-fluid d-flex justify-content-center align-items-center">
        <div
          className="spinner-border text-secondary"
          style={{ width: "1rem", height: "1rem" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </Fragment>
  );
};

export default Loading;
