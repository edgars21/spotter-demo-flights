import { useState, useMemo } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { searchAirpot } from "./api/rapid/all";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Button from "@mui/material/Button";
import type { Search } from "./App";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface Props {
  onSearch: (search: Search) => void;
}

export interface AirportLocation {
  label: string;
  value: string;
  skyId: string;
  entityId: string;
}

function MainBox({ onSearch }: Props) {
  const [fromLocation, setFromLocation] = useState<AirportLocation | null>(
    null
  );
  const [fromInputValue, setFromInputValue] = useState("");
  const debouncedFromInputValue = useDebounce(fromInputValue, 400);
  const [toLocation, setToLocation] = useState<AirportLocation | null>(null);
  const [toInputValue, setToInputValue] = useState("");
  const debouncedToInputValue = useDebounce(toInputValue, 400);
  const [passengerCountInputValue, setPassengerCountInputValue] = useState("1");
  const [departureInputValue, setDepartureInputValue] = useState<Dayjs | null>(
    null
  );
  const [dateError, setDateError] = useState(false);

  const fromSearchQuery = useQuery({
    queryKey: [
      "search-airpot",
      {
        query: debouncedFromInputValue,
        locale: "en-US",
      },
    ],
    queryFn: () =>
      searchAirpot({
        query: debouncedFromInputValue,
        locale: "en-US",
      }),
    enabled: !!debouncedFromInputValue,
    placeholderData: (prev) => prev,
  });

  const fromList = useMemo(() => {
    return fromSearchQuery.data
      ? buildAirportLocationList(fromSearchQuery.data)
      : [];
  }, [fromSearchQuery.data]);

  const toSearchQuery = useQuery({
    queryKey: [
      "search-airpot",
      {
        query: debouncedToInputValue,
        locale: "en-US",
      },
    ],
    queryFn: () =>
      searchAirpot({
        query: debouncedToInputValue,
        locale: "en-US",
      }),
    enabled: !!debouncedToInputValue,
    placeholderData: (prev) => prev,
  });

  const toList = useMemo(() => {
    return toSearchQuery.data
      ? buildAirportLocationList(toSearchQuery.data)
      : [];
  }, [toSearchQuery.data]);

  function handleSearch() {

    if (
      fromLocation &&
      toLocation &&
      passengerCountInputValue &&
      departureInputValue
    ) {
      onSearch({
        origin: fromLocation,
        destination: toLocation,
        passengerCount: passengerCountInputValue,
        date: departureInputValue.format("YYYY-MM-DD"),
      });
    }

    if (!departureInputValue) setDateError(true);
  }

  return (
    <div className="relative">
      <div className="bg-gray-100 shadow-lg rounded-md px-4 py-8 lg:px-8">
        <div className="grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <Autocomplete
              loading={fromSearchQuery.isFetching}
              value={fromLocation?.label || null}
              inputValue={fromInputValue}
              options={fromList.map((option) => option.label)}
              noOptionsText="No matching locations found"
              renderInput={(params) => (
                <TextField {...params} label="From" variant="outlined" />
              )}
              onChange={(_, newValue) => {
                const option =
                  fromList.find((el) => el.label === newValue) || null;
                setFromLocation(option);
              }}
              onInputChange={(_, newInputValue) => {
                setFromInputValue(newInputValue);
              }}
            />
            <Autocomplete
              loading={toSearchQuery.isFetching}
              value={toLocation?.label || null}
              inputValue={toInputValue}
              options={toList.map((option) => option.label)}
              noOptionsText="No matching locations found"
              renderInput={(params) => (
                <TextField {...params} label="To" variant="outlined" />
              )}
              onChange={(_, newValue) => {
                const option =
                  toList.find((el) => el.label === newValue) || null;
                setToLocation(option);
              }}
              onInputChange={(_, newInputValue) => {
                setToInputValue(newInputValue);
              }}
            />
          </div>
          <div className="grid grid-cols-[100px_auto] gap-4">
            <FormControl fullWidth style={{ width: 100 }}>
              <InputLabel>Passengers</InputLabel>
              <Select
                value={passengerCountInputValue}
                label="Passengers"
                onChange={(e: SelectChangeEvent) => {
                  setPassengerCountInputValue(e.target.value as string);
                }}
              >
                {[...Array(8).keys()]
                  .map((i) => i + 1)
                  .map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Departure"
                value={departureInputValue}
                minDate={dayjs()}
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    error: dateError,
                  },
                }}
                onChange={(newValue) => {
                  if (dateError && newValue) setDateError(false);
                  setDepartureInputValue(newValue);
                }}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
      <div
        className={`flex justify-center -translate-y-1/2 ${
          fromLocation && toLocation ? "visible" : "invisible"
        }`}
      >
        <Button onClick={handleSearch} variant="contained">
          Search
        </Button>
      </div>
    </div>
  );
}

export default MainBox;

function buildAirportLocationList(list: Object[]): AirportLocation[] {
  return list.map((suggestion) => {
    return {
      value: suggestion.entityId,
      label:
        suggestion.presentation.suggestionTitle ||
        suggestion.presentation.title,
      skyId: suggestion.entityId,
      entityId: suggestion.entityId,
    };
  });
}
