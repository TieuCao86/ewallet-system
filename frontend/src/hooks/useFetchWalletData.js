import { useState, useEffect } from "react";
import walletService from "../services/walletService";

export default function useFetchWalletData() {

    const [userProfile, setUserProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {

        setLoading(true);
        setError("");

        try {

            const [
                profileRes,
                walletRes,
                transactionRes
            ] = await Promise.all([
                walletService.getProfile(),
                walletService.getBalance(),
                walletService.getTransactions()
            ]);

            // Profile
            const profile = profileRes.data.data;

            if (profile) {

                setUserProfile({
                    fullName: profile.fullName,
                    email: profile.email,
                    phone: profile.phone || "Chưa cập nhật",
                    citizenId: profile.citizenId || "Chưa xác thực",
                    kycStatus: profile.kycStatus || "PENDING",
                    status: profile.status || "ACTIVE",
                    dob: profile.dob || "",
                    gender: profile.gender || "",
                    address: profile.address || "",
                    vipLevel:
                        profile.role === "ADMIN"
                            ? "Administrator"
                            : "Member"
                });

                setIsLive(true);

            }

            // Wallet
            const walletData = walletRes.data.data;

            if (walletData) {

                setWallet({
                    balance: walletData.balance ?? 0,
                    walletId: walletData.walletNumber,
                    currency: "đ"
                });

            }

            // Transactions
            const transactionData = transactionRes.data.data;

            if (Array.isArray(transactionData)) {

                setTransactions(
                    transactionData.map(item => ({
                        id: item.transactionCode,
                        recipient: item.otherPartyName,
                        amount: Number(item.amount),
                        fee: Number(item.fee ?? 0),
                        type: item.type,
                        status: item.status,
                        direction: item.direction,
                        description: item.description,
                        date: item.createdAt
                            ? item.createdAt.replace("T", " ").substring(0, 19)
                            : ""
                    }))
                );

            }

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Không thể tải dữ liệu ví."
            );

        } finally {

            setLoading(false);

        }

    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {

        loadData();

    }, []);

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

        refresh: loadData
    };

}