// src/api/transactionApi.js
import axiosClient from "./axiosClient";

const transactionApi = {
    // ==========================================
    // 1. LUỒNG CHUYỂN TIỀN (TRANSFER)
    // ==========================================

    /**
     * Bước 1: Khởi tạo chuyển tiền (Xác thực PIN -> Gửi OTP)
     * @param {Object} data { receiverPhone, amount, description, pin }
     */
    initiateTransfer: (data) => {
        return axiosClient.post("/transactions/transfer/initiate", data);
    },

    /**
     * Bước 2: Xác thực OTP và thực hiện chuyển tiền
     * @param {Object} data { receiverPhone, amount, description, pin }
     * @param {string} otp Mã xác thực 6 chữ số
     */
    confirmTransfer: (data, otp) => {
        return axiosClient.post(`/transactions/transfer/confirm`, data, {
            params: { otp } // Truyền ?otp=xxxxxx dưới dạng query parameter như API Backend
        });
    },

    // ==========================================
    // 2. LUỒNG NẠP TIỀN (TOPUP / DEPOSIT)
    // ==========================================

    /**
     * Bước 1: Khởi tạo nạp tiền (Xác thực PIN -> Gửi OTP)
     * @param {Object} data { bankId, amount, pin }
     */
    initiateDeposit: (data) => {
        return axiosClient.post("/banks/deposit/initiate", data);
    },

    /**
     * Bước 2: Xác thực OTP và hoàn tất nạp tiền
     * @param {Object} data { bankId, amount, pin }
     * @param {string} otp Mã xác thực 6 chữ số
     */
    confirmDeposit: (data, otp) => {
        return axiosClient.post(`/banks/deposit/confirm`, data, {
            params: { otp }
        });
    },

    // ==========================================
    // 3. LUỒNG RÚT TIỀN (WITHDRAW)
    // ==========================================

    /**
     * Bước 1: Khởi tạo rút tiền (Xác thực PIN -> Gửi OTP)
     * @param {Object} data { bankId, amount, pin }
     */
    initiateWithdraw: (data) => {
        return axiosClient.post("/banks/withdraw/initiate", data);
    },

    /**
     * Bước 2: Xác thực OTP và hoàn tất rút tiền
     * @param {Object} data { bankId, amount, pin }
     * @param {string} otp Mã xác thực 6 chữ số
     */
    confirmWithdraw: (data, otp) => {
        return axiosClient.post(`/banks/withdraw/confirm`, data, {
            params: { otp }
        });
    },
};

export default transactionApi;