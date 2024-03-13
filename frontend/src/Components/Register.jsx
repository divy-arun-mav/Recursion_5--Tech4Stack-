import React, { useEffect, useState } from 'react'
import svg1 from '../assets/mobile-register.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './store/auth';

const Register = () => {

    const { storeTokenInLS } = useAuth();
    const navigate = useNavigate();
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [mail, setMail] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!username || !password || !mail) {
            return alert("All Fields Are Required!!!");
        }


        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: mail,
                }),
            });

            if (response.status === 200) {
                const res_data = await response.json();
                console.log("response from server ", res_data);
                storeTokenInLS(res_data.token);
                alert("Registration Successfull !!!");
                navigate("/login");
            } else {
                console.log(response);
            }
        }
        catch (error) {
            alert(error);
        }
    }

    return (
        <>
            <div className="container col-3 d-flex" style={{ marginTop: "8%", border: "0px solid grey", borderRadius: "20px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                <img src={svg1} style={{ width: "40vw" }} />
                <form id="registerForm" onSubmit={handleSubmit}>
                    <h2 className='text-center'>Register</h2>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example1">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            class="form-control" />
                    </div>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example1">Email address</label>
                        <input type="text"
                            name="email"
                            id="email"
                            placeholder="Email"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            class="form-control"
                            required />
                    </div>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example2">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            class="form-control" />
                    </div>

                    <button type="submit" class="btn btn-primary btn-block mb-4">Sign in</button>
                </form>
            </div>
            <style>{`
            .container{
                width:100%;
                height:auto;
                min-height:10vh;
                justify-content:space-evenly;
                align-items:center;
            }
            `}</style>
        </>
    )
}

export default Register