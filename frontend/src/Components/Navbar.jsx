import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './store/auth';

export default function Navbar() {
  const { isLoggedIn, LogoutUser,address } = useAuth();
  const ans = localStorage.getItem("token");
  // const address = localStorage.getItem("add");
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    LogoutUser();
  }

  return (
    <>
      <div className="nav-cont">
        <nav style={{ maxWidth: "100%" }} className="navbar navbar-expand-lg">
          <div className="container-fluid">
            <Link className="navbar-brand fs-4 fw-bolder" style={{ color: "purple" }} to='/'>
              <p><b>X</b>change</p>
            </Link>
            <button className="navbar-toggler" style={{ "border": "2px solid black" }} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon "></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto mb-lg-0 fs-5 fw-normal">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to='/'>Home</Link>
                </li>
              </ul>
              <form className="d-flex fs-6 fw-medium ms-auto navbar-nav">
                {ans ? <>
                  {/* <> <button className="btn btn-outline-success ms-2 fw-semibold" type="submit" onClick={LogoutUser} style={{ maxHeight: "min-content" }} >{address.slice(0, 4) + "..." + address.slice(38)}</button> */}
                  <> <button className="btn btn-outline-success ms-2 fw-semibold" type="submit" onClick={LogoutUser} style={{ maxHeight: "min-content" }} >{address ? address.slice(0, 4) + "..." + address.slice(38) : ""}</button>

                  </>
                </> :
                  <> <button className="btn btn-outline-primary ms-2 fw-semibold" type="submit" style={{ maxHeight: "min-content" }} onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-outline-success ms-2 fw-semibold" type="submit" style={{ maxHeight: "min-content" }} onClick={() => navigate('/register')}>SignUp</button></>
                }
              </form>
            </div>
          </div>
        </nav>
      </div>
      <style>{`
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: 'Poppins', sans-serif;
                }
                a:hover, a {
                  text-decoration: none;
                }
                body {
                  width: 100%;
                  overflow-x: hidden;
                  z-index: 10;
                }
                .btn-txt-grp p{
                  margin: auto 0 !important;
                  cursor: auto !important;
                  font-size: 18px !important;
                  font-weight: 600 !important;
                  color: #1d46ff !important;
                }
                nav {
                  margin: 10px 10px 0 10px;
                  background: none;
                  width: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .nav-cont {
                  width: max-content;
                  min-width: 95%;
                  background: rgba(255, 255, 255, 0.26);
                  border-radius: 50px;
                  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                  backdrop-filter: blur(9.6px);
                  margin: 10px 20px 0 20px;
                  -webkit-backdrop-filter: blur(9.6px);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  position: fixed;
                  top: 0;
                  left: 0;
                  z-index: 100;
                }
                .logo {
                  width: 30vw;
                  max-width: 200px;
                  margin-left: 10px;
                }
                li {
                  margin-inline: 10px;
                }
                .nav-item select {
                  margin-top: 10px;
                }
                .navbar-toggler {
                  position: absolute;
                  top: 5px;
                  right: 2%;
                  max-width: 55px;
                }
                .btn-txt-grp {
                  display: flex;
                  justify-content: center;
                  align-items: baseline;
                }
                @media screen and (max-width: 992px) {
                  .btn-txt-grp {
                    flex-direction: column;
                  }
                }
                @media screen and (max-width: 650px) {
                  nav {
                    max-width: 80%;
                    flex-direction: column;
                  }
                  .nav-cont {
                    width: 10vw;
                  }
                }
              `}
      </style>
    </>
  );
}
