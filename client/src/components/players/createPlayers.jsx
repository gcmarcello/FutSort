import React, { Fragment, useState } from "react";

const CreateGroup = ({ setGroupsChange }) => {
  const [nameGroup, setnameGroup] = useState("");

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const body = { nameGroup };
      const response = await fetch("/groups/groups", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
      });

      const parseResponse = await response.json();
      setGroupsChange(true);
      setnameGroup("");
      console.log(parseResponse);
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <Fragment>
      <h1 className="text-center my-5">Criar Jogador</h1>
      <form className="d-flex" onSubmit={onSubmitForm}>
        <input
          type="text"
          placeholder="Nome do Grupo"
          className="form-control"
          value={nameGroup}
          onChange={(e) => setnameGroup(e.target.value)}
        />
        <button className="btn btn-success ">Adicionar</button>
      </form>
    </Fragment>
  );
};

export default CreateGroup;
