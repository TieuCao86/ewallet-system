import { useCallback } from "react";

export default function useExportCSV(transactions = [], walletId = "") {

    const exportCSV = useCallback(() => {

        const headers = [
            "Ma giao dich",
            "Nguoi nhan/Nguon",
            "Loai giao dich",
            "Thoi gian",
            "Trang thai",
            "So tien (dong)"
        ];

        const rows = transactions.map(tx => [
            tx.id,
            tx.recipient,
            tx.type === "TRANSFER"
                ? "Chuyen tien"
                : tx.type === "TOP_UP"
                    ? "Nap vi"
                    : tx.type === "WITHDRAW"
                        ? "Rut vi"
                        : tx.type,
            tx.date,
            tx.status === "SUCCESS"
                ? "Thanh cong"
                : tx.status === "PENDING"
                    ? "Cho xu ly"
                    : tx.status === "FAILED"
                        ? "That bai"
                        : tx.status,
            tx.amount
        ]);

        const csvContent =
            "\uFEFF" +
            [
                headers.join(","),
                ...rows.map(row =>
                    row.map(value => `"${value}"`).join(",")
                )
            ].join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `VTPay_GD_${walletId}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }, [transactions, walletId]);

    return exportCSV;
}