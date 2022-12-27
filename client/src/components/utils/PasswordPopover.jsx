import React, { useState, useEffect } from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

const PasswordPopover = ({ password, handleChange }) => {
  const [passwordRequirements, setPasswordRequirements] = useState({
    upperCaseLetter: false,
    lowerCaseLetter: false,
    number: false,
    length: false,
  });

  const displayPasswordRequirements = (criteria) => {
    return criteria ? "text-success" : "text-danger";
  };

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

  return (
    <OverlayTrigger trigger="focus" placement="bottom" overlay={popover}>
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
  );
};

export default PasswordPopover;
