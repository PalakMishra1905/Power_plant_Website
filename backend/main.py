from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import torch.nn as nn
import joblib
import numpy as np
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


app = FastAPI(title="Power Plant Energy Prediction API")

# Allow CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.dirname(__file__))
frontend_dir = os.path.join(base_dir, "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

# 1. Define the ANN architecture exactly as in the training notebook
class ANN(nn.Module):
    def __init__(self):
        super(ANN, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(4, 6),
            nn.ReLU(),
            nn.Linear(6, 6),
            nn.ReLU(),
            nn.Linear(6, 1),
        )

    def forward(self, x):
        return self.model(x)

# 2. Global variables to hold model and scaler
model = None
scaler = None

@app.on_event("startup")
def load_assets():
    global model, scaler
    model_path = os.path.join(base_dir, "best_model.pt")
    scaler_path = os.path.join(base_dir, "scaler.pkl")
    
    # Load model
    if not os.path.exists(model_path):
        raise RuntimeError(f"Model file not found at {model_path}")
    
    model = ANN()
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    
    # Load scaler
    if not os.path.exists(scaler_path):
        raise RuntimeError(f"Scaler file not found at {scaler_path}")
    
    scaler = joblib.load(scaler_path)

# 3. Define the request schema
class PredictionRequest(BaseModel):
    AT: float  # Temperature
    V: float   # Vacuum
    AP: float  # Pressure
    RH: float  # Humidity

@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        # Convert input to numpy array
        input_data = np.array([[request.AT, request.V, request.AP, request.RH]])
        
        # Scale the inputs
        scaled_input = scaler.transform(input_data)
        
        # Convert to torch tensor
        input_tensor = torch.tensor(scaled_input, dtype=torch.float32)
        
        # Make prediction
        with torch.no_grad():
            prediction = model(input_tensor)
            
        return {"predicted_PE": float(prediction.item())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Global variable for performance caching
performance_data = None

@app.get("/model-performance")
def get_model_performance():
    global performance_data
    if performance_data is not None:
        return performance_data

    try:
        df_path = os.path.join(base_dir, "powerplant_data.csv")
        if not os.path.exists(df_path):
            raise HTTPException(status_code=404, detail="Dataset not found for evaluation.")

        df = pd.read_csv(df_path)
        X = df.drop("PE", axis=1)
        y = df["PE"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size = 0.2, random_state = 42
        )

        X_test_scaled = scaler.transform(X_test)
        X_test_tensor = torch.tensor(X_test_scaled, dtype=torch.float32)
        
        model.eval()
        with torch.no_grad():
            preds = model(X_test_tensor).numpy().flatten()
            
        actuals = y_test.values

        r2 = r2_score(actuals, preds)
        mae = mean_absolute_error(actuals, preds)
        rmse = np.sqrt(mean_squared_error(actuals, preds))

        np.random.seed(42)
        indices = np.random.choice(len(actuals), min(500, len(actuals)), replace=False)
        scatter_data = [{"actual": float(actuals[i]), "predicted": float(preds[i])} for i in indices]

        baseline_r2 = r2
        importances = {}
        features = ["AT", "V", "AP", "RH"]
        for i, col in enumerate(features):
            col_importance_sum = 0.0
            for _ in range(5):
                X_test_shuffled = X_test.copy()
                X_test_shuffled.iloc[:, i] = np.random.permutation(X_test_shuffled.iloc[:, i].values)
                X_test_shuffled_scaled = scaler.transform(X_test_shuffled)
                X_test_shuffled_tensor = torch.tensor(X_test_shuffled_scaled, dtype=torch.float32)
                with torch.no_grad():
                    preds_shuffled = model(X_test_shuffled_tensor).numpy().flatten()
                shuffled_r2 = r2_score(actuals, preds_shuffled)
                col_importance_sum += (baseline_r2 - shuffled_r2)
            importances[col] = float(col_importance_sum / 5.0)

        feature_importance = [
            {"feature": "AT", "description": "Ambient Temperature", "importance": importances["AT"]},
            {"feature": "V", "description": "Exhaust Vacuum", "importance": importances["V"]},
            {"feature": "AP", "description": "Ambient Pressure", "importance": importances["AP"]},
            {"feature": "RH", "description": "Relative Humidity", "importance": importances["RH"]}
        ]
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)

        performance_data = {
            "metrics": {
                "r2": float(r2),
                "mae": float(mae),
                "rmse": float(rmse)
            },
            "scatter_data": scatter_data,
            "feature_importance": feature_importance
        }
        return performance_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not found, API is running."}
