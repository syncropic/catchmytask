import { IResourceComponentsProps, useShow, useOne } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { MantineProvider, Title } from "@mantine/core";
import React, { useMemo, useState } from "react";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <>
      <Show isLoading={isLoading}>
        <Title my="xs" order={5}>
          Id
        </Title>
        <TextField value={record?.id} />
        <Title my="xs" order={5}>
          Name
        </Title>
        <TextField value={record?.name} />
      </Show>
    </>
  );
};
export default PageShow;