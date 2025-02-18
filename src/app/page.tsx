import Header from "@/components/header";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex justify-center">
      <div className="max-w-[1280px] w-full">
        <Header/>
        <div className="flex p-2">
          <div className="flex w-full justify-between">
            <p className="text-[20px] font-semibold">Latest Updates</p>
            <p className="text-[20px] font-semibold">View All</p>
          </div>
        </div>
      </div>
    </div>
  
  );
}
