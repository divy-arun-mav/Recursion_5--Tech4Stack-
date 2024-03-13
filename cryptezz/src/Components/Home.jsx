import React from 'react';
import gif1 from '../assets/revenue.gif';
import bgImg from '../assets/xchangehomepage.png';

const Home = () => {
    return (
        <>
            <div className="container-home">
                {/* <img src={gif1} alt="gif" className='gif1' srcset="" />
                <p>txtxtxt</p> */}
                <img src={bgImg} className='bgImg' alt="" srcset="" />
            </div>
            <style>
                {`
                *{
                    margin:0;
                    padding:0;
                }
                .container-home{
                    margin-top:0px;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                }
                .bgImg{
                    width:80%;
                }
                .gif1{
                    width:40vw;
                }
                `}
            </style>
        </>
    )
}

export default Home