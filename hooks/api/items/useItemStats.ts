import useSWRImmutable from "swr/immutable";
import { ItemStats } from "../../../lib/types";
import { fetcher } from "../../../utils/helpers";
import { config } from "../../../config";

export const useItemStats = () => {
  const endpoint = `${config.worker_server_url}/items/fetch-items-stats/`;

  const { data, error, isLoading } = useSWRImmutable(endpoint, (endpoint) =>
    fetcher({
      url: endpoint,
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
  );

  return {
    itemStats: data ? (data.items as ItemStats[]) || [] : [],
    isLoading,
    error
  };
};
