import "./styles/loginPage.css";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { backendUrl } from "./constant.js";
import { useDispatch, useSelector } from "react-redux";
import { login } from './features/user/userSlice';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Firebase config
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

export default function Login() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user.loggedIn) {
      navigate("/");
    }
  }, [user.loggedIn, navigate]);

  // Common checkAuth using JWT
  const checkAuth = async (token) => {
    try {
      const res = await axios.get(`${backendUrl}/auth/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

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

  const handleEmailLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${backendUrl}/login-email`, {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = {
          uid: response.data.user.uid,
          type: 'email',
          token: response.data.token,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        await checkAuth(userData.token);
      }
    } catch (error) {
      console.error("Email login error:", error);

      if (error.response) {
        if (error.response.data.errors) {
          setError(error.response.data.errors.map(err => err.msg).join(', '));
        } else if (error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Login failed - server error");
        }
      } else if (error.request) {
        setError("No response from server - please try again");
      } else {
        setError("Login failed - please check your connection");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(`${backendUrl}/login-google`, {
        uid: user.uid,
        type: 'google',
      });

      if (response.status === 200) {
        const userData = {
          uid: user.uid,
          type: 'google',
          token: response.data.token,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        await checkAuth(userData.token);
      }
    } catch (error) {
      console.log("Error during Google Sign In:", error.message);
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="loginPage">
      <div className="father">
        <div className="login-container-text">
          <p className="login">Login</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="login-container-inputs">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />

          {loading ? (
            <button type="button" className="register" disabled>
              Loading...
            </button>
          ) : (
            <button type="button" className="register" onClick={handleEmailLogin}>
              Log In
            </button>
          )}

          <button type="button" className="google" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}
