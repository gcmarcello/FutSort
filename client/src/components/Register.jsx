import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "react-toastify/dist/ReactToastify.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

const Register = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    upperCaseLetter: false,
    lowerCaseLetter: false,
    number: false,
    length: false,
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const { name, email, password, confirmPassword } = inputs;
  const captchaComponent = useRef();
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const displayPasswordRequirements = (criteria) => {
    return criteria ? "text-success" : "text-danger";
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>
        <h6 className="">A senha precisa conter:</h6>
        <ul className="list-group">
          <li className={`fw-semibold list-group-item ${displayPasswordRequirements(passwordRequirements.upperCaseLetter)} mx-1`}>
            1 Letra maiúscula - A-Z
          </li>
          <li className={`fw-semibold list-group-item ${displayPasswordRequirements(passwordRequirements.lowerCaseLetter)} mx-1`}>
            1 Letra minúscula - a-z
          </li>
          <li className={`fw-semibold list-group-item ${displayPasswordRequirements(passwordRequirements.number)} mx-1`}>1 Número - 0-9</li>
          <li className={`fw-semibold list-group-item ${displayPasswordRequirements(passwordRequirements.length)} mx-1`}>8 caracteres</li>
        </ul>
      </Popover.Body>
    </Popover>
  );

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

  useEffect(() => {
    setPasswordRequirements({
      ...passwordRequirements,
      upperCaseLetter: /^(?=.*[A-Z]).*$/.test(password),
      lowerCaseLetter: /^(?=.*[a-z]).*$/.test(password),
      number: /^(?=.*[0-9]).*$/.test(password),
      length: /^.{8,}$/.test(password),
    });
    // eslint-disable-next-line
  }, [password]);

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
                <OverlayTrigger trigger="hover" placement="bottom" overlay={popover}>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-control my-3"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => handleChange(e)}
                  />
                </OverlayTrigger>

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

              <HCaptcha
                ref={captchaComponent}
                sitekey={process.env.REACT_APP_HCAPTCHA_KEY}
                onVerify={(captchaToken) => setCaptchaToken(captchaToken)}
                onExpire={(e) => setCaptchaToken("")}
                className="form-control"
              />
              <button className="btn btn-block btn-success form-control" disabled={submitButton}>
                Registrar
              </button>
            </form>
            <Link to="/dashboard">Login</Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Register;
