import { useState } from "react";
import { useNavigate } from "react-router-dom";
import fetchWrapper from "../utils/fetchWrapper";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your Signup logic here
    fetchWrapper("/signup", "", "POST", {
      org_name: username,
      password: password,
    }).then((res) => {
      if (res.token) {
        localStorage.setItem("N2M-token", res.token);
        navigate("/dashboard");
      }
    });
  };

  return (
    <div className="Main">
      <div className="AuthContainer">
        <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Org Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
