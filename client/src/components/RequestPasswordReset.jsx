// Package Components
import React, { Fragment, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Components
import Captcha from "./utils/Captcha";
import Loading from "./utils/Loading";

const PasswordReset = ({ setTogglePasswordReset }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const captchaComponent = useRef();

  const onSubmitForm = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Por favor, verifique o Captcha.", { theme: "colored" });
      return;
    }
    try {
      const body = { userEmail, captchaToken };
      const response = await fetch("/api/password/request", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();
      setIsLoading(false);
      parseRes.type === "success" ? toast.success(parseRes.message, { theme: "colored" }) : toast.error(parseRes.message, { theme: "colored" });
      setTogglePasswordReset(false);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Fragment>
      <form onSubmit={onSubmitForm}>
        <div className="text-break mb-3">
          Digite o email da sua conta abaixo.
          <br /> Mandaremos uma mensagem com as
          <br className="d-none d-sm-block d-md-block" /> instruções para redefinir sua senha.
        </div>
        <input
          type="email"
          name="email"
          id="email-pw-recovery"
          className="form-control mb-3"
          placeholder="Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <hr />
        <Captcha captchaComponent={captchaComponent} setCaptchaToken={setCaptchaToken} />
        <button className="btn btn-block btn-success form-control mt-1" disabled={submitButton}>
          Enviar
        </button>
      </form>
    </Fragment>
  );
};

export default PasswordReset;
