import { Flex, Box } from "@mantine/core";
import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Flex
        style={{
          minHeight: "100vh",
        }}
      >
        <Sidebar />
        <Box
          px="lg"
          h="100%"
          style={{
            flexGrow: "1",
            width: "50%",
          }}
        >
          {children}
        </Box>
      </Flex>
    </>
  );
};

export default Layout;
