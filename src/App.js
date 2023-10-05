/*global google */
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  useRadioGroup,
} from "@chakra-ui/react";
import {
  Autocomplete,
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import { type } from "@testing-library/user-event/dist/type";
import DirectionInfo from "component/directionInfo";
import RadioCard from "component/radioCard";
import React, { useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

const center = { lat: 48.8584, lng: 2.2945 };
const zoom = 6;

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();
  const [travelMode, setTravelMode] = useState("TRANSIT");

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "travelMode",
    defaultValue: "TRANSIT",
    onChange: handleTravelModeChange,
  });

  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function handleTravelModeChange(value) {
    console.log(value);
    setTravelMode(value);
    await calculateRoute();
  }

  const group = getRootProps();

  const options = [
    ["Voiture", google.maps.TravelMode.DRIVING],
    ["Transport en commun", google.maps.TravelMode.TRANSIT],
    ["Vélo", google.maps.TravelMode.BICYCLING],
    ["Marche", google.maps.TravelMode.WALKING],
  ];

  async function calculateRoute() {
    console.log("in calculateRoute");
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      console.log("in calculateRoute: empty");
      return;
    }
    console.log("in calculateRoute: not empty");
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // @ts-ignore
      travelMode: travelMode,
    });
    setDirectionsResponse(results);
    console.log("in calculateRoute: sucess : ", results);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    originRef.current.value = "";
    destinationRef.current.value = "";
  }

  return (
    <Flex flexDirection="column" alignItems="center" h="100vh" w="100vw">
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={zoom}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="xl"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origine" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme="blue" type="submit" onClick={calculateRoute}>
              Calculer le trajet
            </Button>
            <IconButton
              aria-label="Retirer le trajet"
              title="Retirer le trajet"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-around">
          <HStack {...group}>
            {options.map((value) => {
              const radio = getRadioProps({ value: value[1] });
              return (
                <RadioCard key={value[1]} {...radio}>
                  {value[0]}
                </RadioCard>
              );
            })}
          </HStack>
        </HStack>
        {directionsResponse && (
          <DirectionInfo
            directionResponse={directionsResponse?.routes[0]?.legs[0]}
          />
        )}
      </Box>
    </Flex>
  );
}

export default App;
