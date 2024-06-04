import CodeBlock from "@components/codeblock/codeblock";
import { Button, Group, HoverCard, Text } from "@mantine/core";
import { IconList } from "@tabler/icons-react";

// function TargetComponent({ data, resource }: any) {
//   if (data.length > 0) {
//     // console.log(resource);
//     return (
//       <HoverCard.Target>
//         <Button leftIcon={<IconList></IconList>} size="xs" variant="outline">
//           {/* {getTravelers(data)} */}
//           {`${data.length} ${resource}`}
//         </Button>
//       </HoverCard.Target>
//     );
//   }
//   if (data > 0) {
//     // console.log(resource);
//     return (
//       <HoverCard.Target>
//         <Text>
//           {JSON.stringify(data)}
//         </Text>
//       </HoverCard.Target>
//     );
//   }
//   return <div></div>;
// }

function Reveal({
  value,
  resource,
  children,
}: {
  value: any;
  resource: any;
  children: any;
}) {
  // //   console.log(data);
  // let data_items = [];
  // if (value?.length > 0) {
  //   // console.log(JSON.parse(data?.data));
  //   data_items = JSON.parse(value);
  //   // console.log(resource);
  // }
  return (
    <Group>
      <HoverCard width={600} shadow="md" withinPortal={true}>
        <HoverCard.Target>
          <Text>{resource}</Text>
        </HoverCard.Target>
        <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}

export default Reveal;
