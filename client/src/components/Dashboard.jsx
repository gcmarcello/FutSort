import React, { Fragment, useState, useEffect } from "react";

// Dashboard Components
import ListGroups from "./groups/listGroups";
import ListMatches from "./matches/listMatches";

const Dashboard = () => {
  // eslint-disable-next-line
  const [name, setName] = useState("");
  const [allGroups, setAllGroups] = useState([]);
  // eslint-disable-next-line
  const [groupsChange, setGroupsChange] = useState(false);

  const getProfile = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch("http://192.168.68.106:5000/dashboard/", {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();
      setAllGroups(parseData);
      setName(parseData[0].user_name);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getProfile();
    setGroupsChange(false);
  }, []);

  return (
    <Fragment>
      <div className="container-fluid mb-5">
        <div className="container d-flex justify-content-between my-1">
          {/* <h1>Painel de Controle - {name}</h1> */}
        </div>
        <div className="container d-flex flex-wrap mb-3 ">
          <ListGroups allGroups={allGroups} setGroupsChange={setGroupsChange} />
          <ListMatches
            allGroups={allGroups}
            setGroupsChange={setGroupsChange}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;
