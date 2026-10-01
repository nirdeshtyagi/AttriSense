import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// FILE PATH SETUP
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, "users.json");

// =====================================================
// ML DEPLOYMENT PATH SETUP
// =====================================================
//
// Project structure:
//
// AttriSense
// ├── attrisense-backend
// │   └── server.js
// │
// ├── attrisense-frontend
// │
// └── AttriSense_ML_Deployment
//     ├── predict.py
//     ├── attrisense_model.joblib
//     ├── requirements.txt
//     └── venv
//
// =====================================================

const ML_DIR = path.join(
  __dirname,
  "..",
  "AttriSense_ML_Deployment"
);

const PREDICT_SCRIPT = path.join(
  ML_DIR,
  "predict.py"
);

// Python executable from ML virtual environment
const PYTHON_EXECUTABLE = path.join(
  ML_DIR,
  "venv",
  "Scripts",
  "python.exe"
);

// =====================================================
// EXEC FILE
// =====================================================

const execFileAsync = promisify(execFile);

// =====================================================
// JWT CONFIG
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env file.");
  process.exit(1);
}

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AttriSense Backend is running 🚀",
  });
});

// =====================================================
// SIGNUP API
// =====================================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    // Read users.json
    let users = [];

    try {
      const data = await fs.readFile(
        usersFile,
        "utf-8"
      );

      users = JSON.parse(data);

      if (!Array.isArray(users)) {
        users = [];
      }
    } catch (error) {
      users = [];
    }

    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = users.find(
      (user) =>
        user.email &&
        user.email.toLowerCase() ===
          normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // Hash password
    const passwordHash =
      await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id:
        users.length > 0
          ? users[users.length - 1].id + 1
          : 1,

      name: name.trim(),

      email: normalizedEmail,

      passwordHash,

      role,

      createdAt:
        new Date().toISOString(),
    };

    // Add user
    users.push(newUser);

    // Save users.json
    await fs.writeFile(
      usersFile,
      JSON.stringify(users, null, 2),
      "utf-8"
    );

    // Send response
    return res.status(201).json({
      success: true,

      message:
        "Account created successfully.",

      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the account.",
    });
  }
});

// =====================================================
// LOGIN API
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
      rememberMe = false,
    } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    // Read users.json
    let users = [];

    try {
      const data = await fs.readFile(
        usersFile,
        "utf-8"
      );

      users = JSON.parse(data);

      if (!Array.isArray(users)) {
        users = [];
      }
    } catch (error) {
      users = [];
    }

    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();

    // Find user
    const user = users.find(
      (item) =>
        item.email &&
        item.email.toLowerCase() ===
          normalizedEmail
    );

    // Don't reveal whether email exists
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: rememberMe
          ? "7d"
          : "2h",
      }
    );

    // Login successful
    return res.status(200).json({
      success: true,

      message: "Login successful.",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in.",
    });
  }
});

// =====================================================
// JWT AUTH MIDDLEWARE
// =====================================================

const authenticateToken = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  const token =
    authHeader &&
    authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        "Access token is required.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

// =====================================================
// PROTECTED PROFILE ROUTE
// =====================================================

app.get(
  "/api/auth/me",
  authenticateToken,
  async (req, res) => {
    try {
      const data = await fs.readFile(
        usersFile,
        "utf-8"
      );

      const users = JSON.parse(data);

      const user = users.find(
        (item) =>
          item.id === req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load user profile.",
      });
    }
  }
);

// =====================================================
// ML MODEL HEALTH CHECK
// =====================================================

app.get(
  "/api/predict/health",
  async (req, res) => {
    try {
      let predictScriptExists = false;
      let pythonExecutableExists = false;

      try {
        await fs.access(
          PREDICT_SCRIPT
        );

        predictScriptExists = true;
      } catch (error) {
        predictScriptExists = false;
      }

      try {
        await fs.access(
          PYTHON_EXECUTABLE
        );

        pythonExecutableExists = true;
      } catch (error) {
        pythonExecutableExists = false;
      }

      return res.status(200).json({
        success: true,

        modelDirectory: ML_DIR,

        predictScriptExists,

        pythonExecutable:
          PYTHON_EXECUTABLE,

        pythonExecutableExists,

        message:
          "AttriSense ML prediction service is configured.",
      });
    } catch (error) {
      console.error(
        "ML health check error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to check ML prediction service.",
      });
    }
  }
);

// =====================================================
// ML ATTRITION PREDICTION API
// =====================================================

