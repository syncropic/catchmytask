import {
  Button,
  LoadingOverlay,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { IconSend } from "@tabler/icons-react";

export default function WriteItemForm({}) {
  return (
    <>
      {/* <LoadingOverlay visible={updateItem.isLoading || createItem.isLoading} /> */}
      {/* {JSON.stringify(activeSessionConfig)} */}
      <form
      // onSubmit={form.onSubmit(
      //   mode == "update"
      //     ? (values) => handleUpdateItem(values)
      //     : (values) => handleCreateItem(values),
      //   handleFormError
      // )}
      >
        <div className="flex justify-center">
          <div className="w-full">
            <div className="w-full">
              <Textarea
                placeholder="Chat"
                // leftSection={<IconSend size={16} />}
                autosize={true}
                // minRows={2}
              />
              {/* <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none">
          Send
        </button> */}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
