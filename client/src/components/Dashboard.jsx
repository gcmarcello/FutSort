import React, { Fragment, useState } from "react";

// Dashboard Components
import ListGroups from "./groups/listGroups";
import ListMatches from "./matches/listMatches";
import ListRequests from "./requests/listRequests";

const Dashboard = ({ allGroups, setAllGroups }) => {
  const [groupsChange, setGroupsChange] = useState(false);

  return (
    <Fragment>
      <div className="container-fluid d-flex flex-wrap mt-3">
        <ListGroups allGroups={allGroups} setAllGroups={setAllGroups} setGroupsChange={setGroupsChange} groupsChange={groupsChange} />
        <ListMatches allGroups={allGroups} />
      </div>
      <div className="container-fluid d-flex flex-wrap ">
        <ListRequests />
      </div>
    </Fragment>
  );
};

export default Dashboard;
