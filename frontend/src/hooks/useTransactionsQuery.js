import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

// Hàm map dữ liệu giống hệt bản cũ của bạn
const mapTransactionData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
        id: item.transactionCode,
        recipient: item.otherPartyName || "Hệ thống",
        amount: Number(item.amount),
        fee: Number(item.fee ?? 0),
        type: item.type,
        status: item.status,
        direction: item.direction,
        description: item.description || "Không có nội dung",
        date: item.createdAt ? item.createdAt.replace("T", " ").substring(0, 19) : ""
    }));
};

export function useTransactionsQuery(enabled = true) {
    return useInfiniteQuery({
        queryKey: ["transactions"],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await axios.get(
                `http://localhost:8080/api/transactions?page=${pageParam}&size=10`,
                { withCredentials: true }
            );
            const pageData = response.data?.data;
            const transactionList = pageData?.content || [];

            return {
                data: mapTransactionData(transactionList),
                hasMore: !(pageData?.last === true || transactionList.length < 10),
                currentPage: pageParam
            };
        },
        enabled: enabled, // Giữ nguyên điều kiện bật/tắt
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.currentPage + 1 : undefined,

        // Bổ sung các cấu hình này để tránh tự động fetch ngầm khi tab vừa bật lên hoặc window focus
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}