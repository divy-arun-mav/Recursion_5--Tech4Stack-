import React, { useCallback, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Coins from './store/tokenList.json';

const CryptoPrice = () => {
    const [coinData, setCoinData] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [price, setPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);

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
    };

    useEffect(() => {
        fetchCoinData();
    }, ['https://api.coingecko.com/api/v3/coins']);

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
                            <label htmlFor="input">Enter your token price: </label>
                            <input type="text" name="" id="input" value={price} onChange={(e) => setPrice(e.target.value)} />
                            <label htmlFor="input">Current token price</label>
                            <p>{selectedCoin.priceInr !== null ? selectedCoin.priceInr : 'Select a coin to see the current price.'}</p>
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