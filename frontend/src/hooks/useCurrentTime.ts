import { useEffect, useState } from "react";

function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return currentTime;
}

export default useCurrentTime;
