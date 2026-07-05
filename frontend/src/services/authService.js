import axiosClient from "../api/axiosClient";

const authService = {

    login(email, password) {
        return axiosClient.post("/auth/login", {
            email,
            password
        });
    },

    register(data) {
        return axiosClient.post("/auth/register", data);
    },

    logout() {
        return axiosClient.post("/auth/logout");
    },

    checkEmail(email) {
        return axiosClient.get("/auth/check-email", {
            params: { email }
        });
    },

    checkPhone(phone) {
        return axiosClient.get("/auth/check-phone", {
            params: { phone }
        });
    },

    getProfile() {
        return axiosClient.get("/users/profile");
    }

};

export default authService;