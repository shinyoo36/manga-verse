import { useEffect, useState } from "react";

export const Loading = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="w-12 h-12 border-4 bgborder-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">Loading{dots}</p>
    </div>
  );
};
