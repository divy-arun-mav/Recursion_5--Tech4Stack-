import React, { useCallback, useEffect, useState } from 'react';

const CryptoPrice = () => {

    const [coin, setCoin] = useState('');

    const getCoinList = useCallback(async () => {
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
            console.log(data.market_data.ath.inr); // Access the parsed JSON response data
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getCoinList();
    }, [getCoinList]);

    return (
        <>
            <div className="container-crypt">
                
            </div>
            <style>{`
        /* Your CSS styles here */
      `}</style>
        </>
    );
};

export default CryptoPrice;
