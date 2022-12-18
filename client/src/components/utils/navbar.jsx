import React, { Fragment } from "react";

const NavBar = ({ pageName, isAuthenticated, setIsAuthenticated }) => {
  const logout = async (e) => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      e.preventDefault();
      try {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        window.location = "/dashboard";
      } catch (err) {
        console.error(err.message);
      }
    }
  };
  return (
    <Fragment>
      <nav
        className="navbar sticky-top navbar-expand-lg navbar-dark bg-success"
        aria-label="Offcanvas navbar large"
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/dashboard">
            {`FutSort`}
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
          <div
            className="offcanvas offcanvas-end text-bg-dark"
            tabIndex="-1"
            id="offcanvasNavbar2"
            aria-labelledby="offcanvasNavbar2Label"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbar2Label">
                Menu Principal
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              {isAuthenticated ? (
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                  <li className="nav-item">
                    <a
                      className="btn btn-outline-light me-3"
                      aria-current="page"
                      href="/dashboard"
                    >
                      <i className="bi bi-house-door"></i> Painel
                    </a>
                  </li>
                  <li>
                    <button
                      className="btn btn-danger "
                      onClick={(e) => logout(e)}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              ) : (
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                  <li>
                    <a className="btn btn-light " href="/dashboard">
                      Login
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
