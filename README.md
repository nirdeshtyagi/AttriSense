# AttriSense

### AI-Powered Employee Attrition Prediction & HR Analytics Platform

AttriSense is an end-to-end machine learning and web-based platform designed to help organizations identify employees who may be at risk of attrition.

The platform combines a trained machine learning model with a modern HR analytics dashboard, allowing users to provide employee information and receive an **attrition prediction, probability score, and risk classification** through an intuitive interface.

---

## Overview

Employee attrition can significantly impact an organization's productivity, hiring costs, team stability, and workforce planning.

AttriSense uses employee-related factors such as job satisfaction, overtime, income, job level, experience, work-life balance, and other attributes to estimate the likelihood of employee attrition.

The project covers the complete lifecycle of an ML application:

**Data Analysis → Preprocessing → Imbalance Handling → Model Training → Model Deployment → API Integration → Web Dashboard**

---

## Key Features

### Machine Learning

- Exploratory Data Analysis (EDA)
- Data preprocessing and feature transformation
- Multiple classification algorithms
- Imbalanced dataset analysis
- Oversampling and undersampling
- Principal Component Analysis (PCA)
- Model performance evaluation
- Trained Random Forest model for inference
- Serialized model deployment using Joblib

### Employee Attrition Prediction

The prediction engine provides:

- Attrition prediction — Yes / No
- Attrition probability
- Employee risk level
- Prediction explanation message

Example:

```text
Prediction: No
Attrition Probability: 12.4%
Risk Level: Low Risk
