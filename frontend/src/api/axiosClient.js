// src/api/axiosClient.js

import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    withCredentials: true, // Gửi Cookie HttpOnly
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // Nếu sau này dùng JWT thay vì Cookie:
        //
        // const token = localStorage.getItem("accessToken");
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        if (!error.response) {
            console.error("Không thể kết nối đến máy chủ.");
            return Promise.reject(error);
        }

        const status = error.response.status;

        switch (status) {
            case 401:
                console.warn("Unauthorized (401)");

                // Nếu sau này có Refresh Token thì xử lý ở đây.

                // Ví dụ:
                // await refreshToken();
                // return axiosClient(error.config);

                break;

            case 403:
                console.warn("Forbidden (403)");
                break;

            case 404:
                console.warn("API không tồn tại.");
                break;

            case 500:
                console.error("Lỗi máy chủ.");
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default axiosClient;