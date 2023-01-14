import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";

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
        <table className="table ">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Jogador</th>
              <th>Usuário</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {requests.length !== 0 ? (
              requests.map((request) => (
                <tr key={request.request_id}>
                  <td className="text-wrap">{request.group_name}</td>
                  <td>{request.player_name}</td>
                  <td>{request.user_name}</td>
                  <td>
                    <div className="d-flex">
                      <button type="button" className="btn btn-success mx-1" onClick={() => answerRequest(request.request_id, "approved")}>
                        <i className="bi bi-check2 fs-6"></i>
                      </button>
                      <button type="button" className="btn btn-danger mx-1" onClick={() => answerRequest(request.request_id, "denied")}>
                        <i className="bi bi-x fs-6"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  Você não tem nenhuma solicitação pendente!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};
export default ListRequests;
