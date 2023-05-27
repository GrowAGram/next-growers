import { Container, useMantineTheme, Title, Box } from "@mantine/core";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";
import { Environment } from "~/types";
import Head from "next/head";
import { ImagePreview } from "~/components/Atom/ImagePreview";
import { type IsoReportWithPostsFromDb } from "~/types";
import { convertDatesToISO } from "~/helpers/Intl.DateTimeFormat";
import { prisma } from "~/server/db";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { PostCard } from "~/components/Post/Card";
import PostsDatePicker from "~/components/Post/Datepicker";
import { IconCalendarOff } from "@tabler/icons-react";
import ReportDetailsHead from "~/components/Report/DetailsHead";
import { ReportHeader } from "~/components/Report/Header";

/**
 * getStaticProps
 * @param context : GetStaticPropsContext<{ reportId: string }>
 * @returns : Promise<{props{ report: Report }}>
 */
export async function getStaticProps(
  context: GetStaticPropsContext<{
    reportId: string;
    postId: string;
  }>
) {
  const reportId = context.params?.reportId as string;
  const postId = context.params?.postId as string;

  // Prefetching the report from prisma
  const reportFromDb = await prisma.report.findUnique({
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      image: {
        select: {
          id: true,
          publicId: true,
          cloudUrl: true,
        },
      },
      strains: {
        select: {
          id: true,
          name: true,
          description: true,
          effects: true,
          flavors: true,
        },
      },
      likes: {
        // Include the Like relation and select the users who liked the report
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      posts: {
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          images: {
            select: {
              id: true,
              publicId: true,
              cloudUrl: true,
            },
          },
          comments: true,
          likes: {
            // Include the Like relation and select the users who liked the report
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: reportId,
    },
  });

  if (!reportFromDb) {
    // Report not found, handle the error accordingly (e.g., redirect to an error page)
    return {
      notFound: true,
    };
  }

  // Convert all Dates to IsoStrings
  const isoReportFromDb = {
    ...reportFromDb,
    createdAt: reportFromDb?.createdAt.toISOString(),
    updatedAt: reportFromDb?.updatedAt.toISOString(),
    likes: reportFromDb?.likes.map(
      ({ id, createdAt, updatedAt, user }) => ({
        id,
        userId: user.id,
        name: user.name,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      })
    ),

    posts: (reportFromDb?.posts || []).map(
      ({ date, likes, createdAt, updatedAt, ...post }) => ({
        date: date.toISOString(),
        likes: likes.map(({ id, createdAt, updatedAt, user }) => ({
          id,
          userId: user.id,
          name: user.name,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        })),
        ...post,

        comments: post.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        })),
      })
    ),
    strains: reportFromDb?.strains || [],
  };

  console.debug(
    "/pages/grow/[reportId]/update/[postId]",
    `🧑‍🏭  ...prefetching report ${reportFromDb.id} from db`
  );

  // Fetch translations using next-i18next
  const translations = await serverSideTranslations(
    context.locale as string,
    ["common"]
  );

  return {
    props: {
      report: isoReportFromDb,
      postId: postId,
      ...translations,
    },
    revalidate: 10,
  };
}

/**
 * getStaticPaths
 * @param reports: { id: string; }[]
 * @returns { paths[] }
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const reports = await prisma.report.findMany({
    select: {
      id: true,
      posts: { select: { id: true } },
    },
  });

  const paths = reports.flatMap(staticReport => {
    const localizedPaths = [
      {
        params: {
          reportId: staticReport.id,
        },
        locale: "en", // English version
      },
      {
        params: {
          reportId: staticReport.id,
        },
        locale: "de", // German version
      },
    ];

    return staticReport.posts.flatMap(post =>
      localizedPaths.map(path => ({
        ...path,
        params: {
          ...path.params,
          postId: post.id,
        },
      }))
    );
  });

  return {
    paths,
    fallback: "blocking",
  };
};

/**
 * @Page ReportDetails
 * @param props: { report: Report }
 * @returns React Functional Component
 */
