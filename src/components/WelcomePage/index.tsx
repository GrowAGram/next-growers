import {
  Button,
  Center,
  Container,
  createStyles,
  Divider,
  Grid,
  Group,
  rem,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import { LoginModal } from "~/components/Atom/LoginModal";
import ReportCard from "~/components/Report/Card";

import type { IsoReportWithPostsCountFromDb } from "~/types";

interface LandingPageProps {
  topLikeReports: IsoReportWithPostsCountFromDb[];
}

export default function WelcomePage({
  topLikeReports: topLikeReports,
}: LandingPageProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const useStyles = createStyles((theme) => ({
    title: {
      fontFamily: `'Roboto Slab', sans-serif`,
      fontSize: rem(112),
      fontWeight: 700,
      lineHeight: 0.8,
      color: "transparent",
      background: `linear-gradient(to right, ${theme.fn.lighten(theme.colors.orange[7], 0.1)}, ${theme.colors.red[8]}, ${theme.fn.lighten(theme.colors.orange[6], 0.1)})`,
      WebkitBackgroundClip: "text",
      transition: "background 300ms ease-in-out",
      cursor: "default",

      [theme.fn.smallerThan("lg")]: {
        fontSize: rem(112),
      },

      [theme.fn.smallerThan("md")]: {
        fontSize: rem(92),
      },

      [theme.fn.smallerThan("sm")]: {
        fontSize: rem(54),
      },
    },
    subTitle: {
      fontSize: rem(54),
      fontWeight: 900,
      lineHeight: 1.5,
      fontFamily: `'Roboto Slab', sans-serif`,
      color: theme.colors.growgreen[3],

      textShadow: dark
        ? // ? `2px 3px 6px rgba(255, 83, 34, 0.8)`
          `2px 3px 6px rgba(29, 75, 20, 0.8)`
        : `2px 3px 6px rgba(29, 75, 20, 0.8)`,

      [theme.fn.smallerThan("lg")]: {
        fontSize: rem(54),
        lineHeight: 1.4,
      },

      [theme.fn.smallerThan("md")]: {
        fontSize: rem(44),
        lineHeight: 1.3,
      },

      [theme.fn.smallerThan("sm")]: {
        fontSize: rem(24),
        lineHeight: 1.2,
      },
    },

    description: {
      textAlign: "center",

      [theme.fn.smallerThan("sm")]: {
        fontSize: theme.fontSizes.md,
      },
    },
  }));
  const { classes, theme } = useStyles();
  const smallScreen = useMediaQuery(
    `(max-width: ${theme.breakpoints.lg})`
  );

  const router = useRouter();
  const { locale: activeLocale } = router;
  const { t } = useTranslation(activeLocale);
  const { status: status } = useSession();

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <LoginModal opened={opened} close={close} />

      {/* // Main Content Container */}
      <Container
        size="xl"
        className="flex w-full flex-col justify-center space-y-2"
      >
        <Center>
          <Container p={0} m={0}>
            <Stack m={0} spacing="xs" className="overflow-visible">
              <Title
                pt="xs"
                ff={`'Grandstander', sans-serif`}
                p={0}
                order={1}
                className={classes.title}
                // variant="gradient"
                // gradient={{
                //   from: theme.fn.darken(
                //     theme.colors.growgreen[2],
                //     0.2
                //   ),
                //   to: theme.fn.darken(theme.colors.groworange[4], 0),
                //   deg: 90,
                // }}
              >
                GrowAGram
              </Title>{" "}
              <Divider m={0} color="growgreen.4" size="lg" />
              <Center>
                <Text className={classes.subTitle}>
                  🪴&nbsp;Track&nbsp;Your&nbsp;Grow&nbsp;📜
                </Text>
              </Center>
            </Stack>
          </Container>
        </Center>

        {smallScreen && (
          <Group p="sm" position="center">
            <Link href={"/grows"}>
              <Button
                variant="default"
                className="text-lg uppercase cursor-default h-12 w-72 
              bg-gradient-to-r transition duration-300 ease-in-out 
              from-orange-600 via-pink-600 to-red-500 text-white
              hover:from-orange-700 hover:via-pink-700 hover:to-red-600"
              >
                {t("common:landing-button-allgrows")} 🔎
              </Button>
            </Link>
            <Button
              variant="default"
              onClick={() => {
                status === "authenticated"
                  ? void router.push(
                      {
                        pathname: "/account/grows/create",
                      },
                      undefined,
                      { scroll: true }
                    )
                  : open();
              }}
              className="text-lg uppercase cursor-default h-12 w-72 
              bg-gradient-to-r transition duration-1000 ease-in-out 
              from-teal-700  via-green-600  to-emerald-800 
              hover:from-teal-800 hover:via-green-700 hover:to-emerald-700"
            >
              {t("common:usermenu-addnewgrow")} ⛏️
            </Button>
          </Group>
        )}

        {/* <Flex justify="flex-end" align="center"> */}
        {/* LOOP OVER REPORTS topLikeReports */}
        <Grid gutter="xs">
          {/* LOOP OVER REPORTS */}
          {topLikeReports.length
            ? topLikeReports.map((isoReport) => {
                return (
                  <Grid.Col
                    key={isoReport.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    xl={3}
                  >
                    <ReportCard report={isoReport} />
                  </Grid.Col>
                );
              })
            : null}
        </Grid>

        {!smallScreen && (
          <Group mt="xl" p="sm" position="center">
            <Link href={"/grows"}>
              <Button
                variant="default"
                className="text-lg uppercase cursor-default h-12 w-72 
              bg-gradient-to-r transition duration-300 ease-in-out 
              from-orange-600 via-pink-600 to-red-500 text-white
              hover:from-orange-700 hover:via-pink-700 hover:to-red-600"
              >
                {t("common:landing-button-allgrows")} 🔎
              </Button>
            </Link>

            <Button
              variant="default"
              onClick={() => {
                status === "authenticated"
                  ? void router.push(
                      {
                        pathname: "/account/grows/create",
                      },
                      undefined,
                      { scroll: true }
                    )
                  : open();
              }}
              className="text-lg uppercase cursor-default h-12 w-72 
              bg-gradient-to-r transition duration-1000 ease-in-out 
              from-teal-700  via-green-600  to-emerald-800 
              hover:from-teal-800 hover:via-green-700 hover:to-emerald-700"
            >
              {t("common:usermenu-addnewgrow")} ⛏️
            </Button>
          </Group>
        )}

        <Text className={classes.description} size="xl" mt="xl">
          {t("common:landing-text-top1")}
        </Text>

        <Text className={classes.description} size="xl" mt="sm">
          {t("common:landing-text-top3")}
        </Text>

        <Text className={classes.description} size="xl" mt="xl">
          {t("common:landing-text-top2")}
        </Text>

        <Text className={classes.description} size="md" mt="xl">
          {t("common:landing-text-bottom")}
        </Text>
      </Container>
    </>
  );
}
