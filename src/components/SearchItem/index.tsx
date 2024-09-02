import { Group, Text } from "@mantine/core";

// Define the type for the option object
// interface SearchItemOption {
//   value: string;
//   entity_type: string;
//   label: string;
//   description: string;
//   author_id: string;
// }

// Helper function to truncate the description to a word limit
const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return text;
};

// Custom rendering for each search result
const renderSearchItem = (props: any) => {
  const { value, entity_type, label, description, author_id } = props?.option;

  // Find the position of the entity_type in the value
  const startIndex = value.indexOf(entity_type);
  const endIndex = startIndex + entity_type?.length;

  // Truncate the description to 100 words
  const truncatedDescription = truncateText(description, 20);
  const truncatedLabel = truncateText(label, 10);

  return (
    <Group
      //   spacing="xs"
      //   direction="column"
      align="flex-start"
      className="flex flex-col gap-0"
    >
      {/* First row: Display the name */}
      <Text size="sm" fw={500}>
        {truncatedLabel}
      </Text>

      {/* Second row: Display the formatted value and author_id */}
      <Text size="xs" color="dimmed">
        {value.substring(0, startIndex)}
        <span className="text-[#218ce2] font-bold">
          {value.substring(startIndex, endIndex)}
        </span>
        {value.substring(endIndex)}
        {" • "} {/* Separator between value and author ID */}
        <Text size="xs" color="teal" component="span">
          {author_id}
        </Text>
      </Text>

      {/* Third row: Display the truncated description */}
      <Text size="xs" color="dimmed">
        {truncatedDescription}
      </Text>
    </Group>
  );
};

export default renderSearchItem;