app.post(
  "/api/predict",
  async (req, res) => {
    try {
      console.log(
        "\n======================================"
      );

      console.log(
        "AttriSense ML Prediction Request"
      );

      console.log(
        "======================================"
      );

      console.log(
        "Received data:",
        req.body
      );

      // -------------------------------------------------
      // CHECK ML FILES
      // -------------------------------------------------

      try {
        await fs.access(
          PREDICT_SCRIPT
        );
      } catch (error) {
        console.error(
          "predict.py not found:",
          PREDICT_SCRIPT
        );

        return res.status(500).json({
          success: false,

          error:
            "ML prediction script was not found.",

          path: PREDICT_SCRIPT,
        });
      }

      try {
        await fs.access(
          PYTHON_EXECUTABLE
        );
      } catch (error) {
        console.error(
          "Python executable not found:",
          PYTHON_EXECUTABLE
        );

        return res.status(500).json({
          success: false,

          error:
            "Python executable was not found in ML virtual environment.",

          path: PYTHON_EXECUTABLE,
        });
      }

      // -------------------------------------------------
      // RECEIVE FRONTEND DATA
      // -------------------------------------------------

      const {
        age,
        monthlyIncome,
        overtime,
        jobSatisfaction,
        yearsAtCompany,
        jobLevel,
      } = req.body;

      // -------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------

      const missingFields = [];

      if (
        age === undefined ||
        age === null ||
        age === ""
      ) {
        missingFields.push("age");
      }

      if (
        monthlyIncome === undefined ||
        monthlyIncome === null ||
        monthlyIncome === ""
      ) {
        missingFields.push(
          "monthlyIncome"
        );
      }

      if (
        overtime === undefined ||
        overtime === null ||
        overtime === ""
      ) {
        missingFields.push(
          "overtime"
        );
      }

      if (
        jobSatisfaction === undefined ||
        jobSatisfaction === null ||
        jobSatisfaction === ""
      ) {
        missingFields.push(
          "jobSatisfaction"
        );
      }

      if (
        yearsAtCompany === undefined ||
        yearsAtCompany === null ||
        yearsAtCompany === ""
      ) {
        missingFields.push(
          "yearsAtCompany"
        );
      }

      if (
        jobLevel === undefined ||
        jobLevel === null ||
        jobLevel === ""
      ) {
        missingFields.push(
          "jobLevel"
        );
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,

          error:
            "All employee prediction fields are required.",

          requiredFields: [
            "age",
            "monthlyIncome",
            "overtime",
            "jobSatisfaction",
            "yearsAtCompany",
            "jobLevel",
          ],

          missingFields,
        });
      }

      // -------------------------------------------------
      // CONVERT NUMERIC VALUES
      // -------------------------------------------------

      const numericAge =
        Number(age);

      const numericIncome =
        Number(monthlyIncome);

      const numericJobSatisfaction =
        Number(jobSatisfaction);

      const numericYearsAtCompany =
        Number(yearsAtCompany);

      const numericJobLevel =
        Number(jobLevel);

      // -------------------------------------------------
      // VALIDATE NUMERIC VALUES
      // -------------------------------------------------

      if (
        !Number.isFinite(
          numericAge
        ) ||
        !Number.isFinite(
          numericIncome
        ) ||
        !Number.isFinite(
          numericJobSatisfaction
        ) ||
        !Number.isFinite(
          numericYearsAtCompany
        ) ||
        !Number.isFinite(
          numericJobLevel
        )
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Numeric employee fields must contain valid numbers.",
        });
      }

      // -------------------------------------------------
      // VALIDATE BASIC RANGES
      // -------------------------------------------------

      if (
        numericAge < 18 ||
        numericAge > 100
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Age must be between 18 and 100.",
        });
      }

      if (numericIncome < 0) {
        return res.status(400).json({
          success: false,

          error:
            "Monthly income cannot be negative.",
        });
      }

      if (
        numericJobSatisfaction < 1 ||
        numericJobSatisfaction > 4
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Job satisfaction must be between 1 and 4.",
        });
      }

      if (numericYearsAtCompany < 0) {
        return res.status(400).json({
          success: false,

          error:
            "Years at company cannot be negative.",
        });
      }

      if (
        numericJobLevel < 1 ||
        numericJobLevel > 5
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Job level must be between 1 and 5.",
        });
      }

      // -------------------------------------------------
      // VALIDATE OVERTIME
      // -------------------------------------------------

      const normalizedOvertime =
        String(overtime)
          .trim()
          .toLowerCase();

      let overtimeValue;

      if (
        normalizedOvertime === "yes"
      ) {
        overtimeValue = "Yes";
      } else if (
        normalizedOvertime === "no"
      ) {
        overtimeValue = "No";
      } else {
        return res.status(400).json({
          success: false,

          error:
            "Overtime must be either Yes or No.",
        });
      }

      // -------------------------------------------------
      // BUILD ML PAYLOAD
      // -------------------------------------------------
      //
      // IMPORTANT:
      //
      // The current predict.py used in this project
      // expects these six frontend fields:
      //
      // age
      // monthlyIncome
      // overtime
      // jobSatisfaction
      // yearsAtCompany
      // jobLevel
      //
      // predict.py internally handles the ML feature
      // preparation required by the trained model.
      //
      // The prediction itself is NOT calculated here.
      //
      // The final result comes from:
      //
      // PCA -> Random Forest
      //
      // inside predict.py.
      //
      // -------------------------------------------------

      const modelPayload = {
        age: numericAge,

        monthlyIncome:
          numericIncome,

        overtime:
          overtimeValue,

        jobSatisfaction:
          numericJobSatisfaction,

        yearsAtCompany:
          numericYearsAtCompany,

        jobLevel:
          numericJobLevel,
      };

      console.log(
        "ML payload:",
        modelPayload
      );

      // -------------------------------------------------
      // RUN PYTHON ML MODEL
      // -------------------------------------------------

      console.log(
        "Running trained ML model..."
      );

      console.log(
        "Python:",
        PYTHON_EXECUTABLE
      );

      console.log(
        "Script:",
        PREDICT_SCRIPT
      );

      const jsonPayload =
        JSON.stringify(
          modelPayload
        );

      console.log(
        "JSON payload:",
        jsonPayload
      );

      let stdout = "";
      let stderr = "";

      try {
        const result =
          await execFileAsync(
            PYTHON_EXECUTABLE,
            [
              PREDICT_SCRIPT,
              jsonPayload,
            ],
            {
              cwd: ML_DIR,

              windowsHide: true,

              maxBuffer:
                10 * 1024 * 1024,
            }
          );

        stdout =
          result.stdout || "";

        stderr =
          result.stderr || "";
      } catch (pythonError) {
        console.error(
          "Python execution error:",
          pythonError
        );

        console.error(
          "Python stdout:",
          pythonError.stdout
        );

        console.error(
          "Python stderr:",
          pythonError.stderr
        );

        return res.status(500).json({
          success: false,

          error:
            "ML model execution failed.",

          details:
            pythonError.stderr ||
            pythonError.message,

          stdout:
            pythonError.stdout || "",
        });
      }

      // -------------------------------------------------
      // PYTHON WARNINGS
      // -------------------------------------------------
      //
      // scikit-learn may print warnings such as:
      //
      // InconsistentVersionWarning
      //
      // These warnings are written to stderr but do not
      // necessarily mean that prediction failed.
      //
      // The actual prediction response is read from stdout.
      //
      // -------------------------------------------------

      if (stderr) {
        console.log(
          "Python warnings/output:",
          stderr
        );
      }

      console.log(
        "Python response:",
        stdout
      );

      // -------------------------------------------------
      // PARSE PYTHON RESPONSE
      // -------------------------------------------------

      let predictionResult;

      try {
        predictionResult =
          JSON.parse(
            stdout.trim()
          );
      } catch (parseError) {
        console.error(
          "Unable to parse Python JSON:",
          stdout
        );

        return res.status(500).json({
          success: false,

          error:
            "ML model returned an invalid response.",

          rawResponse:
            stdout.trim(),

          parseError:
            parseError.message,
        });
      }

      // -------------------------------------------------
      // HANDLE PYTHON-LEVEL ERROR
      // -------------------------------------------------

      if (
        predictionResult &&
        predictionResult.error
      ) {
        return res.status(400).json({
          success: false,

          error:
            predictionResult.error,
        });
      }

      // -------------------------------------------------
      // VALIDATE ML RESPONSE
      // -------------------------------------------------

      if (
        !predictionResult ||
        predictionResult.prediction ===
          undefined ||
        predictionResult.attritionProbability ===
          undefined ||
        predictionResult.riskLevel ===
          undefined
      ) {
        return res.status(500).json({
          success: false,

          error:
            "ML model returned an incomplete prediction response.",

          rawResponse:
            predictionResult,
        });
      }

      // -------------------------------------------------
      // FINAL RESPONSE TO FRONTEND
      // -------------------------------------------------

      const finalResponse = {
        success: true,

        prediction:
          predictionResult.prediction,

        attritionProbability:
          predictionResult.attritionProbability,

        riskLevel:
          predictionResult.riskLevel,

        model:
          "Random Forest",

        dimensionalityReduction:
          "PCA",

        message:
          predictionResult.message ||
          "Prediction generated successfully using the trained Attrition ML model.",
      };

      console.log(
        "Final prediction:",
        finalResponse
      );

      console.log(
        "======================================\n"
      );

      return res.status(200).json(
        finalResponse
      );
    } catch (error) {
      console.error(
        "Prediction API error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          "Something went wrong while generating the prediction.",

        details:
          error.message,
      });
    }
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,

      error:
        "API route not found.",

      path:
        req.originalUrl,
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        "Internal server error.",
    });
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      `ML directory: ${ML_DIR}`
    );

    console.log(
      `Prediction script: ${PREDICT_SCRIPT}`
    );

    console.log(
      `Python executable: ${PYTHON_EXECUTABLE}`
    );
  }
);