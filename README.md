Sales Forecasting & Inventory Optimization Dashboard
Project Overview
This project presents an interactive web dashboard built with React that demonstrates the principles of sales forecasting and inventory optimization. It simulates a real-world scenario where historical sales data is used to predict future demand, which then informs recommendations for optimal inventory levels.

The core objective is to minimize the risks associated with overstocking (high holding costs, waste) and understocking (lost sales, customer dissatisfaction) by providing data-driven insights for efficient inventory management.

Features
Synthetic Data Generation: Generates realistic historical sales data with trend, yearly, and weekly seasonality, along with random noise.

Simulated Forecasting: Implements a client-side simulation of a time-series forecasting model (mimicking Facebook Prophet's components) to predict future sales.

Model Evaluation: Calculates key performance metrics (Mean Absolute Error - MAE, Root Mean Squared Error - RMSE) to assess the simulated forecast's accuracy.

Inventory Optimization Logic: Applies a simple strategy to recommend daily inventory levels by adding a configurable safety stock buffer to forecasted sales.

Interactive Visualizations: Utilizes recharts to display:

Historical sales alongside future sales forecasts.

Breakdown of forecast components (trend, yearly, weekly seasonality).

Comparison of forecasted sales with recommended inventory levels.

Actionable Business Recommendations: Provides clear, data-driven insights and suggestions for improving inventory planning and overall business decision-making.

Technologies Used
Frontend: React.js

Styling: Tailwind CSS

Charting: Recharts

Language: JavaScript (for client-side data simulation and logic)

Live Demo
You can view a live demo of this dashboard here:
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME
(Remember to replace YOUR_USERNAME and YOUR_REPOSITORY_NAME with your actual GitHub details after deployment)

Getting Started
Follow these instructions to set up and run the project locally on your machine.

Prerequisites
Node.js (LTS version recommended) and npm (Node Package Manager) installed. You can download it from nodejs.org.

Git installed (for cloning the repository).

Installation
Clone the repository:

git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME # Navigate into your project directory

(Replace YOUR_USERNAME and YOUR_REPOSITORY_NAME)

Install project dependencies:

npm install

Running the Application
To start the development server and view the app in your browser:

npm start

This will open the application in your default web browser, usually at http://localhost:3000. The page will automatically reload as you make changes to the code.

Deployment to GitHub Pages
This project is configured for easy deployment to GitHub Pages.

Ensure gh-pages is installed:

npm install --save-dev gh-pages

Configure homepage in package.json:
Add the homepage property to your package.json file, replacing the placeholders with your GitHub username and repository name:

{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME",
  "name": "sales-dashboard-app",
  // ... rest of your package.json
}

Add deploy scripts to package.json:
Ensure your scripts section in package.json includes:

"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
},

Deploy the application:

npm run deploy

After a few minutes, your application will be live at the homepage URL you specified.

Project Structure (Simplified)
src/App.js: The main React component containing all the dashboard logic, data generation, simulated forecasting, and UI.

src/index.js: Renders the main App component.

src/index.css: Imports Tailwind CSS directives and contains basic global styles.

public/index.html: The main HTML template for the React app.

tailwind.config.js: Tailwind CSS configuration.

Business Impact & Learning Outcomes
This project demonstrates proficiency in:

Data Analysis & Visualization: Understanding and presenting complex data trends.

Time-Series Forecasting: Applying (simulated) predictive models for business insights.

Inventory Management: Translating forecasts into actionable inventory recommendations.

Frontend Development: Building interactive and responsive web applications with React and Tailwind CSS.

Problem-Solving: Addressing a common business challenge with a data-driven solution.

Software Engineering Practices: Using Git for version control and deploying web applications.
