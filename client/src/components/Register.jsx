import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    name: "",
  });

  const { email, password, name } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const body = { email, name, password };
    try {
      const response = await fetch("/auth/register", {
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
        toast.error(parseRes, { theme: "colored" });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Fragment>
      <h1 className="my-3 text-center">Register</h1>
      <div className="container-sm bg-light shadow-sm bg-gradient p-5 my-3 rounded">
        <form onSubmit={onSubmitForm}>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Nome de Usuário"
            className="form-control my-3"
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
          <button className="btn btn-block btn-success form-control">
            Registrar
          </button>
        </form>
        <Link to="/dashboard">Login</Link>
      </div>
    </Fragment>
  );
};

export default Register;
