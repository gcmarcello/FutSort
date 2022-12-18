import React, { Fragment } from "react";

const Home = () => {
  return (
    <Fragment>
      <div className="container-xl bg-light shadow-sm bg-gradient p-5 my-3 rounded">
        <h1>FutSort</h1>
        <p>
          A mais simples e rápida ferramenta para escolher e balancear times de
          futebol.
        </p>
        <div className="container" style={{ padding: "0" }}>
          <a href="/dashboard" className="btn btn-primary me-3" role="button">
            Login
          </a>
          <button className="btn btn-disabled shadow-sm">
            Register (Soon)
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
