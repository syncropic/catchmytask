// useDomainData.ts
// This hook fetches domain data and processes it, making the data and the loading/error state available for the components.

import { useFetchDomainDataByDomain } from "@components/Utils";
import { useAppStore } from "src/store";

export const useDomainData = () => {
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);
  // const state = {
  //   domain_url: runtimeConfig?.DOMAIN_URL,
  // };

  let query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    domain_url: runtimeConfig?.DOMAIN_URL,
    func_name: "fetch_system_domain_data",
    name: "fetch_system_domain_data",
    // task_id: activeTask?.id,
    // session_id: activeSession?.id,
    // view_id: activeView?.id,
    // profile_id: activeProfile?.id,
    // application_id: activeApplication?.id,
    // user_id: String(user_session?.userProfile?.user?.id),
    // author_id: identity?.email || "guest",
    success_message_code: "fetch_system_domain_data",
  };

  const {
    data: domainData,
    isLoading,
    error,
  } = useFetchDomainDataByDomain(query_state);

  let domainRecord = domainData?.data?.find(
    (item: any) => item?.message?.code === "fetch_system_domain_data"
  )?.data[0];

  return { domainData, isLoading, error, domainRecord };
};
