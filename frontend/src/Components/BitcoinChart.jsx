import React, { useEffect, useState } from 'react';
import 'chart.js/auto'; // Importing chart.js directly
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';

const BitcoinChart = () => {
  const [coinData, setCoinData] = useState([]);
  const [error, setError] = useState(null);
  const { coin } = useParams();

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/coin/${coin}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${coin} data: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.prices || !Array.isArray(data.prices)) {
          throw new Error(`Invalid data format for ${coin}`);
        }
        setCoinData(data.prices);
      } catch (error) {
        console.error(`Error fetching ${coin} data:`, error);
        setError(error.message);
      }
    };

    fetchCoinData();
  }, [coin]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (coinData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      marginTop: "180px",
      width: '100%', height: "auto",
      display: "flex", justifyContent: "center", alignItems: "center",
      flexDirection: "column"
    }}>
      <h2>{coin} Price Chart</h2>
      <div className="graph">
        <Line
          data={{
            labels: coinData.map(entry => new Date(entry[0]).toLocaleDateString()),
            datasets: [
              {
                label: `${coin} Price (USD)`,
                data: coinData.map(entry => entry[1]),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
              },
            ],
          }}
        />
      </div>
      <style>{`
      .graph{
        width: 90%;
      }
      `}</style>
    </div>
  );
};

export default BitcoinChart;