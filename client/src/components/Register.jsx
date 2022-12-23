import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "react-toastify/dist/ReactToastify.css";

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

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const displayPasswordRequirements = (criteria) => {
    return criteria ? "text-success" : "text-danger";
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
      <div
        className="row justify-content-center"
        style={{ "--bs-gutter-x": "0" }}
      >
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
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control my-3"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => handleChange(e)}
                />
                <div className="input-group mb-3">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirm-password"
                    className={`form-control ${
                      password === ""
                        ? `bg-transparent`
                        : confirmPassword === password
                        ? `bg-success`
                        : `bg-danger`
                    }`}
                    style={{ "--bs-bg-opacity": ".1" }}
                    value={confirmPassword}
                    onChange={(e) => handleChange(e)}
                    placeholder="Repetir Senha"
                    aria-label="confirm-password"
                    aria-describedby="confirm-password-status"
                  />
                  <span
                    className="input-group-text"
                    id="confirm-password-status"
                  >
                    <i
                      className={`bi bi-${
                        password === confirmPassword ? `check` : `x`
                      }`}
                    ></i>
                  </span>
                </div>
                <div className="card my-3">
                  <h6 className="fw-semibold card-header">
                    A senha precisa conter:
                  </h6>
                  <div className="d-flex justify-content-evenly my-1">
                    <span
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Tooltip on top"
                      className={`fw-semibold ${displayPasswordRequirements(
                        passwordRequirements.upperCaseLetter
                      )}
                  `}
                    >
                      A-Z
                    </span>
                    <span
                      className={`fw-semibold ${displayPasswordRequirements(
                        passwordRequirements.lowerCaseLetter
                      )}
                  `}
                    >
                      a-z
                    </span>
                    <span
                      className={`fw-semibold ${displayPasswordRequirements(
                        passwordRequirements.number
                      )}
                  `}
                    >
                      0-9
                    </span>
                    <span
                      className={`fw-semibold ${displayPasswordRequirements(
                        passwordRequirements.length
                      )}
                  `}
                    >
                      8 caracteres
                    </span>
                  </div>
                </div>
              </div>

              <HCaptcha
                ref={captchaComponent}
                sitekey={process.env.REACT_APP_HCAPTCHA_KEY}
                onVerify={(captchaToken) => setCaptchaToken(captchaToken)}
                onExpire={(e) => setCaptchaToken("")}
                className="form-control"
              />
              <button
                className="btn btn-block btn-success form-control"
                disabled={submitButton}
              >
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
