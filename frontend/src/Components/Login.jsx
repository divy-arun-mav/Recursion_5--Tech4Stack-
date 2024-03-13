import React, { useEffect, useState } from 'react'
import { useAuth } from './store/auth'
import { useNavigate } from 'react-router-dom';
import mobLogin from "../assets/mobile-login.svg";

const Login = () => {
    const {storeTokenInLS,connectWallet} = useAuth();
    const [password,setPassword] = useState('');
    const [mail,setMail] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !mail) {
            return alert("All Fields are Required!!!");
        }

        try {
            const response = await fetch(`http://localhost:8000/login`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: mail,
                    password: password,
                }),
            });

            if (response.status === 200) {
                const res_data = await response.json();
                storeTokenInLS(res_data.token);
                localStorage.setItem("USER", JSON.stringify(res_data.user));
                window.alert("Login Successful");
                connectWallet();
                navigate('/');
            } else {
                return alert("Invalid Credentials!!!");
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    return (
        <>
            <div className="container col-3 d-flex" style={{ marginTop: "8%", border: "0px solid grey", borderRadius: "20px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                <img src={mobLogin} style={{ width: "40vw" }} alt="" srcset="" />
                <form>
                    <h2 className='text-center'>Login</h2>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example1">Email address</label>
                        <input type="email" id="form2Example1" class="form-control" value={mail} onChange={(e)=>setMail(e.target.value)}/>
                    </div>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example2">Password</label>
                        <input type="password" id="form2Example2" class="form-control" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    </div>
                    <div class="row mb-4">
                        <div class="col d-flex justify-content-center">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="form2Example31" />
                                <label class="form-check-label" for="form2Example31"> Remember me </label>
                            </div>
                        </div>

                        <div class="col">
                            <a href="#!">Forgot password?</a>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-block mb-4" onClick={handleSubmit}>Sign in</button>

                    <div class="text-center">
                        <p>Not a member? <a href="#!">Register</a></p>
                    </div>
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

export default Login