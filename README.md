# ⚡ Power Plant Energy Prediction

A web-based **Power Plant Energy Prediction** application that uses an Artificial Neural Network (ANN) trained with PyTorch to predict electrical energy output based on environmental and operational parameters.

The application combines a **PyTorch ANN model**, **FastAPI backend**, and a responsive **HTML/CSS/JavaScript frontend** into a single web application. It also includes an interactive model performance dashboard to evaluate prediction accuracy and understand feature importance.

## 🚀 Live Application

**Live Demo:** https://power-plant-website.onrender.com/

## 📌 Features

* ⚡ Predict power plant energy output in MW
* 🤖 ANN regression model built with PyTorch
* 📊 Input-based energy prediction using four parameters
* 📈 Interactive prediction charts
* 📝 Prediction history stored in the browser
* 🔄 Prediction history persists after page refresh
* 🗑️ Clear prediction history
* 📉 Model performance dashboard
* 📊 Model evaluation metrics: R², MAE, and RMSE
* 🎯 Actual vs. Predicted energy output visualization
* 🔍 Permutation-based feature importance analysis
* 📈 Interactive feature importance chart
* 🎨 Responsive and modern user interface
* 🚀 FastAPI REST API
* 📚 Swagger API documentation
* ☁️ Deployed on Render

## 🧠 Machine Learning Model

The application uses an **Artificial Neural Network (ANN)** for regression.

### Input Features

| Feature | Description         |
| ------- | ------------------- |
| AT      | Ambient Temperature |
| V       | Exhaust Vacuum      |
| AP      | Ambient Pressure    |
| RH      | Relative Humidity   |

### Output

| Output | Description                     |
| ------ | ------------------------------- |
| PE     | Produced Electrical Energy (MW) |

The input features are standardized using `StandardScaler` before being passed to the neural network.

The trained model and scaler are stored as:

```text
best_model.pt
scaler.pkl
```

### ANN Architecture

The neural network consists of the following layers:

```text
Input Layer (4 neurons)
        |
        v
Hidden Layer (6 neurons)
        |
      ReLU
        |
        v
Hidden Layer (6 neurons)
        |
      ReLU
        |
        v
Output Layer (1 neuron)
```

The model achieved approximately **R² = 0.935** during evaluation.

## 📊 Model Performance Dashboard

The application includes a model performance dashboard that provides insights into the trained ANN's predictive performance.

### Evaluation Metrics

The dashboard displays the following metrics:

| Metric   | Description                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------ |
| R² Score | Measures how well the model explains the variation in energy output.                             |
| MAE      | Mean Absolute Error, measuring the average absolute prediction error in MW.                      |
| RMSE     | Root Mean Squared Error, measuring prediction error while penalizing larger errors more heavily. |

### Actual vs. Predicted Chart

An interactive scatter plot compares actual energy output values with the model's predicted values.

This visualization helps assess how closely the predictions match the actual values and identify deviations in model performance.

### Feature Importance

The dashboard uses **permutation feature importance** to estimate how much each input feature contributes to model performance.

The method evaluates the change in the model's R² score when the values of an individual feature are shuffled.

A larger drop in R² indicates that the model relies more heavily on that feature for its predictions.

The feature importance chart displays the relative importance of:

* Ambient Temperature (AT)
* Exhaust Vacuum (V)
* Ambient Pressure (AP)
* Relative Humidity (RH)

These values represent the model's measured dependence on the input features, not causal effects on power generation.

## 🏗️ Architecture

```text
                         User
                          |
                          v
                 Frontend Interface
              HTML + CSS + JavaScript
                          |
             +------------+------------+
             |                         |
             v                         v
       POST /predict            GET /model-performance
             |                         |
             v                         v
        FastAPI Backend           Model Evaluation
             |                         |
      Input Validation           Load Evaluation Data
             |                         |
       Feature Scaling          Calculate Metrics
             |                         |
             v                  Actual vs. Predicted
       PyTorch ANN Model        Feature Importance
             |                         |
             v                         v
      Predicted Energy          Dashboard Visualizations
```

FastAPI serves both the frontend and backend API, allowing the application to run as a single web service.

## 📂 Project Structure

```text
Power_plant_Website/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── index.css
│   └── app.js
│
├── best_model.pt
├── scaler.pkl
├── powerplant_data.csv
├── requirements.txt
└── README.md
```

## 🛠️ Technologies Used

### Machine Learning

* Python
* PyTorch
* NumPy
* Pandas
* Scikit-learn

### Backend

* FastAPI
* Uvicorn
* Pydantic

### Frontend

* HTML
* CSS
* JavaScript
* Chart.js

### Deployment and Tools

* Render
* GitHub
* Git

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/PalakMishra1905/Power_plant_Website.git
```

### 2. Navigate to the project

```bash
cd Power_plant_Website
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI server

```bash
python -m uvicorn backend.main:app --reload
```

### 5. Open the application

```text
http://127.0.0.1:8000
```

### Swagger API Documentation

The API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## 🔮 Example Prediction

Example input:

```text
AT = 14.96
V  = 41.76
AP = 1024.07
RH = 73.17
```

Example prediction:

```text
Predicted Energy ≈ 467.52 MW
```

The prediction may vary slightly depending on the model and numerical precision.

## 📊 Prediction History & Charts

The application stores recent predictions in the browser using `localStorage`.

The prediction dashboard provides interactive charts for:

* Ambient Temperature vs. Produced Energy
* Exhaust Vacuum vs. Produced Energy
* Ambient Pressure vs. Produced Energy
* Relative Humidity vs. Produced Energy

Users can review previous predictions, retain history after refreshing the page, and clear the stored history when needed.

No database is required for prediction history.

## 🔌 API

### POST `/predict`

Predicts the produced electrical energy based on the four input parameters.

**Example request:**

```json
{
  "AT": 14.96,
  "V": 41.76,
  "AP": 1024.07,
  "RH": 73.17
}
```

**Example response:**

```json
{
  "predicted_PE": 467.51837158203125
}
```

### GET `/model-performance`

Returns model evaluation information for the performance dashboard.

The response includes:

* **Metrics:** R² score, MAE, and RMSE.
* **Scatter data:** Actual and predicted energy output values for visualization.
* **Feature importance:** Permutation importance values for the four input features.

The endpoint uses the evaluation dataset and the model to calculate the performance information displayed in the frontend.

## ☁️ Deployment

The application is deployed on **Render** as a single Web Service.

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

FastAPI serves both the frontend and the prediction and model-performance APIs from the same service.

## 📈 Model Workflow

```text
Dataset
   |
   v
Data Preprocessing
   |
   v
Train/Test Split
   |
   v
StandardScaler
   |
   v
ANN Training
   |
   v
Model Evaluation
   |
   v
Save Model and Scaler
   |
   v
FastAPI Integration
   |
   v
Web Application
   |
   +------------------------+
   |                        |
   v                        v
Energy Prediction     Model Performance
                            |
                  +---------+---------+
                  |                   |
                  v                   v
             Evaluation         Permutation
               Metrics        Feature Importance
                  |                   |
                  +---------+---------+
                            |
                            v
                     Dashboard Charts
```

## 🎯 Project Objective

The objective of this project is to build an end-to-end machine learning application that demonstrates the complete workflow from **model development and preprocessing to model evaluation, API integration, frontend visualization, and cloud deployment**.

By combining energy prediction with model performance analysis and feature importance visualization, the application provides both predictions and insights into the trained model.

## 👩‍💻 Author

**Palak Mishra**

Computer Engineering Student

GitHub:
https://github.com/PalakMishra1905
