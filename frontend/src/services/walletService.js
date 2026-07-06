import axiosClient from "../api/axiosClient";

const walletService = {

    getProfile() {
        return axiosClient.get("/users/profile");
    },

    getBalance() {
        return axiosClient.get("/wallets/balance");
    },

    getTransactions() {
        return axiosClient.get("/transactions/history");
    }

};

export default walletService;