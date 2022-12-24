import React, { Fragment, useState } from "react";
import { useEffect } from "react";

const NavBar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [name, setName] = useState("");

  const getProfile = async () => {
    if (localStorage.token) {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);

        const response = await fetch(`/api/auth/getprofile/`, {
          method: "GET",
          headers: myHeaders,
        });
        const parseData = await response.json();
        setName(parseData[0].user_name);
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  const logout = async (e) => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      e.preventDefault();
      try {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        window.location = "/dashboard";
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  useEffect(() => {
    getProfile();
  });

  return (
    <Fragment>
      <nav className="navbar sticky-top navbar-expand-md navbar-dark bg-success" aria-label="Offcanvas navbar large">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            {name ? `FutSort - ${name}` : `FutSort`}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar2"
            aria-controls="offcanvasNavbar2"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end text-bg-dark" tabIndex="-1" id="offcanvasNavbar2" aria-labelledby="offcanvasNavbar2Label">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbar2Label">
                Menu Principal
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              {isAuthenticated ? (
                <ul className="navbar-nav justify-content-end flex-grow-1">
                  <li className="nav-item">
                    <a className="btn btn-outline-light me-3" aria-current="page" href="/dashboard">
                      <i className="bi bi-house-door"></i> Painel
                    </a>
                  </li>
                  <li>
                    <button className="btn btn-danger " onClick={(e) => logout(e)}>
                      Logout
                    </button>
                  </li>
                </ul>
              ) : (
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 list">
                  <li className="mx-1 my-1">
                    <a className="btn btn-light " href="/dashboard">
                      Login
                    </a>
                  </li>
                  <li className="mx-1 my-1">
                    <a className="btn btn-secondary " href="/register">
                      Registrar
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>
    </Fragment>
  );
};

export default NavBar;
