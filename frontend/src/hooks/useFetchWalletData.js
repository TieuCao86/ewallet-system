import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Hàm tiện ích dịch dữ liệu Transaction (Đưa ra ngoài hook để tránh re-create khi render)
const mapTransactionData = (data) => {
    return data.map(item => ({
        id: item.transactionCode,
        recipient: item.otherPartyName || "N/A",
        amount: Number(item.amount),
        fee: Number(item.fee ?? 0),
        type: item.type,
        status: item.status,
        direction: item.direction,
        description: item.description || "Không có nội dung",
        date: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : ""
    }));
};

export default function useFetchWalletData() {
    const [userProfile, setUserProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    // Khởi tạo trạng thái loading mặc định là true và error rỗng để không cần gọi lại trong body hàm
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState("");

    // 1. Tải rút gọn 5 giao dịch gần nhất
    const fetchLatestTransactions = useCallback(async (limit = 5) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/transactions?limit=${limit}`, { withCredentials: true });
            const transactionData = response.data?.data;

            if (Array.isArray(transactionData)) {
                setTransactions(mapTransactionData(transactionData));
            }
        } catch (err) {
            console.error("Lỗi tải 5 giao dịch gần nhất:", err);
        }
    }, []);

    // 2. Tải phân trang khi xem lịch sử đầy đủ
    const loadAllTransactions = useCallback(async (page = 1, size = 20) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/transactions?page=${page}&size=${size}`, { withCredentials: true });
            const transactionData = response.data?.data;

            if (Array.isArray(transactionData)) {
                setTransactions(mapTransactionData(transactionData));
            }
        } catch (err) {
            console.error("Lỗi tải phân trang giao dịch:", err);
        }
    }, []);

    // 3. Tải dữ liệu Dashboard Core (Đã loại bỏ các lệnh setState đồng bộ)
    const loadCoreData = useCallback(async () => {
        try {
            const [dashboardRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/wallets/dashboard', { withCredentials: true }),
                axios.get('http://localhost:8080/api/banks/master', { withCredentials: true })
            ]);

            const dashboardData = dashboardRes.data;

            if (dashboardData) {
                setUserProfile({
                    fullName: dashboardData.fullName || "Người dùng VT Pay",
                    email: dashboardData.email,
                    kycStatus: dashboardData.kycStatus || "UNVERIFIED",
                    lastLogin: dashboardData.lastLogin ? dashboardData.lastLogin.replace("T", " ").substring(0, 19) : "Vừa xong",
                });

                setWallet({
                    walletId: dashboardData.walletNumber,
                    balance: dashboardData.balance ?? 0,
                    currency: "đ",
                    monthExpense: dashboardData.monthExpense ?? 0,
                    monthIncome: dashboardData.monthIncome ?? 0,
                    expensePercent: dashboardData.expensePercent ?? 0,
                    transactionCount: dashboardData.transactionCount ?? 0
                });

                setIsLive(true);
            }

            await fetchLatestTransactions(5);

        } catch (err) {
            console.error("Lỗi tải dữ liệu Dashboard Core:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu ví.");
        } finally {
            setLoading(false); // Chỉ gọi bất đồng bộ sau khi API hoàn thành
        }
    }, [fetchLatestTransactions]);

    // Hàm refresh thủ công cho Client gọi khi cần (Sẽ kích hoạt lại trạng thái loading)
    const handleRefresh = useCallback(() => {
        setLoading(true);
        setError("");
        loadCoreData();
    }, [loadCoreData]);

    useEffect(() => {
        const init = async () => {
            await loadCoreData();
        };

        init();
    }, [loadCoreData]);

    return {
        userProfile,
        setUserProfile,
        wallet,
        setWallet,
        transactions,
        setTransactions,
        loading,
        error,
        isLive,
        refresh: handleRefresh,
        loadAllTransactions
    };
}