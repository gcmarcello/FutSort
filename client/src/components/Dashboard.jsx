import React, { Fragment, useState } from "react";

// Dashboard Components
import ListGroups from "./groups/listGroups";
import ListMatches from "./matches/listMatches";
import ListUserMatches from "./profiles/users/listUserMatches";
import ListUserGroups from "./profiles/users/listUserGroups";
import ListRequests from "./requests/listRequests";

const Dashboard = ({ allGroups, setAllGroups }) => {
  const [groupsChange, setGroupsChange] = useState(false);
  const [requestsChange, setRequestsChange] = useState(false);

  return (
    <Fragment>
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="player-tab"
            data-bs-toggle="tab"
            data-bs-target="#player"
            type="button"
            role="tab"
            aria-controls="player"
            aria-selected="false"
          >
            Jogador
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link "
            id="admin-tab"
            data-bs-toggle="tab"
            data-bs-target="#admin"
            type="button"
            role="tab"
            aria-controls="admin"
            aria-selected="true"
          >
            Administrador
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="player-tab"
            data-bs-toggle="tab"
            data-bs-target="#user"
            type="button"
            role="tab"
            aria-controls="user"
            aria-selected="false"
            disabled
          >
            Usuário
          </button>
        </li>
      </ul>
      <div className="tab-content" id="myTabContent">
        <div className="tab-pane fade " id="admin" role="tabpanel" aria-labelledby="admin-tab">
          <div className="container-fluid mt-3">
            <h2>Administrador</h2>
            <div className="d-flex flex-wrap mt-1" id="admin-panel">
              <ListGroups allGroups={allGroups} setAllGroups={setAllGroups} setGroupsChange={setGroupsChange} groupsChange={groupsChange} />
              <ListMatches allGroups={allGroups} />
            </div>
            <ListRequests requestsChange={requestsChange} setRequestsChange={setRequestsChange} />
          </div>
        </div>
        <div className="tab-pane fade show active" id="player" role="tabpanel" aria-labelledby="player-tab">
          <div className="container-fluid mt-3">
            <h2>Jogador</h2>
            <div className="d-flex flex-wrap mt-1" id="user-panel">
              <ListUserMatches />
              <ListUserGroups />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;
