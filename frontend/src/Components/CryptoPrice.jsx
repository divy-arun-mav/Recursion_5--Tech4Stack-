import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Coins from './store/tokenList.json';
import { useAuth } from './store/auth';
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";

const CryptoPrice = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [coinData, setCoinData] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [price, setPrice] = useState('');

    const NotfiyUser = async (title, body) => {
        const res = fetch(`http://localhost:8000/sendNotification/${user.ntoken}/${title}/${body}`, {
            method: "GET"
        })
    }


    const checkPrice = async () => {
        const coins = Coins;
        coins.forEach(async (coin) => {
            const data = await getCoinList(coin);
            if (user.tokenName === data.id) {
                if (user.thresholdValue < data.priceInr) {
                    let drop = data.priceInr - user.thresholdValue;
                    if (drop >= user.notificationThreshold) {
                        NotfiyUser(`Drop in price of ${coin}`, `${coin}'s price drops by  ₹${drop}`);
                    }
                    user.thresholdValue = data.priceInr;
                    console.log("notify user");
                } else if (user.thresholdValue > data.priceInr) {
                    let drop = user.thresholdValue - data.priceInr;
                    if (drop >= user.notificationThreshold) {
                        NotfiyUser(`Increase in price of ${coin}`, `${coin}'s price increases by  ₹${drop}`);
                    }
                    user.thresholdValue = data.priceInr;
                    console.log("notify user");
                }
            }
            console.log(data);
        });
    };


    useEffect(() => {
        checkPrice();
        const intervalId = setInterval(() => {
            checkPrice();
        }, 15 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);


    const setToken = async () => {
        console.log(selectedCoin.id, price, user.email);
        try {
            const response = await fetch(`http://localhost:8000/setToken/${user.email}`, {
                method: 'PUT',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    tokenName: selectedCoin.id,
                    thresholdValue: price
                }),
            });
            console.log(selectedCoin.id);
            if (response.status === 200) {
                const res_data = await response.json();
                console.log(res_data);
                alert("StopLoss value set");
            } else {
                alert("Error setting stoploss");
            }
        } catch (error) {
            console.error("Error setting stoploss:", error);
            alert("Error setting stoploss");
        }
    };

    const getCoinList = useCallback(async (coin) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin.id}`;
        const apiKey = 'CG-FNFFa7JE39x9DRveFTroVzaa';

        const options = {
            headers: {
                'x-cg-demo-api-key': apiKey,
            },
        };

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                console.error(`Error fetching data for ${coin.id}: ${response.status}`);
                return null;
            }
            const data = await response.json();
            console.log("RES: ", data)
            // console.log(coin.id);
            return {
                id: coin.id,
                name: data.name,
                symbol: data.symbol.toUpperCase(),
                priceInr: data.market_data.ath.inr,
                price: data.market_data.ath.usd,
                img: coin.img,
                priceHistory: data.market_data.price_usd,
            };
        } catch (error) {
            console.error(`Error fetching data for ${coin.id}: ${error}`);
            return null;
        }
    }, []);

    const handleCoinSelection = (coin) => {
        setSelectedCoin(coin);
        getCoinList(coin);
    };

    const fetchCoinData = async () => {
        const coins = Coins;

        const coinDataArray = await Promise.all(
            coins.map(async (coin) => {
                const data = await getCoinList(coin);
                return data;
            })
        );

        setCoinData(coinDataArray.filter((data) => data !== null));
    };

    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
        navigate(`/chart/${coin.id}`);
    };

    useEffect(() => {
        fetchCoinData();
    }, []);

    const chartData = [
        ['Time', `${selectedCoin?.name} Price (USD)`],
        ...selectedCoin?.priceHistory?.map((entry) => [entry[0], entry[1]]) || [],
    ];

    return (
        <>
            <div className="container">
                <form>
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle mb-2" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {selectedCoin ? selectedCoin.name : 'Select your coin'}
                        </button>
                        <div className="d-flex fw-bolder">
                            <label htmlFor="input">Current token price:</label>
                            {selectedCoin && selectedCoin.priceInr !== null ? (
                                <p style={{ marginLeft: "10px" }}>{selectedCoin.priceInr}</p>
                            ) : (
                                <p style={{ marginLeft: "10px" }}>Select a coin to see the current price.</p>
                            )}
                        </div>

                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {coinData.map((coin, index) => (
                                <div key={index} className="dropdown-item" onClick={() => handleCoinSelection(coin)}>
                                    {coin.img && (
                                        <img src={coin.img} alt="logo" style={{ width: '30px', height: 'auto', marginRight: '5px' }} />
                                    )}
                                    {coin.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    {selectedCoin && (
                        <>
                            <div className='d-flex'>
                                {/* <label htmlFor="input" style={{ marginTop: "10px" }}>Enter your token price: </label>
                                <input style={{ marginLeft: "50px" }} type="text" name="" id="input" value={price} onChange={(e) => setPrice(e.target.value)} />
                                <button type="button" className="btn btn-primary"
                                    style={{
                                        marginLeft: "50px"
                                    }}
                                >set stoploss</button> */}

                                <div className="input-group mb-3">
                                    <input style={{ border: "2px solid black" }} type="text" className="form-control" placeholder="Enter Threshold Value You Want" aria-label="Recipient's username" aria-describedby="basic-addon2" value={price} onChange={(e) => setPrice(e.target.value)} />
                                    <span className="input-group-text btn btn-outline-success fw-bold" id="basic-addon2" onClick={() => {
                                        setToken()
                                    }}>Set StopLoss</span>
                                </div>
                            </div>
                            <br />
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Logo</th>
                                        <th>Name</th>
                                        <th>Symbol</th>
                                        <th>Price (USD)</th>
                                        <th>Price (INR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coinData.map((coin, index) => (
                                        <tr key={index} onClick={() => handleCoinClick(coin)}>
                                            <td>
                                                {coin.img && (
                                                    <img src={coin.img} alt='logo' style={{ width: '50px', height: 'auto' }} />
                                                )}
                                            </td>
                                            <td>{coin.name}</td>
                                            <td>{coin.symbol}</td>
                                            <td>{coin.price}</td>
                                            <td>{coin.priceInr}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                </form>
                {/* Rest of your component */}
            </div>
            <style>{`
        .container {
          margin-top: 200px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .chart-container {
          margin-top: 20px;
        }
      `}</style>
        </>
    );
};

export default CryptoPrice;
