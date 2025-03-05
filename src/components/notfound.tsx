import Link from "next/link";
import { useEffect, useState } from "react";

export const NotFound = () => {

  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center ">
      <div className="flex mt-4 gap-2">
        <p className="text-lg font-semibold textOren">404</p>
        <p className="text-lg font-semibold">|</p>
        <p className="text-lg font-semibold">Not Found</p>
      </div>
      <Link href="/" passHref className="absolute bottom-0 chList rounded-sm px-2 py-1 text-lg font-semibold mb-5">
        <p >Back to Homepage</p>
      </Link>
    </div>
  );
};

