import { useQuery } from "@tanstack/react-query";
import walletService from "../api/walletService.js";

export function useFinancialsQuery(enabled) {
    return useQuery({
        queryKey: ["dashboard-financials"],
        queryFn: async () => {
            const response = await walletService.getFinancialStats();
            return response.data?.data?.history || null;
        },
        enabled: enabled, // Chỉ kích hoạt chạy khi tab hiện tại là overview
        staleTime: 3 * 60 * 1000, // Dữ liệu thống kê cache trong 3 phút
    });
}