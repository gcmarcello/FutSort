import React, { useState, Fragment } from "react";
import PlayerPick from "./sorting/PlayerPick";
import TeamPick from "./sorting/TeamPick";

const FastSorting = () => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(10);
  const [numberOfTeams, setNumberOfTeams] = useState(5);
  const [players, setPlayers] = useState(Array.from({ length: numberOfPlayers }, (player, index) => ({ name: ``, stars: 0, index: index })));
  const [teams, setTeams] = useState(Array.from({ length: numberOfTeams }, (team, index) => ({ name: ``, index: index })));
  const stars = Array.from({ length: 5 }, (star, index) => index);
  const [step, setStep] = useState(1);

  const sortingSteps = (i) => {
    setStep((prevState) => prevState * i);
  };

  const checkEmptyFields = () => {
    if (players.some((player) => player.name === "") === false && teams.some((team) => team.name === "") === false) {
      return false;
    } else {
      return true;
    }
  };

  const generateTeams = () => {
    const sortedPlayers = players.sort((a, b) => b.stars - a.stars);
    console.log(sortedPlayers);
    console.log(teams);
  };

  return (
    <Fragment>
      <div className="container mb-5">
        <button className="btn btn-success" onClick={() => generateTeams()} /* disabled={checkEmptyFields()} */>
          Submit
        </button>
        <form className="d-flex flex-wrap">
          <PlayerPick
            numberOfPlayers={numberOfPlayers}
            setNumberOfPlayers={setNumberOfPlayers}
            setPlayers={setPlayers}
            players={players}
            stars={stars}
            step={step}
            sortingSteps={sortingSteps}
          />
          <TeamPick
            numberOfTeams={numberOfTeams}
            setNumberOfTeams={setNumberOfTeams}
            setTeams={setTeams}
            teams={teams}
            step={step}
            sortingSteps={sortingSteps}
          />
        </form>
      </div>
    </Fragment>
  );
};

export default FastSorting;
