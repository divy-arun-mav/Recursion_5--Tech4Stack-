import React from 'react';
import gif1 from '../assets/revenue.gif';

const Home = () => {
    return (
        <>
            <div className="container-home">
                <img src={gif1} alt="gif" className='gif1' srcset="" />
                <p>txtxtxt</p>
            </div>
            <style>
                {`
                *{
                    margin:0;
                    padding:0;
                }
                .container-home{
                    margin-top:100px;
                    display:flex;
                    justify-content:center;
                    align-items:center;
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