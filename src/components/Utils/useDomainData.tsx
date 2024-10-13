// useDomainData.ts
// This hook fetches domain data and processes it, making the data and the loading/error state available for the components.

import { useFetchDomainDataByDomain } from "@components/Utils";
import { useAppStore } from "src/store";

export const useDomainData = () => {
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);
  const state = {
    domain_url: runtimeConfig?.DOMAIN_URL,
  };

  const {
    data: domainData,
    isLoading,
    error,
  } = useFetchDomainDataByDomain(state);

  let domainRecord = domainData?.data?.find(
    (item: any) => item?.message?.code === "query_success_results"
  )?.data[0];

  return { domainData, isLoading, error, domainRecord };
};
