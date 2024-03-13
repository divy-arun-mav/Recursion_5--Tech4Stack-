import React, { useCallback, useEffect, useState } from 'react';
import Coins from "./store/tokenList.json";

const CryptoPrice = () => {
    const [coinData, setCoinData] = useState([]);

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
            };
        } catch (error) {
            console.error(`Error fetching data for ${coin.id}: ${error}`);
            return null;
        }
    }, []);

    const fetchCoinData = async () => {
        const coins = Coins

        const coinDataArray = await Promise.all(
            coins.map(async (coin) => {
                const data = await getCoinList(coin);
                return data;
            })
        );

        setCoinData(coinDataArray.filter((data) => data !== null));
    };

    useEffect(() => {
        fetchCoinData();
    }, []);

    return (
        <>
            <div className="container">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Symbol</th>
                            <th>Price (USD)</th>
                            <th>Price (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coinData.map((coin, index) => (
                            <tr key={index}>
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
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      `}</style>
        </>
    );
};

export default CryptoPrice;
