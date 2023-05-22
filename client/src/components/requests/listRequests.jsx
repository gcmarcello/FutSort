import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../utils/table";

const ListRequests = ({ requestsChange, setRequestsChange }) => {
  const [requests, setRequests] = useState([]);

  const getPendingRequests = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/request/listrequests/`, {
        method: "GET",
        headers: myHeaders,
      });
      // eslint-disable-next-line
      const parseData = await response.json();
      setRequests(parseData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const answerRequest = async (id, choice) => {
    try {
      setRequestsChange(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const response = await fetch(`/api/request/updaterequest/${id}/${choice}`, {
        method: "PUT",
        headers: myHeaders,
      });
      const parseRes = await response.json();
      toast.success(parseRes, { theme: "colored" });
      setRequestsChange(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getPendingRequests();
  }, [requestsChange]);

  return (
    <Fragment>
      <div className="card flex-fill m-1 ">
        <h4 className="card-header">Solicitações</h4>
        <Table
          data={requests}
          disableFilter={true}
          disablePagination={true}
          columns={[
            { Header: "Grupo", accessor: "group_name" },
            { Header: "Jogador", accessor: "player_name" },
            { Header: "Usuário", accessor: "user_name" },
            {
              Header: "Responder",
              accessor: "request_id",
              Cell: ({ value }) => (
                <div className="d-flex">
                  <button type="button" className="btn btn-success mx-1" onClick={() => answerRequest(value, "approved")}>
                    <i className="bi bi-check2 fs-6"></i>
                  </button>
                  <button type="button" className="btn btn-danger mx-1" onClick={() => answerRequest(value, "denied")}>
                    <i className="bi bi-x fs-6"></i>
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Fragment>
  );
};
export default ListRequests;
