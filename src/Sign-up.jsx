import React, { useState } from "react";
import "./styles/signUpPage.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDh1UQ92aWOpYJsCTaYEn66J7V9Pdqvfd4",
  authDomain: "sumbook-ali.firebaseapp.com",
  projectId: "sumbook-ali",
  storageBucket: "sumbook-ali.firebasestorage.app",
  messagingSenderId: "255469526663",
  appId: "1:255469526663:web:60650ecfe8a63c592b2222",
  measurementId: "G-5PDNMHYS02",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
auth.useDeviceLanguage();
const provider = new GoogleAuthProvider();

axios.defaults.withCredentials = true;

const SignUpPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const backendUrl = useSelector((state) => state.url.url);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reusable checkAuth function that uses JWT token in Authorization header
     const checkAuth = async (token) => {
    try {
      const res = await axios.get(
        `${backendUrl}/auth/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.loggedIn) {
        dispatch(login({ uid: res.data.userId, type: res.data.type }));
        navigate("/");
      } else {
        setError("Authentication failed.");
      }
    } catch (error) {
      console.log("Auth check failed", error);
      setError("Authentication check failed.");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/sign-up-email`,
        { email, password, type: "email" },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSignedUp(true);

        const userData = {
          uid: response.data.user.uid,
          type: "email",
          token: response.data.token, // Save the JWT token here
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setError(null);

        await checkAuth(userData.token);
      } else {
        setSignedUp(false);
        setError("Failed to sign up");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
      setSignedUp(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!backendUrl) {
        setError("Backend URL is not defined.");
        return;
      }

      const response = await axios.post(`${backendUrl}/sign-up-google`, {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        type: "google",
      });

      if (response.status === 200) {
        const userData = {
          uid: user.uid,
          type: "google",
          token: response.data.token, // Save the JWT token here too
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setError(null);

        await checkAuth(userData.token);
      }
    } catch (error) {
      console.log("Error during Google Sign In:", error.message);
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="signupPage">
      <div className="signup-container">
        <h2 className="signup-title">Create an Account</h2>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {loading ? (
            <button type="button" className="signup-btn" disabled>
              Loading...
            </button>
          ) : (
            <button
              type="button"
              className="signup-btn"
              onClick={handleSignUp}
            >
              Sign Up
            </button>
          )}

          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            Sign in with Google <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
          </button>

          <div className="signin-link">
            <p>
              Already have an account?{" "}
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                style={{ cursor: "pointer" }}
              >
                Log in
              </a>
            </p>
          </div>
        </form>

        {signedUp && <p className="success-message">Successfully signed up!</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SignUpPage;
