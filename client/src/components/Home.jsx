import React, { Fragment } from "react";

import FastSorting from "./FastSorting";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Fragment>
      <div className="container">
        <div className="container bg-light shadow-sm bg-gradient p-5 my-3 rounded">
          <h1>FutSort</h1>
          <p>A mais simples e rápida ferramenta para escolher e balancear times de futebol.</p>
          <div className="container" style={{ padding: "0" }}>
            <a href="/painel" className="btn btn-primary me-3" role="button">
              Login
            </a>
            <Link to="/cadastro" className="btn btn-secondary me-3" role="button">
              Registrar
            </Link>
          </div>
        </div>
      </div>
      {/* <FastSorting /> */}
    </Fragment>
  );
};

export default Home;
