import { forwardRef } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Avatar, Text, UnstyledButton } from "@mantine/core";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name: string;
  email: string;
  icon?: React.ReactNode;
}

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, ...others }: UserButtonProps, ref) => (
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
        {icon || <IconChevronRight size="1rem" />}
      </div>
    </UnstyledButton>
  )
);

export default UserButton;
