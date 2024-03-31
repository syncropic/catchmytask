import MonacoEditor from "@components/MonacoEditor";
import { ITrip } from "@components/interfaces";

export const ViewJson = ({ item }: { item: ITrip }) => {
  return (
    <>
      <MonacoEditor values={item}></MonacoEditor>
    </>
  );
};

export default ViewJson;
