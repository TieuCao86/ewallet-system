import { useMemo, useState } from "react";

export default function useTransactionFilter(transactions) {
    const [filterSearch, setFilterSearch] = useState("");
    const [filterDate, setFilterDate] = useState("ALL");
    const [filterType, setFilterType] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const keyword = filterSearch.toLowerCase();

            const matchSearch =
                tx.id.toLowerCase().includes(keyword) ||
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