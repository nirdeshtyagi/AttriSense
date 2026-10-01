import { useEffect, useState } from "react";

import {
  Users,
  UserMinus,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  Brain,
  UserSearch,
  BarChart3,
  Settings,
  Bell,
  LogIn,
  UserPlus,
  Info,
  LogOut,
  ArrowRight,
  ShieldCheck,
  ChartNoAxesCombined,
  UsersRound,
  Menu,
  Sparkles,
  ChevronDown,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";


// =====================================================
// API CONFIG
// =====================================================

const API_BASE_URL = "http://127.0.0.1:5000";


// =====================================================
// FEATURE CARD
// =====================================================

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>

      <div className="feature-card-content">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {
  const [page, setPage] = useState("welcome");
  const [loggedIn, setLoggedIn] = useState(false);

  // This comes from backend after login.
  // No hardcoded username.
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("HR Manager");

  const [openFaq, setOpenFaq] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =====================================================
  // SETTINGS STATE
  // =====================================================
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("attrisense_settings")) || {
        mediumRiskThreshold: 30,
        highRiskThreshold: 60,
        predictionNotifications: true,
        highRiskAlerts: true,
        compactMode: false,
        rememberMe: true,
      };
    } catch {
      return {
        mediumRiskThreshold: 30,
        highRiskThreshold: 60,
        predictionNotifications: true,
        highRiskAlerts: true,
        compactMode: false,
        rememberMe: true,
      };
    }
  });


  // =====================================================
  // RESTORE JWT SESSION
  // =====================================================

  useEffect(() => {
    const token =
      localStorage.getItem("attrisense_token") ||
      sessionStorage.getItem("attrisense_token");

    if (!token) {
      setAuthLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          localStorage.removeItem("attrisense_token");
          sessionStorage.removeItem("attrisense_token");

          setLoggedIn(false);
          setUserName("");
          setUserEmail("");
          setPage("welcome");

          return;
        }

        const savedProfileName = localStorage.getItem(
          "attrisense_profile_name"
        );

        setUserName(
          savedProfileName ||
          data.user.name ||
          getNameFromEmail(data.user.email) ||
          "User"
        );

        setUserEmail(data.user.email || "");
        setUserRole(data.user.role || "HR Manager");

        setLoggedIn(true);

        // Login ke baad personalized welcome page
        setPage("dashboard");

      } catch (error) {
        console.error("Session restore error:", error);

        localStorage.removeItem("attrisense_token");
        sessionStorage.removeItem("attrisense_token");

        setLoggedIn(false);
        setUserName("");
        setUserEmail("");
        setPage("welcome");

      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);


  // =====================================================
  // GET NAME FROM EMAIL
  // =====================================================

  const getNameFromEmail = (email) => {
    if (!email) return "User";

    const username = email.split("@")[0];

    if (!username) return "User";

    return username
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ") || "User";
  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid email or password.");
        return false;
      }

      if (!data.token || !data.user) {
        alert(
          "Login response is incomplete. Please try again."
        );
        return false;
      }

      // Clear old tokens
      localStorage.removeItem("attrisense_token");
      sessionStorage.removeItem("attrisense_token");


      // Remember Me
      if (credentials.rememberMe) {
        localStorage.setItem(
          "attrisense_token",
          data.token
        );
      } else {
        sessionStorage.setItem(
          "attrisense_token",
          data.token
        );
      }


      // IMPORTANT:
      // Name comes from logged-in user's backend data.
      const backendName = data.user.name;
      const backendEmail = data.user.email;
      const savedProfileName = localStorage.getItem(
        "attrisense_profile_name"
      );

      setUserName(
        savedProfileName ||
        backendName ||
        getNameFromEmail(backendEmail) ||
        "User"
      );

      setUserEmail(backendEmail || "");

      setUserRole(
        data.user.role ||
        "HR Manager"
      );

      setLoggedIn(true);

      // Login ke baad personalized dashboard
      setPage("dashboard");

      return true;

    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );

      return false;
    }
  };


  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSignup = async (userData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to create account."
        );
        return;
      }

      alert(
        "Account created successfully! Please login."
      );

      setPage("login");

    } catch (error) {
      console.error("Signup error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };


  // =====================================================
  // SETTINGS HELPERS
  // =====================================================

  const updateSettings = (nextSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(
      "attrisense_settings",
      JSON.stringify(nextSettings)
    );
  };

  const saveProfileName = (nextName) => {
    const cleanName = nextName.trim();
    if (!cleanName) return;

    setUserName(cleanName);
    localStorage.setItem(
      "attrisense_profile_name",
      cleanName
    );
  };

  useEffect(() => {
    const savedName = localStorage.getItem(
      "attrisense_profile_name"
    );

    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.compact =
      settings.compactMode ? "true" : "false";
  }, [settings.compactMode]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("attrisense_token");
    sessionStorage.removeItem("attrisense_token");

    setLoggedIn(false);
    setUserName("");
    setUserEmail("");
    setUserRole("HR Manager");

    setPage("welcome");
  };


  // =====================================================
  // ABOUT SCROLL
  // =====================================================

  const scrollToAbout = () => {
    setPage("welcome");

    setTimeout(() => {
      document
        .getElementById("about")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };


  // =====================================================
  // LEARN MORE SCROLL
  // =====================================================

  const scrollToLearnMore = () => {
    setPage("welcome");

    setTimeout(() => {
      document
        .getElementById("learn-more")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };


  // =====================================================
  // CONTACT SCROLL
  // =====================================================

  const scrollToContact = () => {
    setPage("welcome");

    setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };


  // =====================================================
  // FAQ SCROLL
  // =====================================================

  const scrollToFaq = () => {
    setPage("welcome");

    setTimeout(() => {
      document
        .getElementById("faq")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };


  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500 flex items-center justify-center">
            <Brain
              className="text-slate-950"
              size={27}
            />
          </div>

          <p className="mt-4 text-slate-400">
            Checking your session...
          </p>

        </div>
      </div>
    );
  }


  // =====================================================
  // WELCOME PAGE
  // =====================================================

  if (!loggedIn && page === "welcome") {
    return (
      <div className="welcome-page">

        {/* NAVBAR */}

        <nav className="welcome-navbar">

          <button
            className="welcome-brand"
            onClick={() => {
              setPage("welcome");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >

            <div className="brand-mark">
              <Brain
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div className="brand-text">
              <h2>
                Attri<span>Sense</span>
              </h2>

              <p>
                AI-Powered Attrition Prediction
              </p>
            </div>

          </button>


          <div className="welcome-nav-links">

            <button
              className="nav-link active"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Home
            </button>

            <button
              className="nav-link"
              onClick={scrollToAbout}
            >
              About
            </button>

            <button
              className="nav-link"
              onClick={scrollToFaq}
            >
              FAQ
            </button>

            <button
              className="nav-link"
              onClick={scrollToContact}
            >
              Contact
            </button>

          </div>


          <div className="welcome-auth">

            <button
              className="nav-login"
              onClick={() => setPage("login")}
            >
              <LogIn size={17} />
              Login
            </button>

            <button
              className="nav-signup"
              onClick={() => setPage("signup")}
            >
              Sign Up
            </button>

          </div>


          <button className="mobile-menu-button">
            <Menu size={22} />
          </button>

        </nav>


        {/* HERO */}

        <main className="welcome-hero">

          <div className="hero-content">

            <div className="hero-label">
              <span className="hero-label-dot" />
              SMARTER HR. STRONGER TEAMS.
            </div>


            <h1>
              Predict.
              <br />
              Prevent.
              <br />
              <span>Retain.</span>
            </h1>


            <p className="hero-description">
              AttriSense helps HR teams identify potential
              employee attrition risks early and take
              meaningful actions to build a more engaged
              and loyal workforce.
            </p>


            <div className="hero-actions">

              <button
                className="hero-primary-button"
                onClick={() => setPage("login")}
              >
                Get Started
                <ArrowRight size={19} />
              </button>


              <button
                className="hero-secondary-button"
                onClick={scrollToLearnMore}
              >
                Learn More
                <ArrowRight size={17} />
              </button>

            </div>

          </div>


          <div className="hero-insight">

            <div className="insight-top">

              <div>
                <p>ATTRITION RISK</p>
                <strong>32%</strong>
              </div>

              <div className="insight-icon">
                <TrendingUp size={20} />
              </div>

            </div>


            <div className="insight-status">
              <span />
              Medium Risk
            </div>


            <div className="insight-divider" />


            <div className="insight-bottom">

              <div>
                <p>EMPLOYEE INSIGHTS</p>
                <strong>Early detection</strong>
              </div>

              <ChartNoAxesCombined size={20} />

            </div>

          </div>

        </main>


        {/* FEATURE STRIP */}

        <section className="feature-strip">

          <FeatureCard
            icon={<Brain size={20} />}
            title="AI-Powered Prediction"
            text="Identify potential attrition risks using machine learning."
          />

          <FeatureCard
            icon={<ShieldCheck size={20} />}
            title="Early Risk Detection"
            text="Spot at-risk employees and take action early."
          />

          <FeatureCard
            icon={<ChartNoAxesCombined size={20} />}
            title="Data-Driven Insights"
            text="Make informed HR decisions backed by analytics."
          />

          <FeatureCard
            icon={<UsersRound size={20} />}
            title="Better Retention"
            text="Improve employee satisfaction and build stronger teams."
          />

        </section>


        {/* ABOUT */}

        <section
          id="about"
          className="about-section"
        >

          <div className="about-content">

            <div className="about-label">
              <span></span>
              ABOUT ATTRISENSE
            </div>


            <h2>
              Smarter insights for
              <span> stronger teams.</span>
            </h2>


            <p>
              AttriSense is an employee analytics platform
              designed to help organizations understand
              workforce patterns, identify potential risks,
              and make better data-driven decisions.
            </p>


            <p>
              By turning employee data into meaningful
              insights, AttriSense helps HR teams move from
              reactive decisions to proactive workforce
              management.
            </p>

          </div>


          <div className="about-card">

            <div className="about-card-icon">
              <Sparkles size={20} />
            </div>


            <h3>
              Data-driven HR decisions
            </h3>


            <p>
              Understand workforce trends and uncover
              valuable insights through a simple and
              intuitive analytics experience.
            </p>


            <div className="about-stats">

              <div>
                <strong>01</strong>
                <span>Analyze</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Predict</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Act</span>
              </div>

            </div>

          </div>

        </section>


        {/* LEARN MORE */}

        <section
          id="learn-more"
          className="learn-more-section"
        >

          <div className="learn-more-heading">

            <div className="about-label">
              <span></span>
              HOW ATTRISENSE WORKS
            </div>

            <h2>
              From employee data to
              <span> smarter decisions.</span>
            </h2>

            <p>
              AttriSense transforms employee information
              into meaningful attrition insights, helping
              HR teams understand risk and take action
              before valuable employees leave.
            </p>

          </div>


          <div className="prediction-flow">

            <div className="flow-step">

              <div className="flow-icon">
                <UserSearch size={21} />
              </div>

              <div>
                <span>01</span>
                <h3>Employee Data</h3>
                <p>
                  Relevant employee information is
                  collected for analysis.
                </p>
              </div>

            </div>


            <div className="flow-line"></div>


            <div className="flow-step">

              <div className="flow-icon">
                <Brain size={21} />
              </div>

              <div>
                <span>02</span>
                <h3>AI Analysis</h3>
                <p>
                  The model analyzes important
                  workforce characteristics.
                </p>
              </div>

            </div>


            <div className="flow-line"></div>


            <div className="flow-step">

              <div className="flow-icon">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>03</span>
                <h3>Risk Score</h3>
                <p>
                  Employees receive an understandable
                  attrition risk level.
                </p>
              </div>

            </div>


            <div className="flow-line"></div>


            <div className="flow-step">

              <div className="flow-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span>04</span>
                <h3>HR Action</h3>
                <p>
                  HR teams can take proactive steps
                  to improve retention.
                </p>
              </div>

            </div>

          </div>


          <div className="learn-more-cards">

            <div className="learn-card">

              <div className="learn-card-icon">
                <AlertTriangle size={20} />
              </div>

              <h3>Risk Analysis</h3>

              <p>
                Identify employees who may have a higher
                probability of attrition and understand
                where attention is needed.
              </p>

            </div>


            <div className="learn-card">

              <div className="learn-card-icon">
                <Brain size={20} />
              </div>

              <h3>Attrition Prediction</h3>

              <p>
                Use machine learning-based predictions
                to support proactive employee retention
                strategies.
              </p>

            </div>


            <div className="learn-card">

              <div className="learn-card-icon">
                <BarChart3 size={20} />
              </div>

              <h3>Data-Driven Insights</h3>

              <p>
                Convert workforce data into clear insights
                that help HR teams make informed decisions.
              </p>

            </div>


            <div className="learn-card">

              <div className="learn-card-icon">
                <UsersRound size={20} />
              </div>

              <h3>Early Intervention</h3>

              <p>
                Detect potential risks early and give HR
                teams an opportunity to improve employee
                retention.
              </p>

            </div>

          </div>

        </section>


        {/* FAQ */}

        <section
          id="faq"
          className="faq-section"
        >

          <div className="faq-heading">

            <div className="about-label">
              <span></span>
              FREQUENTLY ASKED QUESTIONS
            </div>

            <h2>
              Questions?
              <span> We have answers.</span>
            </h2>

            <p>
              Find quick answers about AttriSense, its
              prediction process, and how it can support
              HR teams.
            </p>

          </div>


          <div className="faq-list">

            {[
              {
                question: "What is AttriSense?",
                answer:
                  "AttriSense is an AI-powered employee analytics platform that helps HR teams identify potential attrition risks and make data-driven retention decisions.",
              },
              {
                question: "How does attrition prediction work?",
                answer:
                  "The system analyzes relevant employee information and uses a machine learning model to estimate the likelihood of employee attrition.",
              },
              {
                question: "What employee data is used?",
                answer:
                  "The prediction can use relevant workforce attributes such as age, income, overtime status, job satisfaction, job level, and years at the company.",
              },
              {
                question: "Who can use AttriSense?",
                answer:
                  "AttriSense is designed primarily for HR teams, managers, and organizations that want to better understand workforce trends and retention risks.",
              },
              {
                question: "How does AttriSense help HR teams?",
                answer:
                  "It helps HR teams identify potential risks early, understand important attrition factors, and support proactive employee retention strategies.",
              },
              {
                question: "Can prediction results be used for decision-making?",
                answer:
                  "Prediction results are intended to support HR analysis and should be considered alongside human judgment, employee context, and organizational policies.",
              },
            ].map((item, index) => (

              <div
                className={`faq-item ${
                  openFaq === index
                    ? "faq-item-open"
                    : ""
                }`}
                key={item.question}
              >

                <button
                  className="faq-question"
                  onClick={() =>
                    setOpenFaq(
                      openFaq === index
                        ? null
                        : index
                    )
                  }
                  aria-expanded={
                    openFaq === index
                  }
                >

                  <span>
                    {item.question}
                  </span>

                  <ChevronDown
                    size={19}
                    className="faq-chevron"
                  />

                </button>


                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}

              </div>

            ))}

          </div>

        </section>


        {/* CONTACT */}

        <section
          id="contact"
          className="contact-section"
        >

          <div className="contact-info">

            <div className="about-label">
              <span></span>
              GET IN TOUCH
            </div>

            <h2>
              Let's build a
              <span> stronger workforce.</span>
            </h2>

            <p>
              Have a question about AttriSense or want
              to know more about the platform? Get in
              touch with us and we'll be happy to help.
            </p>


            <div className="contact-email-card">

              <div className="contact-email-icon">
                <Info size={19} />
              </div>

              <div>

                <span>Email us</span>

                <a href="mailto:bhatiamanan2005@gmail.com">
                  bhatiamanan2005@gmail.com
                </a>

              </div>

            </div>

          </div>


          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();

              alert(
                "Thanks for reaching out! We'll get back to you soon."
              );

              e.currentTarget.reset();
            }}
          >

            <div className="contact-field">

              <label htmlFor="contact-name">
                Name
              </label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                required
              />

            </div>


            <div className="contact-field">

              <label htmlFor="contact-email">
                Email
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

            </div>


            <div className="contact-field">

              <label htmlFor="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows="5"
                placeholder="How can we help?"
                required
              />

            </div>


            <button
              type="submit"
              className="contact-submit"
            >
              Send Message
              <ArrowRight size={17} />
            </button>

          </form>

        </section>


        <div className="scroll-indicator">

          <div className="scroll-mouse">
            <span />
          </div>

          <p>Scroll to explore</p>

          <span className="scroll-arrow">
            ⌄
          </span>

        </div>

      </div>
    );
  }


  // =====================================================
  // ABOUT PAGE
  // =====================================================

  if (!loggedIn && page === "about") {
    return (
      <PublicLayout setPage={setPage}>

        <div className="max-w-4xl mx-auto text-center">

          <Info
            className="mx-auto text-cyan-400"
            size={45}
          />

          <h1 className="text-4xl font-bold mt-5">
            About{" "}
            <span className="text-cyan-400">
              AttriSense
            </span>
          </h1>


          <p className="text-slate-400 mt-6 leading-7">
            AttriSense is an AI-powered employee attrition
            analytics platform designed to help HR teams
            identify employees who may be at risk of leaving
            the organization.
          </p>


          <div className="grid grid-cols-3 gap-5 mt-10 text-left">

            <InfoCard
              title="Predict"
              text="Use machine learning to predict employee attrition risk."
            />

            <InfoCard
              title="Analyze"
              text="Understand important factors affecting employee retention."
            />

            <InfoCard
              title="Decide"
              text="Support HR teams with data-driven workforce decisions."
            />

          </div>

        </div>

      </PublicLayout>
    );
  }


  // =====================================================
  // SIGNUP PAGE
  // =====================================================

  if (!loggedIn && page === "signup") {
    return (
      <AuthPage
        title="Create Account"
        subtitle="Create your AttriSense HR Analytics account"
        buttonText="Create Account"
        onSubmit={handleSignup}
        switchText="Already have an account?"
        switchButton="Login"
        onSwitch={(target = "login") =>
          setPage(target)
        }
      />
    );
  }


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!loggedIn && page === "login") {
    return (
      <AuthPage
        title="Welcome Back"
        subtitle="Login to access your HR Analytics dashboard"
        buttonText="Login"
        onSubmit={handleLogin}
        switchText="Don't have an account?"
        switchButton="Sign Up"
        onSwitch={(target = "signup") =>
          setPage(target)
        }
      />
    );
  }


  // =====================================================
  // PERSONALIZED DASHBOARD
  // =====================================================

  if (loggedIn && page === "dashboard") {
    return (
      <Dashboard
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        setPage={setPage}
        logout={logout}
      />
    );
  }


  // =====================================================
  // PREDICTION
  // =====================================================

  if (loggedIn && page === "prediction") {
    return (
      <PredictionPage
        setPage={setPage}
        userName={userName}
        userEmail={userEmail}
        logout={logout}
      />
    );
  }


  // =====================================================
  // ADDITIONAL WORKSPACE PAGES
  // =====================================================

  if (loggedIn && page === "employees") {
    return (
      <WorkspacePage
        page={page}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        setPage={setPage}
        logout={logout}
      />
    );
  }

  if (loggedIn && page === "settings") {
    return (
      <SettingsPage
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        setPage={setPage}
        logout={logout}
        settings={settings}
        updateSettings={updateSettings}
        saveProfileName={saveProfileName}
      />
    );
  }


  return null;
}


// =====================================================
// PUBLIC LAYOUT
// =====================================================

function PublicLayout({ children, setPage }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="h-20 border-b border-slate-800 flex items-center justify-between px-8">

        <button
          onClick={() => setPage("welcome")}
          className="flex items-center gap-3"
        >

          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
            <Brain
              className="text-slate-950"
              size={24}
            />
          </div>


          <div className="text-left">

            <h1 className="text-xl font-bold">
              AttriSense
            </h1>

            <p className="text-xs text-slate-400">
              HR Analytics
            </p>

          </div>

        </button>


        <div className="flex gap-7 text-sm">

          <button
            onClick={() => setPage("welcome")}
          >
            Home
          </button>


          <button
            onClick={() => setPage("about")}
          >
            About
          </button>


          <button
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>


          <button
            onClick={() => setPage("login")}
            className="px-5 py-2 bg-cyan-500 text-slate-950 rounded-lg font-semibold"
          >
            Login
          </button>

        </div>

      </nav>


      <main className="px-8 py-16">
        {children}
      </main>

    </div>
  );
}


// =====================================================
// LOGIN / SIGNUP
// =====================================================

function AuthPage({
  title,
  subtitle,
  buttonText,
  onSubmit,
  switchText,
  switchButton,
  onSwitch,
}) {

  const isSignup =
    buttonText === "Create Account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] =
    useState("HR Manager");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(() => {
      try {
        const savedSettings = JSON.parse(
          localStorage.getItem("attrisense_settings") || "{}"
        );
        return savedSettings.rememberMe ?? true;
      } catch {
        return true;
      }
    });


  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert(
        "Please enter your email and password."
      );
      return;
    }


    if (isSignup && !name.trim()) {
      alert(
        "Please enter your full name."
      );
      return;
    }


    if (
      isSignup &&
      password !== confirmPassword
    ) {
      alert(
        "Passwords do not match."
      );
      return;
    }


    if (
      isSignup &&
      password.length < 6
    ) {
      alert(
        "Password must be at least 6 characters long."
      );
      return;
    }


    if (isSignup) {

      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      return;
    }


    await onSubmit({
      email: email.trim(),
      password,
      rememberMe,
    });
  };


  return (
    <div className="auth-page has-auth-navbar">

      <nav className="auth-navbar">

        <button
          className="welcome-brand"
          type="button"
          onClick={() =>
            onSwitch("welcome")
          }
        >

          <div className="brand-mark">
            <Brain
              size={21}
              strokeWidth={1.8}
            />
          </div>

          <div className="brand-text">

            <h2>
              Attri<span>Sense</span>
            </h2>

            <p>
              AI-Powered Attrition Prediction
            </p>

          </div>

        </button>


        <div className="welcome-nav-links">

          <button
            className="nav-link"
            type="button"
            onClick={() =>
              onSwitch("welcome")
            }
          >
            Home
          </button>


          <button
            className="nav-link"
            type="button"
            onClick={() => {
              onSwitch("welcome");

              setTimeout(() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }, 80);
            }}
          >
            About
          </button>


          <button
            className="nav-link"
            type="button"
            onClick={() => {
              onSwitch("welcome");

              setTimeout(() => {
                document
                  .getElementById("faq")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }, 80);
            }}
          >
            FAQ
          </button>


          <button
            className="nav-link"
            type="button"
            onClick={() => {
              onSwitch("welcome");

              setTimeout(() => {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }, 80);
            }}
          >
            Contact
          </button>

        </div>


        <button
          className="mobile-menu-button"
          type="button"
          onClick={() =>
            onSwitch("welcome")
          }
          aria-label="Back to Home"
        >
          <Menu size={22} />
        </button>

      </nav>


      <button
        type="button"
        className="auth-back-home"
        onClick={() => {
          onSwitch("welcome");

          setTimeout(() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }, 0);
        }}
      >
        ← Back to Home
      </button>


      <div className="auth-card">

        <div className="auth-brand">

          <div className="auth-brand-mark">
            <Brain
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div>

            <h2>
              Attri<span>Sense</span>
            </h2>

            <p>
              AI-Powered Attrition Prediction
            </p>

          </div>

        </div>


        <div className="auth-heading">

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>


        <form
          className="auth-form"
          onSubmit={submit}
        >

          {isSignup && (
            <div className="auth-field">

              <label htmlFor="auth-name">
                Full Name
              </label>

              <div className="auth-input-wrap">

                <User size={17} />

                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

              </div>

            </div>
          )}


          <div className="auth-field">

            <label htmlFor="auth-email">
              Email Address
            </label>

            <div className="auth-input-wrap">

              <Mail size={17} />

              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
              />

            </div>

          </div>


          {isSignup && (
            <div className="auth-field">

              <label htmlFor="auth-role">
                Account Type
              </label>

              <div className="auth-input-wrap">

                <BriefcaseBusiness
                  size={17}
                />

                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option>
                    HR Manager
                  </option>

                  <option>
                    HR Analyst
                  </option>

                  <option>
                    Employee
                  </option>

                </select>

              </div>

            </div>
          )}


          <div className="auth-field">

            <label htmlFor="auth-password">
              Password
            </label>

            <div className="auth-input-wrap">

              <Lock size={17} />

              <input
                id="auth-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete={
                  isSignup
                    ? "new-password"
                    : "current-password"
                }
              />


              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>


          {isSignup && (
            <div className="auth-field">

              <label htmlFor="auth-confirm-password">
                Confirm Password
              </label>

              <div className="auth-input-wrap">

                <Lock size={17} />

                <input
                  id="auth-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />


                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>
          )}


          {!isSignup && (
            <div className="auth-options">

              <label className="auth-checkbox">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="auth-forgot"
                onClick={() =>
                  alert(
                    "Password reset will be available soon."
                  )
                }
              >
                Forgot password?
              </button>

            </div>
          )}


          <button
            type="submit"
            className="auth-submit"
          >

            {isSignup ? (
              <>
                Create Account
                <UserPlus size={17} />
              </>
            ) : (
              <>
                Login
                <LogIn size={17} />
              </>
            )}

          </button>

        </form>


        <div className="auth-switch">

          <span>
            {switchText}
          </span>

          <button
            type="button"
            onClick={() => {
              if (isSignup) {
                onSwitch("login");
              } else {
                onSwitch("signup");
              }
            }}
          >
            {switchButton}
          </button>

        </div>


        <div className="auth-security">

          <ShieldCheck size={14} />

          <span>
            Your workforce data stays protected.
          </span>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// WORKSPACE PLACEHOLDER PAGES
