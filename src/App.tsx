import { useEffect, useState } from "react";

// TODO:
// - Design
// - Ajouter un bouton reset
// - Mutualiser pour n'avoir qu'un seul compteur, et utiliser un status "ACTIVE", "PASSIVE" et "BETWEEN_SETS" pour savoir
//   la couleur du fond, le temps restant.
// - Tout sortir dans un hook custom
// - Virer la constante pour le "END"

function App() {
  // Settings
  const [repCount, setRepCount] = useState(1);
  const [setCount, setSetCount] = useState(1);
  const [repDurationInSec, setRepDurationInSec] = useState(0);
  const [pauseDurationInSec, setPauseDurationInSec] = useState(0);
  const [pauseBetweenSetsInSec, setPauseBetweenSetsInSec] = useState(0);

  // To display
  const [bgColor, setBgColor] = useState("blue");
  const [end, setEnd] = useState(false);

  const [totalTimeInSec, setTotalTimeInSec] = useState(0);

  const [repNumber, setRepNumber] = useState(1);
  const [setNumber, setSetNumber] = useState(1);

  const [activeCountdownInSec, setActiveCountdownInSec] = useState(0);
  const [passiveCountdownInSec, setPassiveCountdownInSec] = useState(0);
  const [countdownBetweenSets, setCountdownBetweenSets] = useState(0);
  const [go, setGo] = useState(false);

  const getRemainingTime = (): { min: number; sec: number } => {
    let min;
    let sec;
    if (countdownBetweenSets > 0) {
      min = Math.floor(countdownBetweenSets / 60);
      sec = Math.floor(countdownBetweenSets % 60);
    } else if (activeCountdownInSec > 0) {
      min = Math.floor(activeCountdownInSec / 60);
      sec = Math.floor(activeCountdownInSec % 60);
    } else {
      min = Math.floor(passiveCountdownInSec / 60);
      sec = Math.floor(passiveCountdownInSec % 60);
    }

    return { min, sec };
  };

  // Set countdown if repDuration change
  useEffect(() => {
    setActiveCountdownInSec(repDurationInSec);
  }, [repDurationInSec]);

  useEffect(() => {
    setTotalTimeInSec(
      repCount * (repDurationInSec + pauseDurationInSec) * setCount +
        (setCount - 1) * pauseBetweenSetsInSec,
    );
  }, [
    repCount,
    setCount,
    repDurationInSec,
    pauseDurationInSec,
    pauseBetweenSetsInSec,
  ]);

  // Countdown
  useEffect(() => {
    let interval: number | undefined;
    if (go) {
      interval = setInterval(() => {
        setTotalTimeInSec(totalTimeInSec - 1);
        if (countdownBetweenSets > 0) {
          setCountdownBetweenSets(countdownBetweenSets - 1);
          if (countdownBetweenSets - 1 === 0) {
            setBgColor("green");
            setActiveCountdownInSec(repDurationInSec);
          }
        } else {
          if (activeCountdownInSec - 1 > 0) {
            setActiveCountdownInSec(activeCountdownInSec - 1);
            return;
          }
          if (activeCountdownInSec - 1 === 0) {
            setBgColor("red");
            setActiveCountdownInSec(activeCountdownInSec - 1);
            setPassiveCountdownInSec(pauseDurationInSec);
            return;
          }
          if (passiveCountdownInSec - 1 > 0) {
            setPassiveCountdownInSec(passiveCountdownInSec - 1);
            return;
          }
          if (passiveCountdownInSec - 1 === 0) {
            // End of rep
            setBgColor("green");
            setPassiveCountdownInSec(passiveCountdownInSec - 1);
            setActiveCountdownInSec(repDurationInSec);
            if (repNumber < repCount) {
              // Rep of set not done
              setRepNumber(repNumber + 1);
            } else if (setNumber < setCount) {
              // repNumber === repCount so end of set
              setBgColor("orange");
              setCountdownBetweenSets(pauseBetweenSetsInSec);
              setSetNumber(setNumber + 1);
              setRepNumber(1);
            } else {
              clearInterval(interval);
              setGo(false);
              setEnd(true);
            }
            return;
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [go, activeCountdownInSec, passiveCountdownInSec, countdownBetweenSets]);

  const resetTimers = () => {
    setRepNumber(1);
    setSetNumber(1);
    setActiveCountdownInSec(repDurationInSec);
    setPassiveCountdownInSec(0);
  };

  const { min: minRemaining, sec: secRemaining } = getRemainingTime();

  return (
    <div className="container">
      <h1
        className="w-full text-7xl m-auto"
        style={{ backgroundColor: bgColor }}
      >
        {end && "END"}
        {!end && (
          <>
            {minRemaining < 10 ? `0${minRemaining}` : minRemaining}:
            {secRemaining < 10 ? `0${secRemaining}` : secRemaining}
          </>
        )}
      </h1>
      <div className="flex flex-1 flex-col">
        <div>
          Reps: {repNumber}/{repCount}
        </div>
        <div>
          Sets: {setNumber}/{setCount}
        </div>
        <div>
          Total time remaining:{" "}
          {Math.floor(totalTimeInSec / 60) < 10
            ? `0${Math.floor(totalTimeInSec / 60)}`
            : Math.floor(totalTimeInSec / 60)}
          :
          {Math.floor(totalTimeInSec % 60) < 10
            ? `0${Math.floor(totalTimeInSec % 60)}`
            : Math.floor(totalTimeInSec % 60)}
        </div>
      </div>
      <div className="flex flex-1 mt-2">
        <div className="w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nb de répétitions
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="repCount"
            type="number"
            placeholder="Répétitions"
            onChange={(e) => setRepCount(parseInt(e.target.value))}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nb de séries
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="setCount"
            type="number"
            placeholder="Séries"
            onChange={(e) => setSetCount(parseInt(e.target.value))}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Temps actif par répétition
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="activeDuration"
            type="number"
            placeholder="Tps actif"
            onChange={(e) => setRepDurationInSec(parseInt(e.target.value))}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Temps pause par répétition
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="passiveDuration"
            type="number"
            placeholder="Tps passif"
            onChange={(e) => setPauseDurationInSec(parseInt(e.target.value))}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Temps pause entre séries
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="pauseBetweenSets"
            type="number"
            placeholder="Tps entre séries"
            onChange={(e) => setPauseBetweenSetsInSec(parseInt(e.target.value))}
          />
        </div>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          setBgColor("green");
          setGo(true);
        }}
        disabled={go}
      >
        Go !
      </button>
      <button
        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        onClick={() => setGo(false)}
        disabled={!go}
      >
        Pause
      </button>
    </div>
  );
}

export default App;
