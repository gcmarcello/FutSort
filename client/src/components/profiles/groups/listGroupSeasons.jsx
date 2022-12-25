import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ListSeasons = () => {
  const { id } = useParams();
  const [seasons, setSeasons] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);

  const getSeasons = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/season/listseasons/${id}`, {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();
      setSeasons(parseData.parsedSeasons);
      setPlayerSeasons(parseData.parsedPlayerSeasons);
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    getSeasons();
  }, []);

  return (
    <Fragment>
      <div className="card flex-fill mx-1 my-1">
        <h4 className="card-header">Últimas Temporadas</h4>
        <div className="accordion" id="accordionSeasons">
          {seasons.map((season) => (
            <div key={`key-${season}`} className="accordion-item">
              <h2 className="accordion-header" id={`heading-${season}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${season}`}
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  {`Temporada ${season}`}
                </button>
              </h2>
              <div
                id={`collapse-${season}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading-${season}`}
                data-bs-parent="#accordionSeasons"
              >
                <div className="accordion-body">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>Jogador</th>
                        <th>Gols</th>
                        <th>Assists</th>
                        <th>Partidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerSeasons
                        .filter((player) => player.season_year === season)
                        .map((player) => (
                          <tr key={`season-player-${player.season_player_id}`}>
                            <td>{player.season_player_name}</td>
                            <td>{player.season_goals}</td>
                            <td>{player.season_assists}</td>
                            <td>{player.season_matches}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default ListSeasons;
