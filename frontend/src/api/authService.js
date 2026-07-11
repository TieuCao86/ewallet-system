import axiosClient from "./axiosClient.js";

const authService = {
    // Đăng nhập hệ thống (Set HttpOnly Cookie)
    login(email, password) {
        return axiosClient.post("/auth/login", { email, password });
    },

    // Đăng ký tài khoản mới
    register(data) {
        return axiosClient.post("/auth/register", data);
    },

    // Đăng xuất và xóa session
    logout() {
        return axiosClient.post("/auth/logout");
    },

    // Kiểm tra trùng lặp email thời gian thực
    checkEmail(email) {
        return axiosClient.get("/auth/check-email", { params: { email } });
    },

    // Kiểm tra trùng lặp số điện thoại thời gian thực
    checkPhone(phone) {
        return axiosClient.get("/auth/check-phone", { params: { phone } });
    },

    getProfile() {
        return axiosClient.get("/users/profile");
    }
};

export default authService;