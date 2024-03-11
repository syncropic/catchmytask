import CodeBlock from "@components/codeblock/codeblock";
import { Button, Group, HoverCard } from "@mantine/core";
import { IconList } from "@tabler/icons-react";

function TargetComponent({ data, resource }: any) {
  if (data.length > 0) {
    // console.log(resource);
    return (
      <HoverCard.Target>
        <Button leftIcon={<IconList></IconList>} size="xs" variant="outline">
          {/* {getTravelers(data)} */}
          {`${data.length} ${resource}`}
        </Button>
      </HoverCard.Target>
    );
  }
  return <div></div>;
}

function Reveal({ value, resource }: { value: any; resource: string }) {
  //   console.log(data);
  let data_items = [];
  if (value?.length > 0) {
    // console.log(JSON.parse(data?.data));
    data_items = JSON.parse(value);
    // console.log(resource);
  }
  return (
    // <div>hello</div>
    <Group>
      <HoverCard width={600} shadow="md" withinPortal={true}>
        <TargetComponent
          data={data_items}
          resource={resource}
        ></TargetComponent>
        <HoverCard.Dropdown>
          <CodeBlock jsonData={data_items}></CodeBlock>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}

export default Reveal;
