import { useQuery } from "@tanstack/react-query";
import walletService from "../api/walletService";

export function useBankQuery(enabled = false) {
    return useQuery({
        queryKey: ["dashboard-banks"],
        queryFn: async () => {
            // Gọi song song qua service
            const [linkedRes, masterRes] = await Promise.all([
                walletService.getLinkedBanks(),
                walletService.getMasterBanks()
            ]);

            return {
                linkedBanks: linkedRes.data?.success ? linkedRes.data.data : [],
                banks: masterRes.data?.success ? masterRes.data.data : []
            };
        },
        staleTime: 10 * 60 * 1000,
        enabled: enabled
    });
}