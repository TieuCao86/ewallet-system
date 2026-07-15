import { useQuery } from "@tanstack/react-query";
import walletService from "../api/walletService.js";

export function useDashboardQuery() {
    return useQuery({
        queryKey: ["dashboard-core"],
        queryFn: async () => {
            const response = await walletService.getDashboardCore();
            const data = response.data?.data;
            if (!data) throw new Error("Dữ liệu trống");

            return {
                userProfile: {
                    fullName: data.fullName,
                    email: data.email,
                    kycStatus: data.kycStatus
                },
                wallet: {
                    walletId: data.walletNumber,
                    balance: data.balance,
                    currency: "đ"
                },
                marketingBanners: data.marketingBanners || [],
                linkedBanks: data.linkedBanks || []
            };
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}