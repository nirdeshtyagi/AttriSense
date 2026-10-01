import json
import sys
from pathlib import Path

import joblib
import pandas as pd


# =====================================================
# PATH SETUP
# =====================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "attrisense_model.joblib"


# =====================================================
# LOAD TRAINED MODEL ARTIFACT
# =====================================================

try:
    artifact = joblib.load(MODEL_FILE)

    encoders = artifact["encoders"]
    feature_columns = artifact["feature_columns"]
    pca = artifact["pca"]
    model = artifact["model"]

except Exception as error:
    print(
        json.dumps(
            {
                "error": f"Unable to load ML model: {str(error)}"
            }
        )
    )
    sys.exit(1)


# =====================================================
# FRONTEND INPUTS
# These are the only fields required from the user.
# =====================================================

FRONTEND_FIELDS = {
    "age",
    "monthlyIncome",
    "overtime",
    "jobSatisfaction",
    "yearsAtCompany",
    "jobLevel",
}


# =====================================================
# DEFAULT VALUES
# Used only for model features not collected in UI.
# =====================================================

DEFAULT_VALUES = {
    "Age": 30,
    "BusinessTravel": "Travel_Rarely",
    "DailyRate": 800,
    "Department": "Research & Development",
    "DistanceFromHome": 5,
    "Education": 3,
    "EducationField": "Life Sciences",
    "EmployeeCount": 1,
    "EmployeeNumber": 1000,
    "EnvironmentSatisfaction": 3,
    "Gender": "Male",
    "HourlyRate": 65,
    "JobInvolvement": 3,
    "JobLevel": 1,
    "JobRole": "Research Scientist",
    "JobSatisfaction": 3,
    "MaritalStatus": "Single",
    "MonthlyIncome": 5000,
    "MonthlyRate": 15000,
    "NumCompaniesWorked": 2,
    "OverTime": "No",
    "PercentSalaryHike": 14,
    "PerformanceRating": 3,
    "RelationshipSatisfaction": 3,
    "StockOptionLevel": 0,
    "TotalWorkingYears": 8,
    "TrainingTimesLastYear": 3,
    "WorkLifeBalance": 3,
    "YearsAtCompany": 5,
    "YearsInCurrentRole": 3,
    "YearsSinceLastPromotion": 1,
    "YearsWithCurrManager": 3,
}


# =====================================================
# FRONTEND → MODEL FIELD MAPPING
# =====================================================

def build_model_payload(payload):
    """
    Converts the simple frontend payload into the
    complete feature set expected by the trained model.
    """

    model_payload = {}

    # -------------------------------------------------
    # Start with defaults
    # -------------------------------------------------

    for feature in feature_columns:

        if feature in DEFAULT_VALUES:
            model_payload[feature] = DEFAULT_VALUES[feature]

        else:
            # Safe generic fallback
            model_payload[feature] = 0

    # -------------------------------------------------
    # Override defaults with actual frontend values
    # -------------------------------------------------

    if "age" in payload:
        model_payload["Age"] = payload["age"]

    if "monthlyIncome" in payload:
        model_payload["MonthlyIncome"] = payload["monthlyIncome"]

    if "overtime" in payload:
        model_payload["OverTime"] = payload["overtime"]

    if "jobSatisfaction" in payload:
        model_payload["JobSatisfaction"] = payload["jobSatisfaction"]

    if "yearsAtCompany" in payload:
        model_payload["YearsAtCompany"] = payload["yearsAtCompany"]

    if "jobLevel" in payload:
        model_payload["JobLevel"] = payload["jobLevel"]

    return model_payload


# =====================================================
# VALIDATE FRONTEND INPUT
# =====================================================

