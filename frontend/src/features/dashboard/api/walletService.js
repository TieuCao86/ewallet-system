import axiosClient from "../../../api/axiosClient.js";

const walletService = {
    // 1. Lấy thông tin lõi Dashboard (Chỉ gồm Profile, Ví, Banner quảng cáo - Tốc độ < 10ms)
    getDashboardCore() {
        return axiosClient.get("/dashboard");
    },

    // 2. MỚI BỔ SUNG: Lấy dữ liệu thống kê Quản lý tài chính (Thu/Chi của 3 tháng gần nhất)
    // Tách riêng để kích hoạt cơ chế Lazy Load ở Frontend, tránh nghẽn luồng DB chính
    getFinancialStats() {
        return axiosClient.get("/dashboard/financials");
    },

    // 3. Lấy số dư ví (Dùng riêng khi cần cập nhật nhanh số dư lẻ sau giao dịch)
    getBalance() {
        return axiosClient.get("/wallets/balance");
    },

    // 4. Lấy danh sách ngân hàng user ĐÃ liên kết (Lazy Load khi vào tab Thẻ hoặc mở Modal)
    getLinkedBanks() {
        return axiosClient.get("/banks");
    },

    // 5. Lấy danh mục ngân hàng MASTER của toàn hệ thống (Để chọn khi tạo liên kết mới)
    getMasterBanks() {
        return axiosClient.get("/banks/master");
    },

    // 6. Lấy lịch sử giao dịch phân trang (Dùng cho luồng cuộn vô hạn Infinity Scroll)
    getTransactions(page = 0, size = 10) {
        return axiosClient.get("/transactions/history", {
            params: { page, size }
        });
    }
};

export default walletService;