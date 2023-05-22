// Package Components
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Components
import Captcha from "./utils/Captcha";
import PasswordPopover from "./utils/PasswordPopover";

const Register = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const { name, email, password, confirmPassword } = inputs;
  const captchaComponent = useRef();

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Por favor, verifique o Captcha.", { theme: "colored" });
      return;
    }
    const body = { captchaToken, email, name, password };
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();
      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);

        setIsAuthenticated(true);
        toast.success("Login efetuado!", { theme: "colored" });
      } else {
        setIsAuthenticated(false);
        captchaComponent.current.resetCaptcha();
        setCaptchaToken("");
        toast.error(parseRes, { theme: "colored" });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (captchaToken) {
      setSubmitButton(false);
    } else {
      setSubmitButton(true);
    }
  }, [captchaToken]);

  return (
    <Fragment>
      <h1 className="mt-3 mb-1 text-center">Registro</h1>
      <div className="row justify-content-center" style={{ "--bs-gutter-x": "0" }}>
        <div className="container d-flex justify-content-center">
          <div className="bg-light shadow bg-gradient rounded p-4 ">
            <form onSubmit={onSubmitForm}>
              <div>
                <h5>Dados</h5>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Nome de Usuário"
                  className="form-control"
                  value={name}
                  onChange={(e) => handleChange(e)}
                />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  className="form-control my-3"
                  value={email}
                  onChange={(e) => handleChange(e)}
                />
              </div>
              <div>
                <PasswordPopover password={password} handleChange={handleChange} />

                <div className="input-group mb-3">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirm-password"
                    className={`form-control ${password === "" ? `bg-white` : confirmPassword === password ? `bg-success` : `bg-danger`}`}
                    style={{ "--bs-bg-opacity": ".1" }}
                    value={confirmPassword}
                    onChange={(e) => handleChange(e)}
                    placeholder="Repetir Senha"
                    aria-label="confirm-password"
                    aria-describedby="confirm-password-status"
                  />
                  <span className="input-group-text" id="confirm-password-status">
                    <i className={`bi bi-${password === confirmPassword ? `check` : `x`}`}></i>
                  </span>
                </div>
                <hr />
              </div>

              <Captcha captchaComponent={captchaComponent} setCaptchaToken={setCaptchaToken} />
              <button className="btn btn-block btn-success form-control" disabled={submitButton}>
                Registrar
              </button>
            </form>
            <Link to="/painel">Login</Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Register;
