# ⚡ Power Plant Energy Prediction

A web-based **Power Plant Energy Prediction** application that uses an Artificial Neural Network (ANN) trained with PyTorch to predict electrical energy output based on environmental and operational parameters.

The application combines a **PyTorch ANN model**, **FastAPI backend**, and a responsive **HTML/CSS/JavaScript frontend** into a single web application.

## 🚀 Live Application

**Live Demo:** Add your Render URL here after deployment.

## 📌 Features

* ⚡ Predict power plant energy output in MW
* 🤖 ANN regression model built with PyTorch
* 📊 Input-based energy prediction using four parameters
* 📈 Interactive prediction charts
* 📝 Prediction history stored in the browser
* 🔄 Prediction history persists after page refresh
* 🗑️ Clear prediction history
* 🎨 Responsive and modern user interface
* 🚀 FastAPI REST API
* 📚 Swagger API documentation
* ☁️ Ready for deployment on Render

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

The model achieved an approximate **R² score of 0.935** during model evaluation.

## 🏗️ Architecture

```text
User
  │
  ▼
Frontend
HTML + CSS + JavaScript
  │
  │ POST /predict
  ▼
FastAPI Backend
  │
  ├── Input validation
  ├── Feature scaling
  └── ANN inference
        │
        ▼
   PyTorch ANN Model
        │
        ▼
 Predicted Energy (MW)
```

FastAPI serves both the frontend and prediction API, allowing the application to run as a single web service.

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

### Deployment

* Render
* GitHub

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

Open:

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

## 📊 Prediction History & Charts

The application stores recent predictions in the browser using `localStorage`.

The dashboard provides interactive charts for:

* Ambient Temperature vs Produced Energy
* Exhaust Vacuum vs Produced Energy
* Ambient Pressure vs Produced Energy
* Relative Humidity vs Produced Energy

No database is required for prediction history.

## 🔌 API

### POST `/predict`

Predicts the produced electrical energy based on the four input parameters.

Example request:

```json
{
  "AT": 14.96,
  "V": 41.76,
  "AP": 1024.07,
  "RH": 73.17
}
```

Example response:

```json
{
  "predicted_PE": 467.51837158203125
}
```

## ☁️ Deployment

The application is configured for deployment on **Render** as a single Web Service.

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

FastAPI serves both the frontend and the `/predict` API from the same service.

## 📈 Model Workflow

```text
Dataset
   │
   ▼
Data Preprocessing
   │
   ▼
Train/Test Split
   │
   ▼
StandardScaler
   │
   ▼
ANN Training
   │
   ▼
Model Evaluation
   │
   ▼
best_model.pt
   │
   ▼
FastAPI Integration
   │
   ▼
Web Application
```

## 🎯 Project Objective

The objective of this project is to build an end-to-end machine learning application that demonstrates the complete workflow from **model development and preprocessing to API integration, frontend development, and cloud deployment**.

## 👩‍💻 Author

**Palak Mishra**

Computer Engineering Student

GitHub:
https://github.com/PalakMishra1905
