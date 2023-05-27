import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Text,
  Tooltip,
  createStyles,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconCalendar,
  IconCannabis,
  IconClock,
  IconEdit,
  IconLogin,
} from "@tabler/icons-react";

import { IconCheck } from "@tabler/icons-react";
import { ImagePreview } from "~/components/Atom/ImagePreview";
import Link from "next/link";
import { Locale } from "~/types";
import type { IsoReportCardProps } from "~/types";
import { api } from "~/utils/api";
import { sanatizeDateString } from "~/helpers";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import LikeHeart from "~/components/Atom/LikeHeart";
import ReportDetailsHead from "../DetailsHead";

const useStyles = createStyles(theme => ({
  card: {
    transition: "transform 150ms ease, box-shadow 150ms ease",

    "&:hover": {
      // transform: "scale(1.004)",
      // color: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,

      // Add the desired box-shadow color and theme's md shadow here
      boxShadow:
        theme.colorScheme === "dark"
          ? `0 0 4px ${theme.colors.pink[6]}`
          : `0 0 8px ${theme.colors.orange[8]}`,
    },
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.white,
  },

  section: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[2]
    }`,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },

  like: {
    color: theme.colors.red[6],
    transition: "transform 2.3s ease-in-out",
  },

  label: {
    textTransform: "uppercase",
    fontSize: theme.fontSizes.xs,
    fontWeight: 700,
  },

  badgecontainer: {
    marginBottom: "-0.5rem",
  },
}));

export const likeSuccessfulMsg = {
  title: "Success",
  message: "Woohoo... you ❤️ this Grow!",
  color: "green",
  icon: <IconCheck />,
  loading: false,
};
export const dislikeSuccessfulMsg = {
  title: "Success",
  message: "Oh no... you removed your Like! 😢",
  color: "green",
  icon: <IconCheck />,
  loading: false,
};
export const likeErrorMsg = (msg: string) => ({
  loading: false,
  title: "Error",
  message: msg,
  color: "red",
  icon: <IconLogin />,
});

export default function IsoReportCard({
  report: isoReport,
  procedure,
  setSearchString,
}: IsoReportCardProps) {
  const trpc = api.useContext();
  const router = useRouter();

  const { locale: activeLocale } = router;
  const { t } = useTranslation(activeLocale);

  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { data: session, status } = useSession();

  const { mutate: deleteMutation } =
    api.reports.deleteOwnReport.useMutation({
      onMutate: async (deletedReportId: string) => {
        if (procedure == "own") {
          // Cancel any outgoing refetches so they don't overwrite optimistic update
          await trpc.reports.getOwnReports.cancel();
          // Snapshot the previous value
          const previousReports =
            trpc.reports.getOwnReports.getData();
          // Optimistically update to the new value
          trpc.reports.getOwnReports.setData(
            { search: "", orderBy: "createdAt", desc: true },
            prev => {
              console.log("PREV", prev);
              if (!prev) return previousReports;
              return prev.filter(
                report => report.id !== deletedReportId
              );
            }
          );
          // Return a context object with the snapshotted value
          return { previousReports };
        } else {
          // Cancel any outgoing refetches so they don't overwrite optimistic update
          await trpc.reports.getAllReports.cancel();
          // Snapshot the previous value
          const previousReports =
            trpc.reports.getAllReports.getData();
          // Optimistically update to the new value
          trpc.reports.getAllReports.setData(
            { search: "", orderBy: "createdAt", desc: true },
            prev => {
              if (!prev) return previousReports;
              return prev.filter(
                report => report.id !== deletedReportId
              );
            }
          );
          // Return a context object with the snapshotted value
          return { previousReports };
        }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_err, _variables, context) => {
        if (!!context) {
          if (procedure == "own") {
            trpc.reports.getOwnReports.setData(
              { search: "", orderBy: "createdAt", desc: true },
              () => context.previousReports
            );
          } else {
            trpc.reports.getAllReports.setData(
              { search: "", orderBy: "createdAt", desc: true },
              () => context.previousReports
            );
          }
        }
      },
      // Always refetch after error or success:
      onSettled: async () => {
        await trpc.reports.getOwnReports.invalidate();
        await trpc.reports.getAllReports.invalidate();
      },
    });

  const reportStrains = isoReport.strains.map(badge => (
    <Box key={badge.id}>
      <Badge
        className="badgecontainer cursor-pointer"
        onClick={() => {
          setSearchString(`strain:"${badge.name}"`);
        }}
        variant="gradient"
        gradient={{ from: "orange", to: "grape" }}
        fz="0.6rem"
        fw="bolder"
        px={2}
        color={
          theme.colorScheme === "dark"
            ? theme.colors.lime[9]
            : "green"
        }
        leftSection={<IconCannabis size={rem(14)} />}
        // leftSection={badge.emoji}
      >
        {badge.name}
      </Badge>
    </Box>
  ));

  return (
    <Card
      withBorder
      radius="sm"
      p="sm"
      className={classes.card}
    >
      <Card.Section>
        <ImagePreview
          imageUrl={isoReport.image?.cloudUrl as string}
          title={isoReport.title as string}
          description={isoReport.description as string}
          publicLink={`/grow/${isoReport.id as string}`}
          authorName={isoReport.author?.name as string}
          authorImageUrl={isoReport.author?.image as string}
          comments={42}
          views={183}
        />
      </Card.Section>

      <Card.Section className={classes.section} mt={6}>
        <Flex
          className="space-y-0"
          align="flex-start"
          justify="space-between"
        >
          <Group
            position="left"
            className=" bottom-0 inline-flex space-y-0"
          >
            {/* Strains */}
            {reportStrains}
          </Group>
          <LikeHeart itemToLike={isoReport} />
        </Flex>
      </Card.Section>

      <Card.Section className={classes.section} mt={4}>
        <Group position="apart">
          {/*// Stage/ Date */}
          <Group position="left">
            <Tooltip
              transitionProps={{
                transition: "pop-bottom-left",
                duration: 100,
              }}
              label={t("common:reports-createdAt")}
              color="green"
              withArrow
              arrowPosition="side"
            >
              <Center>
                <Box pr={4}>
                  <IconCalendar size="1.2rem" />
                </Box>
                <Text
                  className={`${classes.label} cursor-default`}
                  c="dimmed"
                >
                  {sanatizeDateString(
                    isoReport.createdAt,
                    router.locale === Locale.DE
                      ? Locale.DE
                      : Locale.EN
                  )}
                </Text>
              </Center>
            </Tooltip>
          </Group>
          {/*// Stage/ Date */}
          <Group position="left">
            <Tooltip
              transitionProps={{
                transition: "pop-bottom-right",
                duration: 100,
              }}
              label={t("common:reports-updatedAt")}
              color="green"
              withArrow
              arrowPosition="side"
            >
              <Center>
                <Text
                  className={`${classes.label} cursor-default`}
                  c="dimmed"
                >
                  {sanatizeDateString(
                    isoReport.updatedAt,
                    router.locale === Locale.DE
                      ? Locale.DE
                      : Locale.EN
                  )}
                </Text>
                <Box pl={4}>
                  <IconClock size="1.2rem" />
                </Box>
              </Center>
            </Tooltip>
          </Group>
        </Group>
      </Card.Section>

      {/*// Strains */}
      {/*
      <Card.Section className={classes.section} mt={0}>
        <Text mt="xs" className={classes.label} c="dimmed">
          Strains in this Grow:
        </Text>
        <Group spacing={7} mt={4}>
          {reportStrains}
        </Group>
      </Card.Section> */}

      {/*// Session buttons */}
      {status == "authenticated" &&
        session.user.id == isoReport.authorId && (
          <Group mt="xs" position="apart">
            <Button
              size="sm"
              variant="filled"
              color="red"
              radius="sm"
              style={{ flex: 0 }}
              className="border-1 cursor-default border-red-600"
              onClick={() => {
                deleteMutation(isoReport.id as string);
              }}
            >
              {t("common:report-delete")}
              <IconAlertTriangleFilled
                className="ml-2"
                height={18}
                stroke={1.5}
              />
            </Button>
            <Link
              href={`/account/reports/${
                isoReport.id as string
              }`}
            >
              <Button
                size="sm" /*
              className="border-orange-600" */
                variant="outline"
                radius="sm"
                style={{ flex: 1 }}
              >
                {t("common:report-edit")}
                <IconEdit
                  className="ml-2"
                  height={22}
                  stroke={1.5}
                />
              </Button>
            </Link>
          </Group>
        )}
      {/* <ReportDetailsHead report={isoReport} /> */}
    </Card>
  );
}
