import React, { Fragment, useState } from "react";

// Dashboard Components
import ListGroups from "./groups/listGroups";
import ListMatches from "./matches/listMatches";
import ListUserMatches from "./profiles/users/listUserMatches";
import ListRequests from "./requests/listRequests";

const Dashboard = ({ allGroups, setAllGroups }) => {
  const [groupsChange, setGroupsChange] = useState(false);
  const [requestsChange, setRequestsChange] = useState(false);

  return (
    <Fragment>
      <div className="container-fluid mt-3">
        <h2>Administrador</h2>
        <div className="d-flex flex-wrap mt-1" id="admin-panel">
          <ListGroups allGroups={allGroups} setAllGroups={setAllGroups} setGroupsChange={setGroupsChange} groupsChange={groupsChange} />
          <ListMatches allGroups={allGroups} />
          <ListRequests requestsChange={requestsChange} setRequestsChange={setRequestsChange} />
        </div>
      </div>

      <div className="container-fluid mt-3">
        <h2>Jogador</h2>
        <div className="d-flex flex-wrap mt-1" id="user-panel">
          <ListUserMatches />
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;
