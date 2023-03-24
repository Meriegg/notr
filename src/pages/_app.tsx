import Layout from "@/Components/Layout";
import { ModalsProvider } from "@mantine/modals";
import { MantineProvider } from "@mantine/core";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { type Session } from "next-auth";

import { api } from "@/utils/api";

import "@/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={{
          colorScheme: "dark",
        }}
      >
        <ModalsProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ModalsProvider>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
