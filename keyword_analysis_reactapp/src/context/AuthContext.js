import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const getInitialTokens = () => {
    try {
      const stored = localStorage.getItem("authTokens");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getInitialUser = () => {
    try {
      const tokens = getInitialTokens();
      return tokens?.access ? jwtDecode(tokens.access) : null;
    } catch {
      return null;
    }
  };

  const [authTokens, setAuthTokens] = useState(getInitialTokens);
  const [user, setUser] = useState(getInitialUser);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: e.target.username.value,
          password: e.target.password.value,
        }),
      });
      const data = await response.json();

      if (response.ok && data.access) {
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));
        navigate(from, { replace: true });
      } else {
        alert(data.detail || "帳號或密碼錯誤，請重新輸入！");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("無法連接伺服器，請稍後再試！");
    }
  };

  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    navigate("/Login");
  }, [navigate]);

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: e.target.username.value,
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });
      const data = await response.json();

      if (response.status === 201) {
        alert("註冊成功！請使用新帳號登入。");
        navigate("/Login");
      } else {
        const errorMsg = data.error || (typeof data === "object" ? Object.values(data).flat().join("\n") : "請輸入正確資料！");
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("註冊失敗，請確認網路連線或稍後再試！");
    }
  };

  useEffect(() => {
    if (authTokens?.access) {
      try {
        setUser(jwtDecode(authTokens.access));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [authTokens]);

  const contextData = {
    user,
    authTokens,
    setAuthTokens,
    setUser,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};
