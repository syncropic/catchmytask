import React, { useEffect, useState } from "react";
import ListView from "@components/ListView";
import {
  extractIdentifier,
  replacePlaceholdersInObject,
} from "@components/Utils";
import { IView, IViewItem } from "@components/interfaces";
import { useAppStore } from "src/store";

const ViewActionHistory = () => {
  const { activeAction, activeRecord } = useAppStore();

  const [listItemFormatted, setListItemFormatted] = useState<IView | null>(
    null
  );
  console.log("listItemFormatted", listItemFormatted);

  useEffect(() => {
    const listItem = activeAction?.show?.find(
      (item: IViewItem) => item.name === "action_history"
    );

    if (listItem && listItem.view_id) {
      const formatted = replacePlaceholdersInObject(listItem, {
        action_name: activeAction?.name,
        record_id: extractIdentifier(activeRecord)?.id,
      });

      setListItemFormatted(formatted);
    } else {
      setListItemFormatted(null);
    }
  }, [activeAction, activeRecord]);

  return <>{listItemFormatted && <ListView item={listItemFormatted} />}</>;
};

export default ViewActionHistory;
