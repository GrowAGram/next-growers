import {
  Box,
  Card,
  Center,
  Container,
  Loader,
  Paper,
  Select,
  Title,
  Transition,
} from "@mantine/core";

import { useEffect, useState } from "react";

import type { GetBreedersFromSeedfinderResponse } from "~/server/api/routers/strains";

import { api } from "~/utils/api";

export default function AddStrains() {
  const [selectedBreederId, setSelectedBreederId] =
    useState<string>("");
  const [selectedStrainId, setSelectedStrainId] = useState<string>("");
  const [strainsData, setStrainsData] = useState<
    { value: string; label: string }[]
  >([]);

  const [breeders, setBreeders] = useState<
    GetBreedersFromSeedfinderResponse | undefined
  >(undefined);

  const strainOptions: { value: string; label: string }[] = [];
  // useEffect(() => {
  //   //console.debug("breeders", breeders);
  // }, [breeders]);

  const {
    data: breedersFromSeedfinder,
    isLoading: breedersFromSeedfinderAreLoading,
    isError: breedersFromSeedfinderHaveErrors,
  } = api.strains.getBreedersFromSeedfinder.useQuery(
    { withStrains: true },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (
      !breeders &&
      !breedersFromSeedfinderAreLoading &&
      !breedersFromSeedfinderHaveErrors
    ) {
      setBreeders(breedersFromSeedfinder);
    }
  }, [
    breeders,
    breedersFromSeedfinder,
    breedersFromSeedfinderAreLoading,
    breedersFromSeedfinderHaveErrors,
  ]);

  // Convert breeders object into array of objects suitable for Select component
  const breedersOptions =
    breeders &&
    Object.keys(breeders).map((key) => ({
      value: key,
      label: breeders[key].name,
    }));

  return (
    <>
      {breedersFromSeedfinderAreLoading ? (
        <Center>
          <Loader size="md" m="xs" color="growgreen.4" />
        </Center>
      ) : (
        <Container py="xl" px={0}>
          <Paper
            m={0}
            p="sm"
            mih={400}
            withBorder
            className="flex flex-col space-y-4"
          >
            <Transition
              mounted={
                breedersOptions === undefined ||
                breedersOptions.length == 0
                  ? false
                  : true
              }
              transition="scale-y"
              duration={600} // Duration of the fade animation in milliseconds
              timingFunction="ease"
            >
              {(styles) => (
                <Select
                  className="z-20"
                  style={{
                    ...styles,
                    opacity: styles.opacity, // Apply the opacity style for the fading effect
                  }}
                  searchable
                  clearable
                  data={breedersOptions ? breedersOptions : []}
                  placeholder="Select a breeder"
                  size="md"
                  label="Breeder"
                  onChange={(value) => {
                    // Find the selected breeder in the breeders object

                    if (value) {
                      setSelectedBreederId(value);

                      const selectedBreeder =
                        breeders && breeders[value];

                      // Check if selectedBreeder has strains
                      if (
                        selectedBreeder &&
                        selectedBreeder.strains != undefined
                      ) {
                        const strains = selectedBreeder.strains;

                        // Iterate over each strain in the strains object
                        Object.entries(strains).forEach(
                          ([strainId, strainObject]) => {
                            const strainName = strainObject; // Accessing the value associated with the strainId key
                            const label =
                              strainName as unknown as string; // Explicitly cast strainName to a string

                            // Push strainId and strainName into strainOptions array
                            strainOptions.push({
                              value: strainId,
                              label: label,
                            });
                            setStrainsData(strainOptions);
                          }
                        );
                      } else {
                        console.error(
                          "Selected breeder has no strains"
                        );
                      }
                      //console.debug("strainOptions:", strainOptions);
                    } else {
                      // console.debug("reset breeder");
                      setStrainsData([]);
                      setSelectedStrainId("");
                    }
                  }}
                />
              )}
            </Transition>

            <Transition
              mounted={strainsData.length > 0}
              transition="slide-down"
              duration={600} // Duration of the fade animation in milliseconds
              timingFunction="ease"
            >
              {(styles) => (
                <Select
                  className="z-10"
                  style={{
                    ...styles,
                    opacity: styles.opacity, // Apply the opacity style for the fading effect
                  }}
                  searchable
                  clearable
                  placeholder="Select a strain"
                  size="md"
                  label="Strains"
                  data={strainsData}
                  onChange={(value) => {
                    if (value) {
                      setSelectedStrainId(value);
                      console.debug(value);
                    } else {
                      // console.debug("reset strains");
                      setSelectedStrainId("");
                    }
                  }}
                />
              )}
            </Transition>
            {selectedBreederId && selectedStrainId && (
              <SelectedStrain
                breederId={selectedBreederId}
                strainId={selectedStrainId}
              />
            )}
          </Paper>
        </Container>
      )}
    </>
  );
}

