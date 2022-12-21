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
import Loading from "./components/utils/Loading";
import NavBar from "./components/utils/navbar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line
  const [name, setName] = useState("");
  const [allGroups, setAllGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuth = async () => {
    setIsLoading(true);
    if (localStorage.token) {
      try {
        setIsLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("token", localStorage.token);
        const response = await fetch("/api/auth/authentication", {
          method: "GET",
          headers: myHeaders,
        });
        const parseRes = await response.json();
        parseRes === true
          ? setIsAuthenticated(true)
          : setIsAuthenticated(false);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      setIsAuthenticated(false);
    }
    /* console.log(isAuthenticated); */
    setIsLoading(false);
  };

  /* const getProfile = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("token", localStorage.token);

      const res = await fetch("/api/auth/getprofile", {
        method: "GET",
        headers: myHeaders,
      });

      const parseData = await res.json();
      setAllGroups(parseData);
    } catch (err) {
      console.log(err.message);
    }
  }; */

  useEffect(() => {
    isAuth();
    /* getProfile(); */
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      <NavBar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        name={name}
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
              element={
                isAuthenticated ? (
                  <Dashboard
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                ) : (
                  <Register />
                )
              }
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
                    allGroups={allGroups}
                    setAllGroups={setAllGroups}
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
                  <ViewMatch />
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
