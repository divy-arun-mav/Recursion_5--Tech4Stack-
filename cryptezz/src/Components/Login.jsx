import React from 'react'
import svg1 from '../assets/mobile-login.svg';

const Login = () => {
    return (
        <>
            <div className="container col-3 d-flex" style={{ marginTop: "8%", border: "0px solid grey", borderRadius: "20px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
                <img src={svg1} style={{ width: "40vw" }} />
                <form>
                    <h2 className='text-center'>Login</h2>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example1">Email address</label>
                        <input type="email" id="form2Example1" class="form-control" />
                    </div>
                    <div class="form-outline mb-4">
                        <label class="form-label" for="form2Example2">Password</label>
                        <input type="password" id="form2Example2" class="form-control" />
                    </div>
                    <div class="row mb-4">
                        <div class="col">
                            <a href="#!">Forgot password?</a>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-block mb-4">Sign in</button>

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