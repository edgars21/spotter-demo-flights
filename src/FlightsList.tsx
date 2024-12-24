/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect } from "react";
import { searchFlights } from "./api/rapid/all";
import { useQuery } from "@tanstack/react-query";
import type { Search } from "./App";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { CircularProgress } from "@mui/material";

interface Props {
  search: Search;
  forceSearch: number;
}

export interface Flight {
  id: string;
  carrierName: string;
  carrierLogo: string;
  totalTime: string;
  startTime: string;
  endTime: string;
  originAirportCode: string;
  destinationAirportCode: string;
  price: string;
  stops: [string, string][];
}
dayjs.extend(duration);

function FligthsList({ search, forceSearch }: Props) {
  const flightLIstQuery = useQuery({
    queryKey: [
      "search-flights",
      {
        originSkyId: search.origin?.skyId,
        destinationSkyId: search.destination?.skyId,
        date: search.date,
        adults: search.passengerCount,
      },
    ],
    queryFn: () =>
      searchFlights({
        originSkyId: search.origin?.skyId,
        destinationSkyId: search.destination?.skyId,
        originEntityId: search.origin.entityId,
        destinationEntityId: search.destination.entityId,
        date: search.date,
        adults: search.passengerCount,
        cabinClass: "economy",
        sortBy: "best",
        currency: "USD",
        market: "en-US",
        countryCode: "US",
      }),
  });

  const list = useMemo(() => {
    return flightLIstQuery?.data?.itineraries
      ? buildFllightList(flightLIstQuery.data.itineraries)
      : [];
  }, [flightLIstQuery.data]);

  useEffect(() => {
    flightLIstQuery.refetch();
  }, [forceSearch]);

  return (
    <div className="p-4">
      {flightLIstQuery.isFetching ? (
        <div className="max-w-cotent mx-auto flex justify-center">
          <CircularProgress size={50} color="primary" />
        </div>
      ) : (
        ""
      )}

      {!flightLIstQuery.isFetching && !list.length ? (
        <div className="max-w-cotent mx-auto text-center">
          No Search Results Found
        </div>
      ) : (
        ""
      )}

      {!flightLIstQuery.isFetching && list.length ? (
        <div className="border rounded-md">
          {list.map((flight) => (
            <div key={flight.id} className="p-4 border-b">
              <div className="flex items-start flex-wrap md:flex-nowrap">
                <img className="block w-[26px] mr-4 mt-2" src={flight.carrierLogo} />
                <div className="w-[80%] mg:w-[35%] pb-2 md:pb-0">
                  <div className="text-lg font-bold">
                    {flight.startTime} ⟶ {flight.endTime}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {flight.carrierName}
                  </div>
                </div>
                <div className="w-[40%] mg:w-[15%] md:pl-4">
                  <div className="text-lg font-bold ">{flight.totalTime}</div>
                  <div className="text-gray-500 text-sm">{`${flight.originAirportCode}–${flight.destinationAirportCode}`}</div>
                </div>
                <div className="w-[40%] mg:w-[15%] pl-4">
                  <div className="text-lg font-bold ml-auto">
                    {flight.stops.length
                      ? `${flight.stops.length} stop${
                          flight.stops.length > 1 ? "s" : ""
                        }`
                      : "Nonstop"}
                  </div>
                  {flight.stops.length ? (
                    <div className="text-gray-500 text-sm">
                      {flight.stops.length > 1
                        ? flight.stops.map((x) => x[0]).join(", ")
                        : `${flight.stops[0][1]} ${flight.stops[0][0]}`}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="text-lg font-bold pl-4 ml-auto">
                  {flight.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default FligthsList;

function buildFllightList(list: Object[]): Flight[] {
  return list.map((flight) => {
    return {
      id: flight?.id,
      originAirportCode: flight.legs[0]?.origin?.id,
      destinationAirportCode: flight.legs[0]?.destination?.id,
      carrierName: flight.legs
        .map((item: any) => item?.carriers?.marketing[0]?.name)
        .join(", "),
      carrierLogo: flight.legs[0]?.carriers?.marketing[0]?.logoUrl,
      startTime: dayjs(flight.legs[0]?.departure).format("h:mm A"),
      endTime: dayjs(flight.legs[flight.legs.length - 1]?.arrival).format(
        "h:mm A"
      ),
      price: flight.price.formatted,
      totalTime: convertMinutesToHoursAndMinutes(
        flight.legs
          .map((item) => {
            return dayjs(item.arrival).diff(dayjs(item.departure), "minute");
          })
          .reduce((acc, item) => {
            return acc + item;
          }, 0)
      ),
      stops:
        flight.legs[0]?.segments?.length > 1
          ? flight.legs[0].segments.slice(1).map((item) => {
              return [
                item.origin.displayCode,
                convertMinutesToHoursAndMinutes(
                  dayjs(item.arrival).diff(dayjs(item.departure), "minute")
                ),
              ];
            })
          : [],
    };
  });
}

function convertMinutesToHoursAndMinutes(minutes: number): string {
  const duration = dayjs.duration(minutes, "minutes");
  const hours = duration.hours();
  const remainingMinutes = duration.minutes();
  return `${hours} hr ${remainingMinutes} min`;
}