// =====================================================

function WorkspacePage({
  page,
  userName,
  userEmail,
  userRole,
  setPage,
  logout,
}) {

  const pageConfig = {
    employees: {
      title: "Employee Directory",
      subtitle: "View and manage employee workforce information",
      icon: <Users size={24} />,
      description:
        "This workspace is ready for employee-level records, workforce segmentation, and retention tracking.",
    },
  };

  const current = pageConfig[page] || pageConfig.employees;

  return (
    <div className="dashboard-shell min-h-screen bg-slate-950 text-white flex">

      <aside className="dashboard-sidebar w-64 bg-slate-900 border-r border-slate-800 p-5">

        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-3 mb-10 text-left w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
            <Brain className="text-slate-950" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AttriSense</h1>
            <p className="text-xs text-slate-400">HR Analytics</p>
          </div>
        </button>

        <nav className="space-y-2">
          <button onClick={() => setPage("dashboard")} className="dashboard-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800">
            <LayoutDashboard size={19} /> Dashboard
          </button>
          <button onClick={() => setPage("prediction")} className="dashboard-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800">
            <UserSearch size={19} /> Prediction
          </button>
          <button onClick={() => setPage("employees")} className={`dashboard-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg ${page === "employees" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}>
            <Users size={19} /> Employees
          </button>
        </nav>

        <div className="mt-10 pt-6 border-t border-slate-800">
          <button onClick={() => setPage("settings")} className={`dashboard-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg ${page === "settings" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}>
            <Settings size={19} /> Settings
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:bg-red-500/10 rounded-lg">
            <LogOut size={19} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main flex-1">
        <header className="dashboard-header h-20 border-b border-slate-800 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-semibold">{current.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{current.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="text-slate-400" size={21} />
            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              {getInitial(userName)}
            </div>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-slate-500">{userEmail || userRole}</p>
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="dashboard-glass-panel max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
              {current.icon}
            </div>
            <p className="text-sm text-cyan-400 font-medium">AttriSense Workspace</p>
            <h1 className="text-3xl font-bold mt-2">{current.title}</h1>
            <p className="text-slate-400 mt-4 leading-7">{current.description}</p>
            <div className="mt-7 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5">
              <p className="text-sm text-slate-300">
                Welcome, <span className="text-cyan-400 font-semibold">{userName}</span>. Your account is signed in and ready to use.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


// =====================================================
// SETTINGS PAGE
// =====================================================

function SettingsPage({
  userName,
  userEmail,
  userRole,
  setPage,
  logout,
  settings,
  updateSettings,
  saveProfileName,
}) {
  const [profileName, setProfileName] = useState(userName || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfileName(userName || "");
  }, [userName]);

  const changeSetting = (key, value) => {
    updateSettings({
      ...settings,
      [key]: value,
    });
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1600);
  };

  const saveProfile = () => {
    if (!profileName.trim()) {
      alert("Please enter your name.");
      return;
    }

    saveProfileName(profileName);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1600);
  };

  const clearPreferences = () => {
    const defaults = {
      mediumRiskThreshold: 30,
      highRiskThreshold: 60,
      predictionNotifications: true,
      highRiskAlerts: true,
      compactMode: false,
      rememberMe: true,
    };

    updateSettings(defaults);
    localStorage.removeItem("attrisense_prediction_history");
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1600);
  };

  return (
    <div className="dashboard-shell min-h-screen bg-slate-950 text-white flex">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar w-64 bg-slate-900 border-r border-slate-800 p-5">
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-3 mb-10 text-left w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
            <Brain className="text-slate-950" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AttriSense</h1>
            <p className="text-xs text-slate-400">HR Analytics</p>
          </div>
        </button>

        <nav className="space-y-2">
          <button
            onClick={() => setPage("dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            onClick={() => setPage("prediction")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <UserSearch size={19} />
            Prediction
          </button>

          <button
            onClick={() => setPage("employees")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <Users size={19} />
            Employees
          </button>
        </nav>

        <div className="mt-10 pt-6 border-t border-slate-800">
          <button
            onClick={() => setPage("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400"
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main flex-1">
        <header className="dashboard-header h-20 border-b border-slate-800 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage your AttriSense account and prediction preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="text-slate-400" size={21} />
            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              {getInitial(userName)}
            </div>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="max-w-5xl space-y-6">

            {/* PROFILE */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <User size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Profile Settings</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage the information shown across your dashboard.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-slate-300">Name</label>
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-cyan-400"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    value={userEmail}
                    readOnly
                    className="w-full mt-2 px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Role</label>
                  <input
                    value={userRole}
                    readOnly
                    className="w-full mt-2 px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-400 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={saveProfile}
                className="mt-5 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg"
              >
                Save Profile
              </button>
            </div>

            {/* PREDICTION PREFERENCES */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Activity size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Prediction Preferences</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Control how prediction probability is grouped into risk levels.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-slate-300">
                    Medium Risk starts at (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="98"
                    value={settings.mediumRiskThreshold}
                    onChange={(e) =>
                      changeSetting(
                        "mediumRiskThreshold",
                        Math.min(98, Math.max(1, Number(e.target.value) || 1))
                      )
                    }
                    className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">
                    High Risk starts at (%)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="99"
                    value={settings.highRiskThreshold}
                    onChange={(e) =>
                      changeSetting(
                        "highRiskThreshold",
                        Math.min(99, Math.max(2, Number(e.target.value) || 2))
                      )
                    }
                    className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-4">
                <p className="text-sm text-slate-300">
                  Current rule: below {settings.mediumRiskThreshold}% is Low Risk, from {settings.mediumRiskThreshold}% to below {settings.highRiskThreshold}% is Medium Risk, and {settings.highRiskThreshold}% or above is High Risk.
                </p>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Bell size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Notifications</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Choose which prediction alerts you want to keep enabled.
                  </p>
                </div>
              </div>

              <SettingToggle
                title="Prediction Notifications"
                description="Enable notifications after a prediction is completed."
                checked={settings.predictionNotifications}
                onChange={(value) =>
                  changeSetting("predictionNotifications", value)
                }
              />

              <SettingToggle
                title="High Risk Alerts"
                description="Highlight high-risk prediction results for HR review."
                checked={settings.highRiskAlerts}
                onChange={(value) =>
                  changeSetting("highRiskAlerts", value)
                }
              />
            </div>

            {/* APPEARANCE */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Settings size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Appearance</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Adjust the workspace density while keeping the glassmorphic theme.
                  </p>
                </div>
              </div>

              <SettingToggle
                title="Compact Mode"
                description="Use a more compact workspace layout for smaller screens."
                checked={settings.compactMode}
                onChange={(value) => changeSetting("compactMode", value)}
              />
            </div>

            {/* SECURITY */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Security</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage session-related preferences for this browser.
                  </p>
                </div>
              </div>

              <SettingToggle
                title="Remember Me"
                description="Use persistent login when you select Remember Me during login."
                checked={settings.rememberMe}
                onChange={(value) => changeSetting("rememberMe", value)}
              />

              <div className="mt-5 flex items-center justify-between gap-5 rounded-lg border border-slate-800 bg-slate-800/30 p-4">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Your authenticated session is protected by the AttriSense backend.
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* DATA & PREFERENCES */}
            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Lock size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Data & Preferences</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Reset locally stored prediction and workspace preferences.
                  </p>
                </div>
              </div>

              <button
                onClick={clearPreferences}
                className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Reset Preferences
              </button>
            </div>

            {saved && (
              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-5 py-4 text-cyan-300">
                <CheckCircle2 size={18} />
                <span className="text-sm">Changes saved successfully.</span>
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}


// =====================================================
// SETTINGS TOGGLE
// =====================================================

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 border-b border-slate-800 last:border-b-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}


// =====================================================
// DASHBOARD / PERSONALIZED WELCOME
// =====================================================

function Dashboard({
  userName,
  userEmail,
  userRole,
  setPage,
  logout,
}) {

  return (
    <div className="dashboard-shell min-h-screen bg-slate-950 text-white flex">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar w-64 bg-slate-900 border-r border-slate-800 p-5">

        <div className="flex items-center gap-3 mb-10">

          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">

            <Brain
              className="text-slate-950"
              size={24}
            />

          </div>


          <div>

            <h1 className="text-xl font-bold">
              AttriSense
            </h1>

            <p className="text-xs text-slate-400">
              HR Analytics
            </p>

          </div>

        </div>


        <nav className="space-y-2">

          <button
            onClick={() =>
              setPage("dashboard")
            }
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>


          <button
            onClick={() =>
              setPage("prediction")
            }
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <UserSearch size={19} />
            Prediction
          </button>


          <button
            onClick={() => setPage("employees")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <Users size={19} />
            Employees
          </button>

        </nav>


        <div className="mt-10 pt-6 border-t border-slate-800">

          <button
            onClick={() => setPage("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg"
          >
            <Settings size={19} />
            Settings
          </button>


          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="dashboard-main flex-1">

        <header className="dashboard-header h-20 border-b border-slate-800 flex items-center justify-between px-8">

          <div>

            <h2 className="text-2xl font-semibold">
              Employee Attrition Dashboard
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Monitor employee retention and identify attrition risks
            </p>

          </div>


          <div className="flex items-center gap-5">

            <Bell
              className="text-slate-400"
              size={21}
            />


            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                {getInitial(userName)}
              </div>


              <div>

                <p className="text-sm font-medium">
                  {userName}
                </p>

                <p className="text-xs text-slate-400">
                  {userRole}
                </p>

              </div>

            </div>

          </div>

        </header>


        <section className="p-8">

          {/* =================================================
              PERSONALIZED WELCOME
          ================================================= */}

          <div className="dashboard-welcome dashboard-glass-panel bg-gradient-to-r from-cyan-500/10 to-slate-900 border border-cyan-500/20 rounded-2xl p-7 mb-7">

            <div className="flex items-start justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                  <Sparkles size={17} />
                  Welcome back
                </div>


                <h1 className="text-3xl font-bold mt-2">
                  {userName}
                </h1>


                <p className="text-slate-400 mt-2">
                  Ready to analyze employee attrition
                  and identify potential retention risks?
                </p>


                {userEmail && (
                  <p className="text-xs text-slate-500 mt-3">
                    Signed in as {userEmail}
                  </p>
                )}

              </div>


              <div className="hidden md:flex w-16 h-16 rounded-2xl bg-cyan-500/10 items-center justify-center">
                <Brain
                  size={32}
                  className="text-cyan-400"
                />
              </div>

            </div>

          </div>


          {/* STAT CARDS */}

          <div className="dashboard-stats grid grid-cols-4 gap-5">

            <StatCard
              title="Total Employees"
              value="1,470"
              subtitle="Workforce size"
              icon={<Users size={22} />}
            />


            <StatCard
              title="Employees Left"
              value="237"
              subtitle="Historical attrition"
              icon={<UserMinus size={22} />}
            />


            <StatCard
              title="Attrition Rate"
              value="16.1%"
              subtitle="Overall workforce"
              icon={<TrendingUp size={22} />}
            />


            <StatCard
              title="ML Prediction"
              value="Ready"
              subtitle="Model available"
              icon={<Activity size={22} />}
            />

          </div>


          {/* CONTENT */}

          <div className="dashboard-content-grid grid grid-cols-3 gap-6 mt-7">

            <div className="dashboard-glass-panel col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">

              <div className="flex justify-between items-center mb-6">

                <div>

                  <h3 className="text-lg font-semibold">
                    Attrition Overview
                  </h3>

                  <p className="text-sm text-slate-400">
                    Employee retention distribution
                  </p>

                </div>


                <span className="text-xs bg-slate-800 px-3 py-2 rounded-lg text-slate-300">
                  Current Dataset
                </span>

              </div>


              <div className="flex items-center justify-center h-56">

                <div className="text-center">

                  <div className="text-5xl font-bold text-cyan-400">
                    83.9%
                  </div>

                  <p className="text-slate-400 mt-2">
                    Employees Retained
                  </p>


                  <div className="mt-6 w-80 h-3 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{
                        width: "83.9%",
                      }}
                    />

                  </div>


                  <div className="flex justify-between text-xs text-slate-500 mt-2">

                    <span>
                      Stayed
                    </span>

                    <span>
                      16.1% Left
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* QUICK PREDICTION */}

            <div className="dashboard-glass-panel bg-slate-900 border border-slate-800 rounded-xl p-6">

              <h3 className="text-lg font-semibold">
                AI Attrition Prediction
              </h3>


              <p className="text-sm text-slate-400 mt-2">
                Use the trained machine learning model
                to predict employee attrition.
              </p>


              <div className="mt-8">

                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">

                  <Brain
                    className="text-cyan-400"
                    size={27}
                  />

                </div>


                <p className="mt-5 text-sm text-slate-300">
                  Enter employee information and let
                  the ML model estimate attrition
                  probability and risk level.
                </p>


                <button
                  onClick={() =>
                    setPage("prediction")
                  }
                  className="mt-6 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  Make Prediction
                  <ArrowRight size={17} />
                </button>

              </div>

            </div>

          </div>


          {/* INSIGHTS */}

          <div className="dashboard-glass-panel mt-7 bg-slate-900 border border-slate-800 rounded-xl p-6">

            <h3 className="text-lg font-semibold">
              Key Attrition Factors
            </h3>


            <p className="text-sm text-slate-400 mt-1">
              Important employee characteristics used
              by the ML model
            </p>


            <div className="grid grid-cols-4 gap-4 mt-6">

              <Factor
                title="OverTime"
                description="Workload & overtime status"
              />

              <Factor
                title="Job Satisfaction"
                description="Employee satisfaction level"
              />

              <Factor
                title="Monthly Income"
                description="Employee compensation"
              />

              <Factor
                title="Years at Company"
                description="Employee tenure"
              />

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


// =====================================================
// ML PREDICTION PAGE
// =====================================================

function PredictionPage({
  setPage,
  userName,
  userEmail,
  logout,
}) {

  const [employee, setEmployee] =
    useState({
      age: "",
      monthlyIncome: "",
      overtime: "No",
      jobSatisfaction: "3",
      yearsAtCompany: "",
      jobLevel: "1",
    });


  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });

    setError("");
  };


  // =====================================================
  // ML PREDICTION
  // =====================================================

  const predict = async (e) => {

    e.preventDefault();

    setError("");
    setResult(null);


    // Validate fields

    if (
      !employee.age ||
      !employee.monthlyIncome ||
      !employee.yearsAtCompany ||
      !employee.jobLevel
    ) {

      setError(
        "Please fill all employee information."
      );

      return;
    }


    setLoading(true);


    try {

      const token =
        localStorage.getItem(
          "attrisense_token"
        ) ||
        sessionStorage.getItem(
          "attrisense_token"
        );


      /*
       * IMPORTANT
       *
       * This frontend sends the employee data
       * to your Node backend.
       *
       * The Node backend is responsible for
       * running predict.py / trained ML model.
       */

      const response = await fetch(
        `${API_BASE_URL}/api/predict`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            age: Number(employee.age),

            monthlyIncome:
              Number(
                employee.monthlyIncome
              ),

            overtime:
              employee.overtime,

            jobSatisfaction:
              employee.jobSatisfaction,

            yearsAtCompany:
              Number(
                employee.yearsAtCompany
              ),

            jobLevel:
              Number(
                employee.jobLevel
              ),
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          data.message ||
          "Prediction failed."
        );
      }


      /*
       * Supports both:
       *
       * {
       *   prediction: "Yes",
       *   attritionProbability: 72.4,
       *   riskLevel: "High Risk"
       * }
       *
       * and
       *
       * {
       *   success: true,
       *   result: {...}
       * }
       */

      const predictionData =
        data.result ||
        data.data ||
        data;

      const probability = Number(
        predictionData.attritionProbability
      );

      let configuredRiskLevel =
        predictionData.riskLevel ||
        "Low Risk";

      try {
        const savedSettings = JSON.parse(
          localStorage.getItem("attrisense_settings") || "{}"
        );

        const mediumThreshold = Number(
          savedSettings.mediumRiskThreshold ?? 30
        );

        const highThreshold = Number(
          savedSettings.highRiskThreshold ?? 60
        );

        if (Number.isFinite(probability)) {
          if (probability >= highThreshold) {
            configuredRiskLevel = "High Risk";
          } else if (probability >= mediumThreshold) {
            configuredRiskLevel = "Medium Risk";
          } else {
            configuredRiskLevel = "Low Risk";
          }
        }
      } catch (settingsError) {
        console.warn(
          "Unable to apply saved risk settings:",
          settingsError
        );
      }

      setResult({
        prediction:
          predictionData.prediction,

        attritionProbability:
          probability,

        riskLevel:
          configuredRiskLevel,
      });

      try {
        const history = JSON.parse(
          localStorage.getItem("attrisense_prediction_history") || "[]"
        );

        history.unshift({
          timestamp: new Date().toISOString(),
          probability,
          prediction: predictionData.prediction,
          riskLevel: configuredRiskLevel,
        });

        localStorage.setItem(
          "attrisense_prediction_history",
          JSON.stringify(history.slice(0, 20))
        );
      } catch (historyError) {
        console.warn(
          "Unable to save prediction history:",
          historyError
        );
      }

    } catch (err) {

      console.error(
        "ML prediction error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to the ML prediction service."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // RESET
  // =====================================================

  const resetPrediction = () => {

    setEmployee({
      age: "",
      monthlyIncome: "",
      overtime: "No",
      jobSatisfaction: "3",
      yearsAtCompany: "",
      jobLevel: "1",
    });

    setResult(null);
    setError("");
  };


  return (
    <div className="dashboard-shell min-h-screen bg-slate-950 text-white flex">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar w-64 bg-slate-900 border-r border-slate-800 p-5">

        <div className="flex items-center gap-3 mb-10">

          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">

            <Brain
              className="text-slate-950"
              size={24}
            />

          </div>


          <div>

            <h1 className="text-xl font-bold">
              AttriSense
            </h1>

            <p className="text-xs text-slate-400">
              HR Analytics
            </p>

          </div>

        </div>


        <nav className="space-y-2">

          <button
            onClick={() =>
              setPage("dashboard")
            }
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>


          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400"
          >
            <UserSearch size={19} />
            Prediction
          </button>

          <button onClick={() => setPage("employees")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800">
            <Users size={19} />
            Employees
          </button>

        </nav>


        <div className="mt-10 pt-6 border-t border-slate-800">

          <button
            onClick={() => setPage("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg"
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="dashboard-main flex-1">

        <header className="dashboard-header h-20 border-b border-slate-800 flex items-center justify-between px-8">

          <div>

            <h2 className="text-2xl font-semibold">
              Employee Attrition Prediction
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Analyze employee information using
              the trained ML model
            </p>

          </div>


          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              {getInitial(userName)}
            </div>


            <div>

              <p className="text-sm font-medium">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                {userEmail}
              </p>

            </div>

          </div>

        </header>


        <section className="p-8">

          {/* INFO */}

          <div className="dashboard-glass-panel max-w-4xl mb-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">

            <div className="flex items-start gap-4">

              <div className="w-10 h-10 shrink-0 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                <Brain
                  size={21}
                  className="text-cyan-400"
                />

              </div>


              <div>

                <h3 className="font-semibold">
                  AI-powered prediction
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Your employee information will be
                  processed by the trained AttriSense
                  machine learning model to estimate
                  attrition probability and risk level.
                </p>

              </div>

            </div>

          </div>


          {/* FORM */}

          <form
            onSubmit={predict}
            className="max-w-4xl bg-slate-900 border border-slate-800 rounded-xl p-7"
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-xl font-semibold">
                  Employee Information
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Enter the required employee attributes
                </p>

              </div>


              <Activity
                className="text-cyan-400"
                size={24}
              />

            </div>


            <div className="grid grid-cols-2 gap-5 mt-6">

              <Input
                label="Age"
                name="age"
                value={employee.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                min="18"
                max="70"
              />


              <Input
                label="Monthly Income"
                name="monthlyIncome"
                value={
                  employee.monthlyIncome
                }
                onChange={handleChange}
                placeholder="e.g. 5000"
                min="0"
              />


              <Input
                label="Years at Company"
                name="yearsAtCompany"
                value={
                  employee.yearsAtCompany
                }
                onChange={handleChange}
                placeholder="e.g. 5"
                min="0"
                max="50"
              />


              <Input
                label="Job Level"
                name="jobLevel"
                value={employee.jobLevel}
                onChange={handleChange}
                placeholder="1 - 5"
                min="1"
                max="5"
              />


              <Select
                label="OverTime"
                name="overtime"
                value={employee.overtime}
                onChange={handleChange}
                options={[
                  "No",
                  "Yes",
                ]}
              />


              <Select
                label="Job Satisfaction"
                name="jobSatisfaction"
                value={
                  employee.jobSatisfaction
                }
                onChange={handleChange}
                options={[
                  "1",
                  "2",
                  "3",
                  "4",
                ]}
              />

            </div>


            {error && (

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">

                <XCircle
                  size={19}
                  className="text-red-400 shrink-0 mt-0.5"
                />

                <p className="text-sm text-red-300">
                  {error}
                </p>

              </div>

            )}


            <div className="flex gap-3 mt-7">

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg flex items-center gap-2"
              >

                {loading ? (
                  <>
                    <Activity
                      size={17}
                      className="animate-spin"
                    />
                    Running ML Model...
                  </>
                ) : (
                  <>
                    <Brain size={17} />
                    Predict Attrition
                  </>
                )}

              </button>


              <button
                type="button"
                onClick={resetPrediction}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Reset
              </button>

            </div>

          </form>


          {/* RESULT */}

          {result && (

            <div className="dashboard-glass-panel max-w-4xl mt-6 bg-slate-900 border border-slate-800 rounded-xl p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Machine Learning Prediction
                  </p>

                  <h2
                    className={`text-4xl font-bold mt-3 ${
                      result.riskLevel ===
                      "High Risk"
                        ? "text-red-400"
                        : result.riskLevel ===
                          "Medium Risk"
                        ? "text-yellow-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {result.riskLevel}
                  </h2>

                </div>


                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    result.prediction === "Yes"
                      ? "bg-red-500/10"
                      : "bg-cyan-500/10"
                  }`}
                >

                  {result.prediction ===
                  "Yes" ? (
                    <AlertTriangle
                      size={27}
                      className="text-red-400"
                    />
                  ) : (
                    <CheckCircle2
                      size={27}
                      className="text-cyan-400"
                    />
                  )}

                </div>

              </div>


              <div className="grid grid-cols-2 gap-5 mt-7">

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">

                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Attrition Prediction
                  </p>

                  <p
                    className={`text-2xl font-bold mt-2 ${
                      result.prediction ===
                      "Yes"
                        ? "text-red-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {result.prediction ===
                    "Yes"
                      ? "Likely to Leave"
                      : "Likely to Stay"}
                  </p>

                </div>


                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">

                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Attrition Probability
                  </p>

                  <p className="text-2xl font-bold mt-2 text-white">
                    {Number.isFinite(
                      result.attritionProbability
                    )
                      ? `${result.attritionProbability}%`
                      : "N/A"}
                  </p>

                </div>

              </div>


              <div className="mt-6">

                <div className="flex justify-between text-xs text-slate-500 mb-2">

                  <span>
                    Risk Probability
                  </span>

                  <span>
                    {Number.isFinite(
                      result.attritionProbability
                    )
                      ? `${result.attritionProbability}%`
                      : ""}
                  </span>

                </div>


                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${
                      result.riskLevel ===
                      "High Risk"
                        ? "bg-red-400"
                        : result.riskLevel ===
                          "Medium Risk"
                        ? "bg-yellow-400"
                        : "bg-cyan-400"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(
                          Number(
                            result.attritionProbability
                          ) || 0,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>


              <div className="mt-6 p-4 rounded-lg bg-slate-800/40">

                <p className="text-sm text-slate-300">

                  {result.riskLevel ===
                  "High Risk"
                    ? "The ML model indicates a higher probability of employee attrition. HR may want to review relevant retention factors."
                    : result.riskLevel ===
                      "Medium Risk"
                    ? "The ML model indicates a moderate attrition probability. Consider reviewing the employee's workload, satisfaction and career factors."
                    : "The ML model indicates a lower probability of attrition for the provided employee profile."}

                </p>

              </div>


              <p className="text-xs text-slate-500 mt-5">
                Prediction is an analytical aid and
                should be considered alongside human
                judgment and employee context.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


// =====================================================
// INPUT
// =====================================================

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
}) {

  return (
    <div>

      <label className="text-sm text-slate-300">
        {label}
      </label>


      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        required
        className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-cyan-400"
      />

    </div>
  );
}


// =====================================================
// SELECT
// =====================================================

function Select({
  label,
  name,
  value,
  onChange,
  options,
}) {

  return (
    <div>

      <label className="text-sm text-slate-300">
        {label}
      </label>


      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-cyan-400"
      >

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
}) {

  return (
    <div className="dashboard-stat-card bg-slate-900 border border-slate-800 rounded-xl p-5">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>


          <h3 className="text-3xl font-bold mt-2">
            {value}
          </h3>


          <p className="text-xs text-slate-500 mt-2">
            {subtitle}
          </p>

        </div>


        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
}


// =====================================================
// FACTOR
// =====================================================

function Factor({
  title,
  description,
}) {

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">

      <p className="font-medium">
        {title}
      </p>


      <p className="text-xs text-slate-400 mt-1">
        {description}
      </p>

    </div>
  );
}


// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  title,
  text,
}) {

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

      <h3 className="text-lg font-semibold text-cyan-400">
        {title}
      </h3>


      <p className="text-sm text-slate-400 mt-3">
        {text}
      </p>

    </div>
  );
}


// =====================================================
// HELPERS
// =====================================================

function getInitial(name) {

  if (!name) return "U";

  return name
    .trim()
    .charAt(0)
    .toUpperCase();
}


export default App;