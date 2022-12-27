import React, { Fragment } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const Captcha = ({ captchaComponent, setCaptchaToken }) => {
  return (
    <Fragment>
      <HCaptcha
        ref={captchaComponent}
        sitekey={process.env.NODE_ENV === "production" ? process.env.REACT_APP_HCAPTCHA_KEY : "10000000-ffff-ffff-ffff-000000000001"}
        onVerify={(captchaToken) => setCaptchaToken(captchaToken)}
        onExpire={(e) => setCaptchaToken("")}
        className="form-control"
      />
    </Fragment>
  );
};

export default Captcha;
