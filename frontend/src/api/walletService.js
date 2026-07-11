import axiosClient from "./axiosClient.js";

const walletService = {
    getDashboardCore() {
        return axiosClient.get("/dashboard");
    },

    // Lấy số dư ví (Dùng riêng khi cần cập nhật nhanh số dư lẻ)
    getBalance() {
        return axiosClient.get("/wallets/balance");
    },

    // Lấy danh sách ngân hàng user ĐÃ liên kết
    getLinkedBanks() {
        return axiosClient.get("/banks");
    },

    // Lấy danh mục ngân hàng MASTER của toàn hệ thống
    getMasterBanks() {
        return axiosClient.get("/banks/master");
    },

    // Lấy lịch sử giao dịch phân trang (Dùng cho Infinity Scroll Query)
    getTransactions(page = 0, size = 10) {
        return axiosClient.get("/transactions/history", {
            params: { page, size }
        });
    }
};

export default walletService;