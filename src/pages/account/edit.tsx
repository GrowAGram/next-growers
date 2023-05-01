import Head from 'next/head';
import type { NextPage } from 'next';

//import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
//  const etMsg = trpc.useQuery(['trpcRoute.etAPI']);

  return (
    <section>
      <Head>
        <title>ET T3+</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main id="API" className="flex place-content-center h-full">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl mx-5">
            Edit Profile end Settings
          </h1>
        </div>


        {/* CONENT */}
      
      </main>

    </section>
  );
};

export default Home;
