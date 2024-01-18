import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { MantineProvider, Title } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { useParsed } from "@refinedev/core";
import { addSeparator } from "src/utils";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParsed();
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
      </Show>
    </>
  );
};
export default PageShow;