export default function PublicReportPost(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { report: staticReportFromProps, postId: postIdfromProps } =
    props;
  const pageTitle = `${staticReportFromProps.title}`;

  const theme = useMantineTheme();

  const xs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const sm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const md = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const lg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
  const xl = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);

  const getResponsiveColumnCount = xs
    ? 1
    : sm
    ? 1
    : md
    ? 2
    : lg
    ? 3
    : xl
    ? 4
    : 5;
  const dateOfnewestPost = staticReportFromProps.posts.reduce(
    (maxDate, post) => {
      const postDate = new Date(post.date);
      return postDate > maxDate ? postDate : maxDate;
    },
    new Date(0)
  );

  const [postId, setPostId] = useState<string>(postIdfromProps);

  const post = staticReportFromProps.posts.find(
    post => post.id === postIdfromProps
  );

  const postDate = new Date(post?.date as string);
  const postDays = staticReportFromProps.posts.map(post =>
    new Date(post.date).getTime()
  );
  const dateOfGermination = new Date(staticReportFromProps.createdAt);
  const [selectedDate, selectDate] = useState<Date | null>(postDate);

  const defaultRelDate =
    dayjs(selectedDate)
      .subtract(getResponsiveColumnCount - 1, "month")
      .toDate() || dateOfGermination;

  const columnStartMonth: Date =
    defaultRelDate < dateOfGermination
      ? dateOfGermination
      : defaultRelDate;

  const handleSelectDate = (selectedDate: Date | null) => {
    if (!selectedDate) {
      return;
    }

    const matchingPost = staticReportFromProps.posts.find(post => {
      const postDate = new Date(post.date);
      return selectedDate.toISOString() === postDate.toISOString();
    });

    if (matchingPost) {
      selectDate(new Date(matchingPost.date));
      setPostId(matchingPost.id);

      const newUrl = `/grow/${staticReportFromProps.id}/update/${matchingPost.id}`;
      window.history.replaceState({}, "", newUrl);
    } else {
      notifications.show(noPostAtThisDay);
    }
  };

  return (
    <>
      <Head>
        <title>{`Grow "${pageTitle}" from ${
          staticReportFromProps.author?.name as string
        } | GrowAGram`}</title>
        <meta
          name="description"
          content="Create your grow report on growagram.com" //FIXME: SEO description
        />
      </Head>
      {/* // Main Content Container */}
      <Container
        size="lg"
        className="mb-8 flex w-full flex-col space-y-1"
      >
        {/* // Header with Title */}
        <div className="flex items-center justify-between pt-2">
          {/* // Title */}
          <Title order={1} className="inline">
            {`${pageTitle}`}
          </Title>
        </div>
        {/* // Header End */}
        <Container
          size="lg"
          px={0}
          mx="auto"
          className="flex w-full flex-col space-y-4"
        >
          <ReportHeader
            report={staticReportFromProps}
            image={staticReportFromProps.image?.cloudUrl as string}
            avatar={staticReportFromProps.author.image as string}
            name={staticReportFromProps.author.name as string}
            job={staticReportFromProps.description}
            stats={[
              {
                value: "34K",
                label: "Followers",
              },
              {
                value: "187",
                label: "Follows",
              },
              {
                value: "1.6K",
                label: "Posts",
              },
            ]}
          />

          {/* 
          <ImagePreview
            authorName={
              staticReportFromProps.author?.name as string
            }
            publicLink={`/grow/${staticReportFromProps.id}`}
            imageUrl={
              staticReportFromProps.image?.cloudUrl as string
            }
            title={""}
            // title={staticReportFromProps.title as string}
            description={staticReportFromProps.description}
            authorImageUrl={
              staticReportFromProps.author?.image as string
            }
            views={0}
            comments={0}
          /> */}
          {/* // Grow Parameter: Environment, ... */}
          <Box className="flex items-center justify-between pt-2">
            <Title order={5} className="inline">
              {
                Environment[
                  staticReportFromProps.environment as keyof typeof Environment
                ]
              }
            </Title>
          </Box>

          {/* // Posts Date Picker */}
          <PostsDatePicker
            defaultDate={
              selectedDate ? columnStartMonth : dateOfGermination
            }
            postDays={postDays}
            selectedDate={selectedDate}
            handleSelectDate={handleSelectDate}
            dateOfnewestPost={dateOfnewestPost}
            dateOfGermination={dateOfGermination}
            getResponsiveColumnCount={getResponsiveColumnCount}
          />

          <PostCard postId={postId} report={staticReportFromProps} />
        </Container>

        {/* <ReportDetailsHead report={staticReportFromProps} /> */}
      </Container>
    </>
  );
}

export const noPostAtThisDay = {
  title: "Success",
  message: "Sorry... no update for this day! 😢",
  color: "red",
  icon: <IconCalendarOff />,
  loading: false,
};
