import React, { Fragment } from "react";

const Loading = () => {
  return (
    <Fragment>
      <div className="vh-100 w-100 container-fluid d-flex justify-content-center align-items-center">
        <div
          className="spinner-border text-secondary"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </Fragment>
  );
};

export default Loading;
