AttriSense ML Deployment

This package follows the user's original AttriSense notebook workflow:
LabelEncoder -> RandomOverSampler -> PCA(2) -> tuned Random Forest.

The trained artifact is attrisense_model.joblib.

Install:
    pip install -r requirements.txt

The Node backend will call predict.py with a JSON payload.
IMPORTANT:
The original notebook trains on all features remaining after dropping:
EmployeeCount, Attrition, EmployeeNumber, Over18, StandardHours.
Therefore the frontend must eventually collect all required model features, or
we must build a backend mapping/default strategy deliberately rather than
silently giving the model only six fields.
