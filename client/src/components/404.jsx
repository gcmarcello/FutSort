import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const Error404Page = () => {
  console.error("Error 404 (Not Found)");
  return (
    <Fragment>
      <div className="container text-center">
        <h1 className="mt-3 text-dark">Erro 404 - Não Encontrado</h1>
        <h6>Essa página não existe. Clique no botão abaixo para retornar ao painel.</h6>
        <Link to="/painel" className="btn btn-secondary my-3" role="button">
          Retornar ao painel
        </Link>
      </div>
    </Fragment>
  );
};

export default Error404Page;
