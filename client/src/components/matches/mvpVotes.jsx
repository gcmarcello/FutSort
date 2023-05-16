import React, { Fragment, useState } from "react";
import Loading from "../utils/Loading";

const MvpVotes = ({ matchStats, matchStatus, isAuthenticated }) => {
  const [votes, setVotes] = useState({
    voteGK: "",
    voteDF: "",
    voteAT: "",
  });
  const [votingCapability, setVotingCapability] = useState(false);
  const [results, setResults] = useState({ parsedGKResults: [], parsedDFResults: [], parsedATResults: [] });
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { voteGK, voteDF, voteAT } = votes;

  const evaluateVotingCapability = async () => {
    try {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/match/voting/${matchStatus[0].match_id}`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await res.json();
      setVotingCapability(parseData);
      setIsLoading(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleChange = (e) => {
    setVotes({ ...votes, [e.target.name]: e.target.value });
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(false);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      if (votes.voteAT === "" || votes.voteDF === "") {
        setError(true);
        return;
      }

      if (votes.voteGK === "" && matchStats.filter((player) => player.match_player_goalkeeper === true).length > 0) {
        setError(true);
        return;
      }

      const body = { voteGK, voteDF, voteAT };

      const parseData = await fetch(`/api/match/voting/${matchStatus[0].match_id}`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body),
      });
      const parseResponse = await parseData.json();
      evaluateVotingCapability();
      fetchResults(); //TODO - fix need for a second fetch
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch(`/api/match/results/${matchStats[0].match_id}`, {
        method: "GET",
        headers: myHeaders,
      });
      const parseData = await res.json();
      setResults(parseData);
      setIsLoading(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  useState(() => {
    evaluateVotingCapability();
    fetchResults();
  }, [matchStats]);

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      {matchStatus === "open" ? (
        <Fragment />
      ) : votingCapability && isAuthenticated ? (
        <div className="card mt-3">
          <h5 className="card-header">Melhores da Partida</h5>
          <div className="card-body">
            <form>
              <div className="card-text text-center mb-3 ">A partida foi finalizada! Vote nos melhores jogadores.</div>
              <div className="container">
                <div className="row">
                  <div className="col-12 col-lg-4 my-1">
                    <select
                      id={`votegk-input`}
                      className="form-select"
                      aria-label="Default select example"
                      name="voteGK"
                      value={voteGK}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      required
                    >
                      <option key="blankGK" defaultValue={""}>
                        Melhor Goleiro
                      </option>
                      {matchStats
                        .filter((player) => player.match_player_goalkeeper === true)
                        .map((option) => (
                          <option key={option.player_id} value={option.player_id}>
                            {option.player_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-12 col-lg-4 my-1">
                    <select
                      id={`votedf-input`}
                      className="form-select"
                      aria-label="Default select example"
                      name="voteDF"
                      value={voteDF}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      required
                    >
                      <option key="blankDF" defaultValue={""}>
                        Melhor Defensor
                      </option>
                      {matchStats.map((option) => (
                        <option key={option.player_id} value={option.player_id}>
                          {option.player_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-lg-4 my-1">
                    <select
                      id={`voteat-input`}
                      className="form-select"
                      aria-label="Default select example"
                      name="voteAT"
                      value={voteAT}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      required
                    >
                      <option key="blankAT" defaultValue={""}>
                        Melhor Atacante
                      </option>
                      {matchStats.map((option) => (
                        <option key={option.player_id} value={option.player_id}>
                          {option.player_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  {error ? (
                    <span className="alert alert-danger me-3" style={{ padding: "0.5em", marginBottom: "0" }} role="alert">
                      Voto inválido.
                    </span>
                  ) : (
                    <Fragment />
                  )}
                </div>
                <button className="btn btn-success" onClick={(e) => handleVoteSubmit(e)}>
                  Enviar Votos
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card mt-3">
          <h5 className="card-header">Melhores da Partida - Ranking</h5>
          <div className="card-body">
            <div className="container-fluid">
              <div className="row ">
                <div className="col-12 col-lg-4 my-2">
                  <h5>Melhor Goleiro</h5>
                  <ol className="list-group list-group-numbered">
                    {results.parsedGKResults.length
                      ? results.parsedGKResults.map((gk, index) => (
                          <li key={`gk-${index}`} className="list-group-item d-flex justify-content-start align-items-start">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{gk.playerName}</div>
                            </div>
                            <span className={`badge bg-${index === 0 ? `warning` : index === 1 ? `secondary` : `danger`} rounded-pill me-1`}>
                              {gk.votes}
                            </span>{" "}
                            votos
                          </li>
                        ))
                      : "Nenhum voto ainda foi computado."}
                  </ol>
                </div>
                <div className="col-12 col-lg-4 my-2">
                  <h5>Melhor Defensor</h5>
                  <ol className="list-group list-group-numbered">
                    {results.parsedDFResults.length
                      ? results.parsedDFResults.map((df, index) => (
                          <li key={`df-${index}`} className="list-group-item d-flex justify-content-start align-items-start">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{df.playerName}</div>
                            </div>
                            <span className={`badge bg-${index === 0 ? `warning` : index === 1 ? `secondary` : `danger`} rounded-pill me-1`}>
                              {df.votes}
                            </span>{" "}
                            votos
                          </li>
                        ))
                      : "Nenhum voto ainda foi computado."}
                  </ol>
                </div>
                <div className="col-12 col-lg-4 my-2">
                  <h5>Melhor Atacante</h5>
                  <ol className="list-group list-group-numbered">
                    {results.parsedATResults.length
                      ? results.parsedATResults.map((at, index) => (
                          <li key={`at-${index}`} className="list-group-item d-flex justify-content-start align-items-start">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{at.playerName}</div>
                            </div>
                            <span className={`badge bg-${index === 0 ? `warning` : index === 1 ? `secondary` : `danger`} rounded-pill me-1`}>
                              {at.votes}
                            </span>{" "}
                            votos
                          </li>
                        ))
                      : "Nenhum voto ainda foi computado."}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default MvpVotes;
