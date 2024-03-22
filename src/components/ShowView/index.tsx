import TableView from "@components/TableView";
import { IListItem } from "@components/interfaces";
import { Title } from "@mantine/core";
import { useCustom } from "@refinedev/core";
import { EditButton, Show } from "@refinedev/mantine";

interface IActionStep {
  request_object: any;
  id: string;
  status: string;
  updated_at: string;
  created_at: string;
  results: any;
}

interface IActionOption {
  // [key: string]: any;
  request_object: any;
}

type IIdentity = {
  email: string;
};

export const PageShow = ({ active_query, resource }: IListItem) => {
  const { data, isLoading } = useCustom({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
    dataProviderName: "catchmytaskApiDataProvider",
    method: "post",
    config: {
      payload: active_query,
    },
    successNotification: (data, values) => {
      // invalidate({
      //   resource: "caesars_bookings",
      //   invalidates: ["list"],
      // });
      // close();
      return {
        message: `successfully executed.`,
        description: "Success with no errors",
        type: "success",
      };
    },
    errorNotification: (data, values) => {
      return {
        message: `Something went wrong when executing`,
        description: "Error",
        type: "error",
      };
    },
  });

  return (
    <>
      <Show
        goBack={false}
        breadcrumb={null}
        isLoading={isLoading}
        title={<Title order={5}>{resource}</Title>}
        headerButtons={({ defaultButtons }) => (
          <>
            {/* {defaultButtons} */}
            <EditButton resource="general" size="xs" />

            {/* <CloneButton
              size="xs"
              // onClick={() => {
              //   clone("sessions", "123");
              // }}
              resource="general"
              recordItemId={record?.id}
              // meta={{
              //   id: record?.id,
              //   resource: "sessions",
              //   query: { id: record?.id },
              // }}
            >
              Clone
            </CloneButton> */}
          </>
        )}
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* <TableView
              resource={show_item?.resource}
              data_columns={show_item?.fields_configuration}
              data={
                show_item?.data_field
                  ? data?.data[0]?.[show_item.data_field]
                  : data?.data
              }
              isLoading={isLoading}
            ></TableView> */}
            <div>showview</div>
          </>
        )}
      </Show>
    </>
  );
};
export default PageShow;
