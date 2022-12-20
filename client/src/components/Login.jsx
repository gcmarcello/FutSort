import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setIsAuthenticated }) => {
  const [inputs, setInputs] = useState({
    name: "",
    password: "",
  });
  const { name, password } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

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
        <div className="container-sm bg-light shadow-sm bg-gradient p-5 my-3 rounded">
          <form onSubmit={onSubmitForm} action="#">
            <label htmlFor="name">Nome de Usuário</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Usuário"
              className="form-control form-control-lg mb-3"
              value={name}
              onChange={(e) => onChange(e)}
            />
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Senha"
              className="form-control form-control-lg mb-3"
              value={password}
              onChange={(e) => onChange(e)}
            />
            <input
              type="submit"
              className="form-control btn btn-success"
              value={"Enviar"}
            />
            <br />
            <Link to="/register">Register</Link>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
