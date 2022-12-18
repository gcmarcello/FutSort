import React, { Fragment } from "react";

const Error404Page = () => {
  return (
    <Fragment>
      <div className="container text-center">
        <h1 className="mt-3 text-danger">Erro 404 - Não Encontrado</h1>
        <h6>
          Essa página não existe. Clique no botão abaixo para retornar ao
          painel.
        </h6>
        <a href="/dashboard" className="btn btn-primary my-3" role="button">
          Retornar ao painel
        </a>
      </div>
    </Fragment>
  );
};

export default Error404Page;
