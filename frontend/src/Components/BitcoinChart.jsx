import React, { useEffect, useState } from 'react';
import 'chart.js/auto'; // Importing chart.js directly
import { Line } from 'react-chartjs-2';

const BitcoinChart = () => {
  const [bitcoinData, setBitcoinData] = useState([]);

  useEffect(() => {
    const fetchBitcoinData = async () => {
      try {
        // const response = await fetch(`http://localhost:8000/coin/${coin_id}`);
        const response = await fetch(`http://localhost:8000/coin/bitcoin`);
        const data = await response.json();
        setBitcoinData(data.prices);
      } catch (error) {
        console.error('Error fetching Bitcoin data:', error);
      }
    };

    fetchBitcoinData();
  }, []);

  const chartData = {
    labels: bitcoinData.map(entry => new Date(entry[0]).toLocaleDateString()),
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: bitcoinData.map(entry => entry[1]),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div>
      <h2>Bitcoin Price Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default BitcoinChart;
