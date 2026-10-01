from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import joblib
import numpy as np
import os

app = FastAPI(title="Power Plant Energy Prediction API")

# Allow CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    base_dir = os.path.dirname(os.path.dirname(__file__))
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

@app.get("/")
def read_root():
    return {"message": "Power Plant Energy Prediction API is running."}
