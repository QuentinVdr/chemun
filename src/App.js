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
  Text,
  useRadioGroup,
} from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";

import {
  Autocomplete,
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useRef, useState } from "react";
import RadioCard from "component/radioCard";

const center = { lat: 48.8584, lng: 2.2945 };
const zoom = 6;

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();
  const [travelMode, setTravelMode] = useState("TRANSIT");

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "framework",
    defaultValue: "TRANSIT",
    onChange: setTravelMode,
  });

  if (!isLoaded) {
    return <SkeletonText />;
  }

  const group = getRootProps();

  const options = [
    ["Voiture", google.maps.TravelMode.DRIVING],
    ["Transport en commun", google.maps.TravelMode.TRANSIT],
    ["Vélo", google.maps.TravelMode.BICYCLING],
    ["Marche", google.maps.TravelMode.WALKING],
  ];

  async function calculateRoute() {
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // @ts-ignore
      travelMode: travelMode,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
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
          onLoad={(map) => setMap(map)}
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
        <HStack spacing={4} mt={4} justifyContent="space-around">
          <Text>Distance: {distance} </Text>
          <Text>Durée: {duration} </Text>
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