def validate_input(payload):

    missing = []

    for field in FRONTEND_FIELDS:

        if field not in payload:
            missing.append(field)

    if missing:
        raise ValueError(
            f"Missing required fields: {', '.join(missing)}"
        )

    # -------------------------------------------------
    # Numeric validation
    # -------------------------------------------------

    numeric_fields = [
        "age",
        "monthlyIncome",
        "jobSatisfaction",
        "yearsAtCompany",
        "jobLevel",
    ]

    for field in numeric_fields:

        try:
            value = float(payload[field])

            if value < 0:
                raise ValueError

        except (ValueError, TypeError):

            raise ValueError(
                f"{field} must be a valid positive number."
            )

    # -------------------------------------------------
    # Range validation
    # -------------------------------------------------

    age = float(payload["age"])

    if age < 18 or age > 100:
        raise ValueError("Age must be between 18 and 100.")

    satisfaction = int(payload["jobSatisfaction"])

    if satisfaction not in [1, 2, 3, 4]:
        raise ValueError(
            "Job Satisfaction must be between 1 and 4."
        )

    job_level = int(payload["jobLevel"])

    if job_level not in [1, 2, 3, 4, 5]:
        raise ValueError(
            "Job Level must be between 1 and 5."
        )

    overtime = str(payload["overtime"])

    if overtime not in ["Yes", "No"]:
        raise ValueError(
            "OverTime must be either Yes or No."
        )


# =====================================================
# PREDICTION
# =====================================================

def predict(payload):

    # Validate simple frontend input
    validate_input(payload)

    # Build complete model input
    model_payload = build_model_payload(payload)

    # -------------------------------------------------
    # Create dataframe in EXACT feature order
    # -------------------------------------------------

    row = {}

    for feature in feature_columns:

        if feature not in model_payload:
            raise ValueError(
                f"Unable to create model input for: {feature}"
            )

        row[feature] = model_payload[feature]

    frame = pd.DataFrame(
        [row],
        columns=feature_columns
    )

    # -------------------------------------------------
    # Apply original LabelEncoder mappings
    # -------------------------------------------------

    for column, encoder in encoders.items():

        # Target column is not part of prediction input
        if column == "Attrition":
            continue

        if column not in frame.columns:
            continue

        value = frame.at[0, column]

        try:

            frame[column] = encoder.transform(
                [str(value)]
            )

        except ValueError:

            allowed_values = list(
                encoder.classes_
            )

            raise ValueError(
                f"Invalid value for {column}: {value}. "
                f"Allowed values: {allowed_values}"
            )

    # -------------------------------------------------
    # Convert non-categorical features to numeric
    # -------------------------------------------------

    for column in frame.columns:

        if column not in encoders:

            frame[column] = pd.to_numeric(
                frame[column],
                errors="raise"
            )

    # -------------------------------------------------
    # PCA TRANSFORMATION
    # Same PCA used during training
    # -------------------------------------------------

    transformed = pca.transform(frame)

    # -------------------------------------------------
    # RANDOM FOREST PREDICTION
    # -------------------------------------------------

    prediction = int(
        model.predict(transformed)[0]
    )

    probability = float(
        model.predict_proba(transformed)[0][1]
    )

    probability_percentage = round(
        probability * 100,
        2
    )

    # -------------------------------------------------
    # RISK LEVEL
    # -------------------------------------------------

    if probability >= 0.60:

        risk = "High Risk"

    elif probability >= 0.30:

        risk = "Medium Risk"

    else:

        risk = "Low Risk"

    # -------------------------------------------------
    # RESPONSE
    # -------------------------------------------------

    return {
        "success": True,

        "prediction": (
            "Yes"
            if prediction == 1
            else "No"
        ),

        "attritionProbability": probability_percentage,

        "riskLevel": risk,

        "message": (
            "The ML model predicts a higher likelihood "
            "of employee attrition."
            if prediction == 1
            else
            "The ML model predicts a lower likelihood "
            "of employee attrition."
        ),
    }


# =====================================================
# COMMAND LINE ENTRY
# =====================================================

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Prediction JSON is required."
                }
            )
        )

        sys.exit(1)

    try:

        payload = json.loads(
            sys.argv[1]
        )

        result = predict(payload)

        print(
            json.dumps(result)
        )

    except Exception as error:

        print(
            json.dumps(
                {
                    "success": False,
                    "error": str(error)
                }
            )
        )

        sys.exit(1)