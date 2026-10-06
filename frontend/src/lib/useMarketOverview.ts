import { useQuery } from "@tanstack/react-query";
import { switchyardService } from "@/services/switchyard";

// The live market snapshot shared by the home hero and the global reach section: one cache
// entry, refreshed every minute.
export function useMarketOverview() {
  return useQuery({ queryKey: ["market-overview"], queryFn: switchyardService.getMarketOverview, retry: false, staleTime: 60_000, refetchInterval: 60_000 });
}
