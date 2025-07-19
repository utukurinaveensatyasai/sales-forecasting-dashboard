import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Main App component for the Sales Forecasting Dashboard
const App = () => {
  // State variables to hold our data and calculated values
  const [salesData, setSalesData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [inventoryRecommendations, setInventoryRecommendations] = useState([]);
  const [mae, setMae] = useState(0);
  const [rmse, setRmse] = useState(0);

  // Constants for data generation and forecasting
  const START_DATE = '2022-01-01';
  const END_DATE = '2024-12-31'; // Data up to end of 2024 for training
  const FORECAST_PERIOD_DAYS = 90; // Forecast for the next 90 days
  const SAFETY_STOCK_FACTOR = 0.20; // 20% of forecasted sales as safety stock
  const LEAD_TIME_DAYS = 7; // Assume a 7-day lead time for replenishment (not directly used for daily inventory here, but good context)

  // --- 1. Data Generation Function (JavaScript equivalent of Python) ---
  const generateSyntheticSalesData = (startDateStr, endDateStr) => {
    const dates = [];
    const sales = [];
    let currentDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate)); // Push a copy of the date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const numDays = dates.length;
    const baseSales = 100;

    // Trend component: gradually increasing sales over time
    const trend = Array.from({ length: numDays }, (_, i) => (i / numDays) * 50);

    // Yearly seasonality: higher sales during certain months (e.g., holidays)
    const yearlySeasonality = dates.map(date => {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      return 10 * Math.sin(dayOfYear * (2 * Math.PI / 365));
    });

    // Weekly seasonality: higher sales on weekends
    const weeklySeasonality = dates.map(date => {
      const dayOfWeek = date.getDay(); // Sunday - 0, Saturday - 6
      return (dayOfWeek === 0 || dayOfWeek === 6) ? 15 : 0; // Saturday (6) and Sunday (0)
    });

    // Random noise (using a simple pseudo-random generator for consistency)
    const noise = Array.from({ length: numDays }, () => (Math.random() - 0.5) * 10); // Between -5 and 5

    // Combine components to get total sales
    for (let i = 0; i < numDays; i++) {
      let dailySales = baseSales + trend[i] + yearlySeasonality[i] + weeklySeasonality[i] + noise[i];
      sales.push(Math.max(0, Math.round(dailySales))); // Ensure no negative sales, round to integer
    }

    return dates.map((date, index) => ({
      ds: date.toISOString().split('T')[0], // Format as 'YYYY-MM-DD' for consistency
      y: sales[index],
    }));
  };

  // --- 2. Simulate Prophet Forecast (JavaScript equivalent) ---
  // This function simulates the output of a Prophet model for future dates.
  // It's not a real Prophet implementation but provides similar components for visualization.
  const simulateProphetForecast = (historicalData, forecastPeriods) => {
    const lastHistoricalDate = new Date(historicalData[historicalData.length - 1].ds);
    const futureDates = [];
    let currentDate = new Date(lastHistoricalDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from the day after the last historical date

    for (let i = 0; i < forecastPeriods; i++) {
      futureDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const forecastResults = futureDates.map(date => {
      const ds = date.toISOString().split('T')[0];

      // Simulate trend (extrapolate from historical trend)
      // This is a very basic linear extrapolation. A real Prophet model is more sophisticated.
      const historicalTrendEnd = historicalData.length > 1 ?
        (historicalData[historicalData.length - 1].y - historicalData[0].y) / historicalData.length : 0;
      const simulatedTrend = historicalData[historicalData.length - 1].y + (date - lastHistoricalDate) / (1000 * 60 * 60 * 24) * historicalTrendEnd * 0.1; // Small growth factor

      // Simulate yearly seasonality
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const yearlySeasonality = 10 * Math.sin(dayOfYear * (2 * Math.PI / 365));

      // Simulate weekly seasonality
      const dayOfWeek = date.getDay();
      const weeklySeasonality = (dayOfWeek === 0 || dayOfWeek === 6) ? 15 : 0;

      // Combine components for yhat (predicted sales)
      let yhat = simulatedTrend + yearlySeasonality + weeklySeasonality;

      // Add a small random component for yhat_lower and yhat_upper
      const uncertainty = 5; // Simulating prediction interval width
      const yhat_lower = Math.max(0, Math.round(yhat - uncertainty));
      const yhat_upper = Math.round(yhat + uncertainty);
      yhat = Math.max(0, Math.round(yhat));

      return {
        ds,
        yhat,
        yhat_lower,
        yhat_upper,
        trend: Math.round(simulatedTrend), // For component plot
        yearly_seasonality: Math.round(yearlySeasonality), // For component plot
        weekly_seasonality: Math.round(weeklySeasonality), // For component plot
      };
    });

    return forecastResults;
  };

  // --- 3. Model Evaluation (JavaScript equivalent) ---
  const evaluateModel = (actuals, predictions) => {
    const mergedData = actuals.map(item => {
      const pred = predictions.find(p => p.ds === item.ds);
      return {
        actual: item.y,
        predicted: pred ? pred.yhat : null
      };
    }).filter(item => item.predicted !== null); // Only compare where we have both

    if (mergedData.length === 0) return { mae: 0, rmse: 0 };

    const actualValues = mergedData.map(item => item.actual);
    const predictedValues = mergedData.map(item => item.predicted);

    const mae = actualValues.reduce((sum, val, i) => sum + Math.abs(val - predictedValues[i]), 0) / actualValues.length;
    const rmse = Math.sqrt(actualValues.reduce((sum, val, i) => sum + Math.pow(val - predictedValues[i], 2), 0) / actualValues.length);

    return { mae, rmse };
  };

  // --- 4. Inventory Optimization Logic (JavaScript equivalent) ---
  const calculateInventoryRecommendations = (forecasts, safetyFactor) => {
    return forecasts.map(f => ({
      ds: f.ds,
      yhat: f.yhat,
      recommended_inventory: Math.round(f.yhat + (f.yhat * safetyFactor)),
    }));
  };

  // useEffect hook to run the data generation and forecasting when the component mounts
  useEffect(() => {
    const historical = generateSyntheticSalesData(START_DATE, END_DATE);
    setSalesData(historical);

    // Simulate forecast for the historical period to calculate metrics
    const historicalForecastSim = simulateProphetForecast(historical, historical.length);
    const { mae, rmse } = evaluateModel(historical, historicalForecastSim);
    setMae(mae);
    setRmse(rmse);

    // Generate future forecast
    const futureForecast = simulateProphetForecast(historical, FORECAST_PERIOD_DAYS);
    setForecastData(futureForecast);

    // Calculate inventory recommendations
    const inventoryRecs = calculateInventoryRecommendations(futureForecast, SAFETY_STOCK_FACTOR);
    setInventoryRecommendations(inventoryRecs);

  }, []); // Empty dependency array means this runs once on mount

  // Combine historical and future forecast data for the main plot
  const combinedChartData = salesData.map(d => ({ ...d, type: 'Actual' }))
    .concat(forecastData.map(d => ({
      ds: d.ds,
      yhat: d.yhat,
      yhat_lower: d.yhat_lower,
      yhat_upper: d.yhat_upper,
      type: 'Forecast'
    })));

  // Data for forecast components plot
  const componentsChartData = forecastData.map(d => ({
    ds: d.ds,
    trend: d.trend,
    yearly_seasonality: d.yearly_seasonality,
    weekly_seasonality: d.weekly_seasonality,
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-inter text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-700 mb-6">
          Sales Forecasting & Inventory Optimization Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          This dashboard demonstrates a sales forecasting and inventory optimization project.
          It simulates historical sales data, forecasts future demand, and recommends inventory levels.
          <br />
          <span className="font-semibold text-sm text-red-600">
            Note: This is a client-side simulation for demonstration. In a real application, the forecasting model (like Prophet) would run on a backend server.
          </span>
        </p>

        {/* Key Metrics Section */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-8 shadow-md">
          <h2 className="text-xl font-semibold text-indigo-800 mb-3">Model Performance (Simulated)</h2>
          <div className="flex flex-col md:flex-row justify-around items-center space-y-2 md:space-y-0">
            <p className="text-lg">
              <span className="font-medium">Mean Absolute Error (MAE):</span> <span className="text-indigo-600 font-bold">{mae.toFixed(2)}</span>
            </p>
            <p className="text-lg">
              <span className="font-medium">Root Mean Squared Error (RMSE):</span> <span className="text-indigo-600 font-bold">{rmse.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Historical Sales & Forecast Chart */}
        <div className="mb-10 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 mb-4 text-center">
            Historical Sales & Future Forecast
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ds" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
              <YAxis label={{ value: 'Sales Volume', angle: -90, position: 'insideLeft' }} />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} />
              <Legend />
              <Line type="monotone" dataKey="y" name="Actual Sales" stroke="#8884d8" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="yhat" name="Forecasted Sales" stroke="#82ca9d" dot={false} isAnimationActive={false} />
              {/* Optional: Forecast uncertainty interval */}
              <Line type="monotone" dataKey="yhat_lower" stroke="#82ca9d" strokeDasharray="5 5" dot={false} name="Forecast Lower Bound" isAnimationActive={false} />
              <Line type="monotone" dataKey="yhat_upper" stroke="#82ca9d" strokeDasharray="5 5" dot={false} name="Forecast Upper Bound" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Displays historical sales data and the simulated future sales forecast.
          </p>
        </div>

        {/* Forecast Components Chart */}
        <div className="mb-10 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 mb-4 text-center">
            Forecast Components (Simulated)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={componentsChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ds" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
              <YAxis label={{ value: 'Component Value', angle: -90, position: 'insideLeft' }} />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} />
              <Legend />
              <Line type="monotone" dataKey="trend" name="Trend" stroke="#ffc658" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="yearly_seasonality" name="Yearly Seasonality" stroke="#ff7300" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="weekly_seasonality" name="Weekly Seasonality" stroke="#00c49f" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Breakdown of the simulated forecast into its underlying components: trend, yearly, and weekly seasonality.
          </p>
        </div>

        {/* Inventory Recommendations Chart */}
        <div className="mb-10 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 mb-4 text-center">
            Forecasted Sales vs. Recommended Inventory Levels
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={inventoryRecommendations} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ds" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} />
              <Legend />
              <Line type="monotone" dataKey="yhat" name="Forecasted Sales" stroke="#ef4444" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="recommended_inventory" name="Recommended Inventory Level" stroke="#22c55e" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Visualizes the forecasted sales against the calculated recommended inventory levels for the next 90 days, including a safety stock.
          </p>
        </div>

        {/* Business Recommendations Section */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-800 mb-4 text-center">
            Business Recommendations
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Proactive Stocking:</span> Based on the {FORECAST_PERIOD_DAYS}-day forecast, ensure inventory levels align with recommended inventory to meet anticipated demand and maintain a {(SAFETY_STOCK_FACTOR * 100).toFixed(0)}% safety stock.
            </li>
            <li>
              <span className="font-semibold">Seasonality Awareness:</span> The model identifies clear yearly and weekly seasonality. Plan promotions and staffing around peak periods (e.g., end-of-year holidays, weekends).
            </li>
            <li>
              <span className="font-semibold">Demand Fluctuation:</span> The safety stock helps mitigate unexpected demand spikes or supply chain delays. Regularly review and adjust the safety stock factor based on historical forecast accuracy and supply chain reliability.
            </li>
            <li>
              <span className="font-semibold">Lead Time Management:</span> Coordinate closely with suppliers, considering the assumed {LEAD_TIME_DAYS}-day lead time, to ensure timely replenishment and avoid stockouts.
            </li>
            <li>
              <span className="font-semibold">Continuous Improvement:</span> Monitor the model's performance (MAE: {mae.toFixed(2)}, RMSE: {rmse.toFixed(2)}) and retrain it periodically with new data to maintain accuracy.
            </li>
            <li>
              <span className="font-semibold">Root Cause Analysis:</span> If actual sales significantly deviate from forecasts, investigate the underlying business reasons (e.g., marketing campaigns, competitor actions, external events) to refine future models.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
