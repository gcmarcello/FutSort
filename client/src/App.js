import "./App.css";
import { Fragment, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ViewMatch from "./components/matches/viewMatch";
import EditMatch from "./components/matches/editMatch";
import Error404Page from "./components/404";
import Loading from "./components/Loading";
import NavBar from "./components/utils/navbar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuth = async () => {
    setIsLoading(true);
    if (localStorage.token) {
      try {
        setIsLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);
        const response = await fetch(
          "http://192.168.68.106:5000/auth/is-verify",
          {
            method: "GET",
            headers: myHeaders,
          }
        );
        const parseRes = await response.json();
        parseRes === true
          ? setIsAuthenticated(true)
          : setIsAuthenticated(false);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      setIsAuthenticated(false);
    }
    /* console.log(isAuthenticated); */
    setIsLoading(false);
  };

  useEffect(() => {
    isAuth();
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      <NavBar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <Fragment>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Router>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route
              exact
              path="/"
              // prettier-ignore
              element={isAuthenticated ? (<Dashboard isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>) : (<Home />)}
            />
            <Route
              exact
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              exact
              path="/viewmatch/:id"
              element={<ViewMatch isAuthenticated={isAuthenticated} />}
            />

            {/* PROTECTED ROUTES */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            <Route
              path="/editmatch/:id"
              element={
                isAuthenticated ? (
                  <EditMatch isAuthenticated={isAuthenticated} />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />

            {/* 404 */}
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </Router>
      </Fragment>
    </Fragment>
  );
}

export default App;
