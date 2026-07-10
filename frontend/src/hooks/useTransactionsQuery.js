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

export function useTransactionsQuery() {
    return useInfiniteQuery({
        queryKey: ["transactions"], // Định danh cache toàn cục
        queryFn: async ({ pageParam = 0 }) => {
            const response = await axios.get(
                `http://localhost:8080/api/transactions?page=${pageParam}&size=10`,
                { withCredentials: true }
            );
            const pageData = response.data?.data;
            const transactionList = pageData?.content || [];

            // Trả về cấu trúc chuẩn để React Query phân trang
            return {
                data: mapTransactionData(transactionList),
                hasMore: !(pageData?.last === true || transactionList.length < 10),
                currentPage: pageParam
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            // Nếu còn dữ liệu thì tăng page lên 1, không thì dừng (trả về undefined)
            return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
        },
        staleTime: 5 * 60 * 1000, // Thần chú: Đổi tab thoải mái trong 5 phút KHÔNG fetch lại
    });
}