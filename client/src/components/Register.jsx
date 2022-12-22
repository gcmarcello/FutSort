import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "react-toastify/dist/ReactToastify.css";

const Register = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const captchaComponent = useRef();

  const { email, password, name } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Comment
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
      <h1 className="my-3 text-center">Registro</h1>
      <div
        className="row justify-content-center"
        style={{ "--bs-gutter-x": "0" }}
      >
        <div className="container d-flex justify-content-center">
          <div className="bg-light shadow bg-gradient rounded p-4 ">
            <form onSubmit={onSubmitForm}>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Nome de Usuário"
                className="form-control"
                value={name}
                onChange={(e) => onChange(e)}
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="form-control my-3"
                value={email}
                onChange={(e) => onChange(e)}
              />
              <input
                type="password"
                name="password"
                id="password"
                className="form-control my-3"
                placeholder="Senha"
                value={password}
                onChange={(e) => onChange(e)}
              />
              <HCaptcha
                ref={captchaComponent}
                sitekey={process.env.REACT_APP_HCAPTCHA_KEY}
                onVerify={(captchaToken) => setCaptchaToken(captchaToken)}
                onExpire={(e) => setCaptchaToken("")}
              />
              <button
                className="btn btn-block btn-success form-control"
                disabled={submitButton}
              >
                Registrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Register;
