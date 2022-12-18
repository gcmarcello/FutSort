import React, { Fragment, useEffect, useState } from "react";

const CreateGroup = ({ setGroupsChange }) => {
  const [nameGroup, setnameGroup] = useState("");
  const [buttonState, setButtonState] = useState(true);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const body = { nameGroup };
      const response = await fetch(
        "http://192.168.68.106:5000/dashboard/groups",
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(body),
        }
      );

      const parseResponse = await response.json();
      setGroupsChange(true);
      setnameGroup("");
      console.log(parseResponse);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (nameGroup.length < 5) {
      setButtonState(true);
    } else {
      setButtonState(false);
    }
  }, [nameGroup]);

  return (
    <Fragment>
      <form onSubmit={onSubmitForm}>
        <label htmlFor="newGroupInputName" className="form-input">
          Nome do Grupo
        </label>
        <div className="d-flex">
          <input
            type="text"
            placeholder="Min. de 5 caracteres"
            id="newGroupInputName"
            className="form-control"
            value={nameGroup}
            onChange={(e) => setnameGroup(e.target.value)}
          />
          <button className="btn btn-success" disabled={buttonState}>
            Adicionar
          </button>
        </div>
      </form>
    </Fragment>
  );
};

export default CreateGroup;
