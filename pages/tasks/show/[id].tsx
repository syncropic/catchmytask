import { IResourceComponentsProps, useShow, useOne } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { Title } from "@mantine/core";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { data: nameData, isLoading: nameIsLoading } = useOne({
    resource: "names",
    id: record?.name || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const { data: statusData, isLoading: statusIsLoading } = useOne({
    resource: "statuses",
    id: record?.status || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Title my="xs" order={5}>
        Author
      </Title>
      <TextField value={record?.author} />
      <Title my="xs" order={5}>
        Created At
      </Title>
      <DateField value={record?.created_at} />
      <Title my="xs" order={5}>
        Description
      </Title>
      <TextField value={record?.description} />
      <Title my="xs" order={5}>
        Id
      </Title>
      <TextField value={record?.id} />
      <Title my="xs" order={5}>
        Name
      </Title>
      {nameIsLoading ? <>Loading...</> : <>{nameData?.data?.name}</>}
      <Title my="xs" order={5}>
        Status
      </Title>
      {statusIsLoading ? <>Loading...</> : <>{statusData?.data?.name}</>}
    </Show>
  );
};
export default PageShow;
