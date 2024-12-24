/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import rapidApi from "@/api/rapid";

export interface SearchAirpotParams {
  query: string;
  locale: string;
}

export type SearchAirpotResponse = Object;

export const searchAirpot = async (
  params: SearchAirpotParams
): Promise<SearchAirpotResponse> => {
  const result = await rapidApi.get("/v1/flights/searchAirport", params);
  return result?.data || result;
};

export interface SearchFlightsParams {
    originSkyId: string;
    destinationSkyId: string;
    originEntityId: string;
    destinationEntityId: string;
    date: string;
    cabinClass: string;
    adults: string;
    sortBy: string;
    currency: string;
    market: string;
    countryCode: string;
}

export type SearchFlightsResponse = Object;

export const searchFlights = async (
  params: SearchFlightsParams
): Promise<SearchFlightsResponse> => {
  const result = await rapidApi.get("/v1/flights/searchFlights", params);
  return result?.data || result;
};