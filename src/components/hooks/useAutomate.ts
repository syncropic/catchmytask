import { useCustom } from "@refinedev/core";
import { useAppStore } from "src/store";

export function useAutomate(state: any) {
  const { runtimeConfig: config } = useAppStore();
  // pop out frequently changing search_term or other part of state i don't want to trigger a new fetch/use in queryKey
  // const { search_term, ...rest } = state;

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/automate`,
    method: "post",
    config: {
      payload: {
        ...state,
      },
    },
    queryOptions: {
      queryKey: [`useAutomate_${JSON.stringify(state)}`],
    },
  });

  return { data, isLoading, error, isError };
}
