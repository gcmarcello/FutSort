import React, { useEffect } from "react";

const TeamPick = ({ numberOfTeams, setNumberOfTeams, teams, setTeams, step, sortingSteps }) => {
  const handleTeamChange = (e, team, key) => {
    setTeams(
      teams.map((selectedTeam) => {
        if (selectedTeam.index === team.index) {
          return { ...selectedTeam, [key]: e.target.value };
        } else {
          return selectedTeam;
        }
      })
    );
  };

  const addTeam = (index) => {
    setTeams([...teams, { name: ``, index: teams[teams.length - 1].index + 1 }]);
  };

  const removeTeam = (index, teamIndex) => {
    if (teams.length > 1) {
      setTeams(teams.filter((team) => team.index !== teamIndex));
    }
  };

  useEffect(() => {
    setNumberOfTeams(teams.length);
    // eslint-disable-next-line
  }, [teams]);

  return (
    <div className="flex-fill">
      <h3>Times: {numberOfTeams}</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={`team-name-${index}`}>
              <td style={{ padding: "0.5rem 0rem" }}>
                <div className="input-group">
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    id={`remove-team-button-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      removeTeam(index, team.index);
                    }}
                  >
                    <i className="bi bi-x-circle fw-bolder"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Time ${index + 1}`}
                    name={`team-${index}`}
                    value={team.name}
                    onChange={(e) => handleTeamChange(e, team, `name`)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex mt-3">
        <button
          className="btn btn-primary me-3"
          onClick={(e) => {
            e.preventDefault();
            addTeam(teams.length);
          }}
        >
          Adicionar Time
        </button>
      </div>
    </div>
  );
};

export default TeamPick;
