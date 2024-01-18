import { Sider } from "@refinedev/mantine";

export const CustomSider = () => {
  return (
    <Sider
      render={({ items, logout, collapsed }) => {
        return (
          <>
            {/* <div>My Custom Element</div> */}
            {items}
            {logout}
          </>
        );
      }}
    />
  );
};