function SelectedStrain({
  breederId,
  strainId,
}: {
  breederId: string;
  strainId: string;
}) {
  const {
    data: strainInfosFromSeedfinder,
    isLoading: strainInfosFromSeedfinderAreLoading,
    isError: strainInfosFromSeedfinderHaveErrors,
  } = api.strains.getStrainInfo.useQuery(
    { breederId, strainId },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  // console.debug(breeders);

  return (
    <Transition
      mounted={
        !strainInfosFromSeedfinderAreLoading &&
        !strainInfosFromSeedfinderHaveErrors &&
        !!strainInfosFromSeedfinder
      }
      transition="fade"
      duration={500} // Duration of the fade animation in milliseconds
      timingFunction="ease"
    >
      {(styles) => (
        <Box
          style={{
            ...styles,
            opacity: styles.opacity, // Apply the opacity style for the fading effect
          }}
        >
          {strainInfosFromSeedfinder && (
            <Card
              p="lg"
              shadow="sm"
              radius="md"
              className="flex flex-col space-y-4"
            >
              <Paper p="xs">
                <Title order={3}>
                  Strain: {strainInfosFromSeedfinder.name}
                </Title>
                <Title order={3}>
                  Strain: {strainInfosFromSeedfinder.name}
                </Title>
                {/* </Paper>
              <Paper> */}
                <p>
                  <strong>Type:</strong>{" "}
                  {strainInfosFromSeedfinder.brinfo &&
                    strainInfosFromSeedfinder.brinfo.type}
                </p>
                <p>
                  <strong>CBD:</strong>{" "}
                  {strainInfosFromSeedfinder.brinfo &&
                    strainInfosFromSeedfinder.brinfo.cbd}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {strainInfosFromSeedfinder.brinfo &&
                    strainInfosFromSeedfinder.brinfo.description}
                </p>
                {/* Render other strain information as needed */}
                <Box>
                  <a
                    href={strainInfosFromSeedfinder.links.info}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More Info
                  </a>
                  <a
                    href={strainInfosFromSeedfinder.links.review}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reviews
                  </a>
                  {/* Add other links as needed */}
                </Box>
              </Paper>
            </Card>
          )}

          {/* // display strainInfosFromSeedfinder of type StrainInfoResponse in some pretty Boxes in Flex or so 
          
          type StrainInfoResponse = {
            error: boolean;
            name: string;
            id: string;
            brinfo: {
              name: string;
              id: string;
              type: string;
              cbd: string;
              description: string;
              link: string;
              pic: string;
              flowering: {
                auto: boolean;
                days: number;
                info: string;
              };
              descr: string;
            };
            comments: boolean;
            links: {
              info: string;
              review: string;
              upload: {
                picture: string;
                review: string;
                medical: string;
              };
            };
            licence: {
              url_cc: string;
              url_sf: string;
              info: string;
            };
          };
          
          */}
        </Box>
      )}
    </Transition>
  );
}
