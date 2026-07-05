import { useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import authService from "../services/authService";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await authService.getProfile();

                if (response.data.success) {
                    setUser(response.data.data);
                }
            } catch {
                setUser(null);
            } finally {
                setInitializing(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError("");

        try {
            const response = await authService.login(email, password);

            const user = response.data.data;

            setUser(user);

            localStorage.setItem("userId", user.userId);
            localStorage.setItem("email", user.email);
            localStorage.setItem("role", user.role);

            return {
                success: true,
                user
            };
        } catch (err) {
            let message = "Không thể kết nối máy chủ.";

            if (err.response?.data) {
                const code = err.response.data.errorCode;

                switch (code) {
                    case 1001:
                    case 2001:
                        message = "Email hoặc mật khẩu không chính xác.";
                        break;

                    case 1002:
                        message = "Tài khoản đang bị khóa.";
                        break;

                    case 1003:
                        message = "Tài khoản đã bị vô hiệu hóa.";
                        break;

                    default:
                        message =
                            err.response.data.message || "Đăng nhập thất bại.";
                }
            }

            setError(message);

            return {
                success: false
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error(err);
        }

        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                initializing,
                error,
                setError,

                login,
                logout,

                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}