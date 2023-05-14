/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "~/styles/globals.css";

import { Box, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useEffect, useState } from "react";

import AppLayout from "~/layout/AppLayout";
import type { AppType } from "next/app";
import type { ColorScheme } from "@mantine/core";
import Router from "next/router";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import { appWithTranslation } from "next-i18next";
import { useLocalStorage } from "@mantine/hooks";
import { useRouteLoader } from "~/helpers/routeLoader";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useRouteLoader();

  const preferredColorScheme = "dark"; //useColorScheme(); // set initial theme

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      {/* https://stackoverflow.com/questions/74555403/how-to-change-hover-color-in-mantine-ui-menu */}
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          loader: "bars",
          colorScheme,
          fontFamily: `'Lato', sans-serif`,
          headings: {
            fontFamily: `'Open Sans', sans-serif`,
            sizes: {
              h1: { fontSize: "1.66rem" },
            },
          },
          primaryColor: "orange",
          breakpoints: {
            // 1 Spalte
            sm: "38em",
            // 2 Spalten
            md: "58em",
            // 4 Spalten
            lg: "76em",
            // 4 Spalten
            xl: "112em",
            // 6 Spalten
          },
          components: {
            Container: {
              defaultProps: {
                sizes: {
                  xs: 515, //  32em x 16px
                  sm: 720, //  45em x 16px
                  md: 960, //  60em x 16px
                  lg: 1440, //  90em x 16px
                  xl: 1856, // 116em x 16px
                },
              },
            },

            Button: {
              defaultProps: {
                variant: "outline",
              },
              styles: (theme) => ({
                root: {
                  // overriding the tailwind overrides... 👀
                  /* 
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? "#FF4200 !important"
                      : "#FF6600 !important",
                       */
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.gray[0]
                      : theme.black,
                  /* 
                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? "#FF5500 !important"
                        : "#FF7700 !important",
                  },
                   */
                },
              }),
            },
          },
          globalStyles: (theme) => ({
            body: {
              ...theme.fn.fontStyles() /* 
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[1], */,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[1]
                  : theme.colors.gray[8],
              lineHeight: theme.lineHeight,
            },

            "*, *::before, *::after": {
              boxSizing: "border-box",
            },

            /* ".your-class": {
              backgroundColor: "red",
            },

            "#your-id > [data-active]": {
              backgroundColor: "pink",
            }, */
          }),
          // colors: {
          //   white: ["#C1CCF6"],
          //   // Add your color
          //   deepBlue: ["#E9EDFC", "#C1CCF6", "#99ABF0" /* ... */],
          //   // or replace default theme color
          //   blue: ["#E9EDFC", "#C1CCF6", "#99ABF0" /* ... */],
          // },
          // shadows: {
          //   md: "1px 1px 3px rgba(0, 0, 0, .25)",
          //   xl: "5px 5px 3px rgba(0, 0, 0, .25)",
          // },
        }}
      >
        <SessionProvider session={session}>
          {/* // FUTURE BANNERS GO HERE!! */}
          <Toaster />
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </SessionProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default api.withTRPC(appWithTranslation(MyApp));
