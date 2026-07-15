// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "../features/auth/api/authService.js";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const queryClient = useQueryClient();

    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ["user-profile-core"],
        queryFn: async () => {
            try {
                const res = await authService.getProfile();
                return res.data?.data || null;
            } catch (err) {
                return null; // Trả về null nếu chưa đăng nhập hoặc cookie hết hạn
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Đồng bộ trạng thái user từ Cache RAM React Query
    useEffect(() => {
        if (profileData) {
            setUser(profileData);
        } else {
            setUser(null);
        }
    }, [profileData]);

    const loginHandler = async (email, password) => {
        setIsActionLoading(true);
        setError("");
        try {
            const response = await authService.login(email, password);
            const responseData = response.data;

            if (responseData?.success) {
                const loggedInUser = responseData.data;
                setUser(loggedInUser);

                // Nạp nóng dữ liệu user vừa đăng nhập vào Cache của React Query
                queryClient.setQueryData(["user-profile-core"], loggedInUser);

                return { success: true, user: loggedInUser };
            } else {
                setError(responseData?.message || "Đăng nhập thất bại.");
                return { success: false };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Không thể kết nối đến máy chủ.";
            setError(errMsg);
            return { success: false };
        } finally {
            setIsActionLoading(false);
        }
    };

    // Hàm xử lý đăng xuất
    const logoutHandler = async () => {
        setIsActionLoading(true);
        try {
            await authService.logout();
        } catch (err) {
            console.error("Lỗi đăng xuất:", err);
        } finally {
            setUser(null);
            queryClient.clear(); // Xóa sạch toàn bộ Cache React Query để bảo mật dữ liệu ví
            localStorage.clear();
            setIsActionLoading(false);
            window.location.href = "/login";
        }
    };

    const isAuthChecked = !isProfileLoading;

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthChecked,
            loading: isActionLoading,
            error,
            setError,
            login: loginHandler,
            logout: logoutHandler
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;