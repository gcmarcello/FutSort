// Package Components
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Components
import Loading from "./utils/Loading";
import PasswordPopover from "./utils/PasswordPopover";
import Captcha from "./utils/Captcha";

const PasswordReset = ({ setIsAuthenticated }) => {
  let { requestId } = useParams();
  const [inputs, setInputs] = useState({
    password: "",
    confirmPassword: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  const [userId, setUserId] = useState("");
  const { password, confirmPassword } = inputs;
  const captchaComponent = useRef();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/password/review/${requestId}`, {
          method: "GET",
          headers: { "Content-type": "application/json" },
        });
        const parseRes = await response.json();
        setRequestStatus(parseRes);
        setUserId(parseRes.reset_user_id);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchRequest();
  }, [requestId]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Por favor, verifique o Captcha.", { theme: "colored" });
      return;
    }

    try {
      const body = { captchaToken, password, userId, requestId };
      const response = await fetch("/api/password/update", {
        method: "PUT",
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

  if (requestStatus === null) {
    return <Loading />;
  }

  if (typeof requestStatus === "string") {
    return <Navigate to="/dashboard" element={toast.error(`${requestStatus}`, { theme: "colored" })} />;
  }

  return (
    <Fragment>
      <h1 className="mt-3 mb-1 text-center">Redefinir Senha</h1>
      <div className="row justify-content-center" style={{ "--bs-gutter-x": "0" }}>
        <div className="container d-flex justify-content-center">
          <div className="bg-light shadow bg-gradient rounded p-4 ">
            <form onSubmit={onSubmitForm}>
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
                    placeholder="Confirmar Nova Senha"
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
                Alterar Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default PasswordReset;
