import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RequestPasswordReset from "./RequestPasswordReset";

const Login = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    name: "",
    password: "",
  });
  const { name, password } = inputs;
  const [submitButton, setSubmitButton] = useState(true);
  const [togglePasswordReset, setTogglePasswordReset] = useState(false);

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const toggleResetForm = () => {
    togglePasswordReset ? setTogglePasswordReset(false) : setTogglePasswordReset(true);
  };

  useEffect(() => {
    if (name && password) {
      setSubmitButton(false);
    } else {
      setSubmitButton(true);
    }
  }, [name, password]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { name, password };
      const response = await fetch("/api/auth/login", {
        method: "POST",
        mode: "cors",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        toast.success("Login efetuado!", { theme: "colored" });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        toast.error(parseRes, { theme: "colored" });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Fragment>
      <div>
        <h1 className="my-3 text-center">Login</h1>
        <div className="row justify-content-center" style={{ "--bs-gutter-x": "0" }}>
          <div className="container d-flex justify-content-center">
            <div className="bg-light shadow bg-gradient rounded p-4 m-3">
              {togglePasswordReset ? (
                <RequestPasswordReset setTogglePasswordReset={setTogglePasswordReset} />
              ) : (
                <Fragment>
                  <form onSubmit={onSubmitForm} action="#">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Usuário"
                      className="form-control form-control-lg mb-3"
                      value={name}
                      onChange={(e) => onChange(e)}
                    />

                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Senha"
                      className="form-control form-control-lg mb-3"
                      value={password}
                      onChange={(e) => onChange(e)}
                    />
                    <hr />
                    <div className="d-flex">
                      <a role="button" className="form-control btn btn-secondary mx-1" href="/register">
                        Registre-se
                      </a>
                      <input type="submit" className="form-control btn btn-success mx-1" value={"Login"} disabled={submitButton} />
                    </div>
                  </form>
                  <button type="link" className="btn btn-link text-secondary link-button" style={{ padding: "0.25em" }} onClick={toggleResetForm}>
                    Esqueci a Senha
                  </button>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
