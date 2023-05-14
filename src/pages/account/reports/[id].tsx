import {
  Button,
  Container,
  Space,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import type { GetServerSidePropsContext, NextPage } from "next";

import AccessDenied from "~/components/Atom/AccessDenied";
import Head from "next/head";
import Link from "next/link";
import Loading from "~/components/Atom/Loading";
import LoadingError from "~/components/Atom/LoadingError";
import { api } from "~/utils/api";
import { authOptions } from "~/server/auth";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const EditReport: NextPage = () => {
  const pageTitle = "Edit Report";
  const router = useRouter();

  const { data: session } = useSession();

  // FETCH REPORT BY ID
  const {
    data: result,
    isLoading,
    isError,
  } = api.reports.getReportById.useQuery(useRouter().query.id as string);
  const report = result;
  // if (isLoading) return <Loading />;
  if (isError) return <LoadingError />;

  if (!session?.user) return <AccessDenied />;

  return (
    <>
      <Head>
        <title>{`GrowAGram | ${pageTitle}`}</title>
        <meta
          name="description"
          content="Edit your grow report details on growagram.com"
        />
      </Head>
      <Loading isLoading={isLoading} />
      {/* // Main Content Container */}
      <Container size="xl" className="flex w-full flex-col space-y-1">
        {/* // Header with Title */}
        <div className="flex items-center justify-between pt-2">
          {/* // Title */}
          <Title order={1} className="inline">
            {pageTitle}
          </Title>
        </div>
        {/* // Header End */}

        {/* // Edit Form */}
        <Container
          size="sm"
          px={0}
          className="flex w-full flex-col space-y-1"
          mx="auto"
        >
          {/* <Group position="left">
              <Link href="/account/reports">
                <Button
                  variant="default"
                  // onClick={() => router.back()}
                >
                  <IconBackspace className="mr-2" height={24} stroke={1.5} />{" "}
                  Your Reports
                </Button>
              </Link>
            </Group> */}
          <Link href={`/reports/${router.query.id as string}`}>
            <Button>public view</Button>
          </Link>
          <TextInput withAsterisk label="Titel" defaultValue={report?.title} />
          <Textarea
            withAsterisk
            label="Description"
            placeholder="Welcome to the high life with our epic cannabis grow report! Follow along as we document the journey of cultivating the finest strains of cannabis, from seed to harvest. Our expert growers will share their tips and tricks for producing big, beautiful buds that will blow your mind. Get ready to learn about the best nutrients, lighting, and growing techniques for cultivating potent and flavorful cannabis. Whether you're a seasoned cultivator or just starting out, our cannabis grow report has something for everyone. So sit back, relax, and enjoy the ride as we take you on a journey through the wonderful world of cannabis cultivation!"
            autosize
            minRows={6}
            defaultValue={report?.description}
          />
          <Space />
          <Button variant="outline">Save Report</Button>
        </Container>
      </Container>
    </>
  );
};

export default EditReport;

/**
 * PROTECTED PAGE
 */
export async function getServerSideProps(ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) {
  return {
    props: {
      session: await getServerSession(ctx.req, ctx.res, authOptions),
    },
  };
}
