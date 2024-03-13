import React, { useCallback, useEffect, useState } from 'react';

const CryptoPrice = () => {

    const [price, setPrice] = useState(null);

    const getCoinList = useCallback(async (coin) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin}`;
        const apiKey = 'CG-FNFFa7JE39x9DRveFTroVzaa'; // Replace with your actual API key

        const options = {
            headers: {
                'x-cg-demo-api-key': apiKey,
            },
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                console.error(`Error fetching data: ${response.status}`);
            }
            const data = await response.json();
            console.log(data.market_data.ath.inr);
            setPrice(data.market_data.ath.inr);
        } catch (error) {
            console.error(error);
        }
    }, []);

    // useEffect(() => {
    //     getCoinList();
    // }, [getCoinList]);

    return (
        <>
            <div className="container">
                <p>{price}</p>
                <button onClick={() => { getCoinList("bitcoin") }}>Bitcoin Price</button>
            </div>
            <style>{`
        .container{
            margin-top:200px;
        }
      `}</style>
        </>
    );
};

export default CryptoPrice;
