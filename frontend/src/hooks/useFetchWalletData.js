import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useFetchWalletData() {
    const [userProfile, setUserProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState("");

    // Tải dữ liệu Dashboard Core
    const loadCoreData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/dashboard', { withCredentials: true });
            const dashboardData = response.data?.data;

            if (dashboardData) {
                setUserProfile({
                    fullName: dashboardData.fullName,
                    email: dashboardData.email,
                    kycStatus: dashboardData.kycStatus,
                });

                setWallet({
                    walletId: dashboardData.walletNumber,
                    balance: dashboardData.balance,
                    currency: "đ",
                    monthExpense: dashboardData.monthExpense,
                    monthIncome: dashboardData.monthIncome,
                    prevMonthExpense: dashboardData.prevMonthExpense,
                    prevMonthIncome: dashboardData.prevMonthIncome
                });
                setIsLive(true);
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu Dashboard:", err);
            setError("Không thể kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        setLoading(true);
        setError("");
        loadCoreData();
    }, [loadCoreData]);

    useEffect(() => {
        loadCoreData();
    }, [loadCoreData]);

    return {
        userProfile,
        setUserProfile,
        wallet,
        setWallet,
        loading,
        error,
        isLive,
        refresh: handleRefresh
    };
}