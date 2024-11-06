import { forwardRef } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Avatar, Text, UnstyledButton } from "@mantine/core";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name: string;
  email: string;
  icon?: React.ReactNode;
  opened?: boolean;
}

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, opened, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "var(--mantine-spacing-md)",
        color: "var(--mantine-color-text)",
        borderRadius: "var(--mantine-radius-sm)",
        width: "100%", // Ensure the button takes full width
      }}
      {...others}
    >
      <Avatar src={image} radius="xl" />

      <div className="flex-1 ml-sm hidden lg:flex">
        <div>
          <Text size="sm" fw={500}>
            {name}
          </Text>
          <Text color="dimmed" size="xs">
            {email}
          </Text>
        </div>
      </div>

      <div className="ml-auto hidden lg:flex items-center">
        {icon ||
          (opened ? (
            <IconChevronDown
              size="1rem"
              className="transition-transform duration-200"
            />
          ) : (
            <IconChevronRight
              size="1rem"
              className="transition-transform duration-200"
            />
          ))}
      </div>
    </UnstyledButton>
  )
);

export default UserButton;
