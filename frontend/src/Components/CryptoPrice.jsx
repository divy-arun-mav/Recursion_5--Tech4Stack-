import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'react-google-charts';
import Coins from './store/tokenList.json';
import { useAuth } from './store/auth';

const CryptoPrice = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [coinData, setCoinData] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [price, setPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);

    const setToken = async () => {
        console.log(selectedCoin.id, price, user.email);
        try {
            const response = await fetch(`http://localhost:8000/setToken/${user.email}`, {
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    tokenName: selectedCoin.id,
                    thresholdValue: price
                }),
            });
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
            console.log(coin.id);
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
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {selectedCoin ? selectedCoin.name : 'Select your coin'}
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {coinData.map((coin, index) => (
                                <div key={index} className="dropdown-item" onClick={() => handleCoinSelection(coin)}>
                                    {coin.img && (
                                        <img src={coin.img} alt={`${coin.name} logo`} style={{ width: '30px', height: 'auto', marginRight: '5px' }} />
                                    )}
                                    {coin.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    {selectedCoin && (
                        <>
                            <label htmlFor="input" style={{ marginTop: "10px" }}>Enter your token price: </label>
                            <input style={{ marginLeft: "50px" }} type="text" name="" id="input" value={price} onChange={(e) => setPrice(e.target.value)} />
                            <br />
                            <div className='d-flex' style={{ alignItems: "center" }}>
                                <label htmlFor="input" style={{ marginTop: "10px" }}>Current token price:</label>
                                <p style={{ marginLeft: "70px" }}>{selectedCoin.priceInr !== null ? selectedCoin.priceInr : 'Select a coin to see the current price.'}</p>
                                <button type="button" class="btn btn-primary"
                                    style={{
                                        marginLeft: "50px"
                                    }}
                                    onClick={() => {
                                        setToken()
                                    }}>set stoploss</button>
                            </div>
                        </>
                    )}
                </form>
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
                                        <img src={coin.img} alt={`${coin.name} logo`} style={{ width: '50px', height: 'auto' }} />
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
                {selectedCoin && (
                    <div className="chart-container">
                        {/* <Chart
                            chartType="LineChart"
                            width="100%"
                            height="300px"
                            data={chartData}
                            options={{
                                hAxis: {
                                    title: 'Time',
                                },
                                vAxis: {
                                    title: 'Price (USD)',
                                },
                            }}
                        /> */}
                        <Chart
                            chartType="LineChart"
                            width="100%"
                            height="400px"
                            data={chartData}
                            options={{
                                hAxis: {
                                    title: 'Time',
                                },
                                vAxis: {
                                    title: 'Price (USD)',
                                },
                            }}
                        />
                    </div>
                )}
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
