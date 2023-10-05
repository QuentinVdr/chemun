import { Box, HStack, Text } from "@chakra-ui/react";
import { fuelApi } from "api/FuelApi";
import React, { useEffect, useState } from "react";

export default function DirectionInfo({ directionResponse }) {
  const [fuelPrice, setFuelPrice] = useState(null);
  const averageConsommationPerKilometer = 0.0754;
  const distance = directionResponse?.distance?.value;
  const duration = directionResponse?.duration?.text;
  const departureTime = directionResponse?.departure_time?.value
    ? new Date(directionResponse?.departure_time?.value)
    : null;
  const arrivalTime = directionResponse?.arrival_time?.value
    ? new Date(directionResponse?.arrival_time?.value)
    : null;

  useEffect(() => {
    fuelApi
      .get("/data")
      .then((response) => {
        setFuelPrice(response.data["prix_moyen"]["e10"]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  console.log(distance);
  const getFuelConsommationPrice = (
    parseInt(distance) *
    averageConsommationPerKilometer *
    fuelPrice
  ).toFixed(2);

  const dateTimeFormat = (dateTime) => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const day = dateTime.getDay() + 1;
    const month = dateTime.getMonth() + 1;

    return `${hours}h${minutes}, ${day}/${month}`;
  };

  return (
    <Box mt={4}>
      {distance && (
        <HStack spacing={4} mt={4} justifyContent="space-around">
          <Text>Distance: {distance}m </Text>
          <Text>
            Estimation coût d&apos;essence consommé: {getFuelConsommationPrice}€{" "}
          </Text>
        </HStack>
      )}
      <HStack spacing={4} mt={4} justifyContent="space-around">
        {duration && <Text>Durée: {duration} </Text>}
        {departureTime && (
          <Text>Heure de départ: {dateTimeFormat(departureTime)}</Text>
        )}
        {arrivalTime && (
          <Text>Heure d'arrivé: {dateTimeFormat(arrivalTime)}</Text>
        )}
      </HStack>
    </Box>
  );
}
