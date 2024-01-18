import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { MantineProvider, Title, Text } from "@mantine/core";
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
        <Text>
          <b>Id :</b> {record?.id}
        </Text>
        <Text>
          <b>Name :</b> {record?.name}
        </Text>
        <Text>
          <b>Description :</b> {record?.description}
        </Text>
        <Text>
          <b>Tag :</b> {record?.description}
        </Text>
      </Show>
    </>
  );
};
export default PageShow;
