import { useMemo, useState } from "react";

export default function useTransactionFilter(transactions = []) { // Thêm default value = [] để tránh lỗi undefined
    const [filterSearch, setFilterSearch] = useState("");
    const [filterDate, setFilterDate] = useState("ALL");
    const [filterType, setFilterType] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const filteredTransactions = useMemo(() => {
        if (!transactions || transactions.length === 0) return []; // Thêm dòng chặn mảng rỗng ban đầu

        return transactions.filter(tx => {
            const keyword = filterSearch.toLowerCase();

            // Sửa đổi: Đảm bảo ép kiểu String an toàn trước khi gọi toLowerCase()
            const matchSearch =
                (tx.id ? String(tx.id).toLowerCase().includes(keyword) : false) ||
                (tx.recipient ?? "").toLowerCase().includes(keyword) ||
                String(tx.amount).includes(keyword);

            const matchType =
                filterType === "ALL" || tx.type === filterType;

            const matchStatus =
                filterStatus === "ALL" || tx.status === filterStatus;

            let matchDate = true;

            if (filterDate !== "ALL") {
                const txDate = new Date(tx.date);
                const now = new Date();

                if (filterDate === "TODAY") {
                    matchDate =
                        txDate.toDateString() === now.toDateString();
                }

                if (filterDate === "WEEK") {
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    matchDate = txDate >= weekAgo;
                }

                if (filterDate === "MONTH") {
                    matchDate =
                        txDate.getMonth() === now.getMonth() &&
                        txDate.getFullYear() === now.getFullYear();
                }
            }

            return (
                matchSearch &&
                matchType &&
                matchStatus &&
                matchDate
            );
        });
    }, [
        transactions,
        filterSearch,
        filterDate,
        filterType,
        filterStatus
    ]);

    const totalIn = useMemo(
        () =>
            filteredTransactions
                .filter(
                    tx =>
                        tx.direction === "IN" &&
                        tx.status === "SUCCESS"
                )
                .reduce((sum, tx) => sum + tx.amount, 0),
        [filteredTransactions]
    );

    const totalOut = useMemo(
        () =>
            filteredTransactions
                .filter(
                    tx =>
                        tx.direction === "OUT" &&
                        tx.status === "SUCCESS"
                )
                .reduce((sum, tx) => sum + tx.amount, 0),
        [filteredTransactions]
    );

    return {
        filteredTransactions,

        filterSearch,
        setFilterSearch,

        filterDate,
        setFilterDate,

        filterType,
        setFilterType,

        filterStatus,
        setFilterStatus,

        totalIn,
        totalOut,
        totalTransactions: filteredTransactions.length
    };
}