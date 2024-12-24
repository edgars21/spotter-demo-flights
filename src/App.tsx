import { useState, useRef, useEffect } from "react";
import SearchBox, { AirportLocation } from "./SearchBox";
import FligthsList from "./FlightsList";

export interface Search {
  origin: AirportLocation;
  destination: AirportLocation;
  passengerCount: string;
  date: string;
}

function App() {
  const searchLayoutElRef = useRef<HTMLDivElement | null>(null);
  const searchLayoutInnerElRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState<Search | null>(null);
  const [initShift, setInitShift] = useState(false);
  const [initLoad, setInitLoad] = useState(false);
  const [shiftEnd, setShiftEnd] = useState(false);
  const [forceSearch, setForceSearch] = useState(0);

  function shift() {
    if (!initShift && initLoad) {
      setInitShift(true);
      setTimeout(() => {
        setShiftEnd(true);
      }, 500);
    }
  }

  useEffect(() => {
    setInitLoad(true);
  }, []);

  return (
    <div
      className={`h-full overflow-auto relative grid transition-all duration-500 ease-in-out ${
        initShift ? "grid-rows-[auto_1fr_80px]" : "grid-rows-[1fr_0fr_80px]"
      }`}
    >
      <div className="absolute w-full h-[140px] left-0 top-0 bg-[url('/images/header-bg.jpg')] bg-contain bg-repeat-x"></div>
      <div
        ref={searchLayoutElRef}
        className="grid content-center sticky top-0 pt-[40px]"
      >
        <div
          ref={searchLayoutInnerElRef}
          className="max-w-screen-xl w-full mx-auto"
        >
          <SearchBox
            onSearch={(search) => {
              shift();
              setSearch(search);
              setForceSearch(forceSearch + 1);
            }}
          />
        </div>
      </div>
      <div
        className={`max-w-screen-lg w-full mx-auto ${
          shiftEnd ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        {search ? (
          <FligthsList forceSearch={forceSearch} search={search} />
        ) : (
          ""
        )}
      </div>
      <div className="w-full h-[60px] mt-[20px] left-0 bottom-0 bg-[url('/images/footer.png')] bg-contain bg-repeat-x flex items-center justify-center">
        <div className="text-xs text-gray-400 italic mt-5">
          Made with ♥{" "}
          <a
            href="https://snepsts.xyz"
            className="underline hover:no-underline"
          >
            www.snepsts.xyz
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
