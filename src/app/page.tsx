import Header from "@/components/header";
import MainPage from "@/components/main-page";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex justify-center mb-5">
      <div className="max-w-[1280px] w-full space-y-5">
        <Header/>
        <MainPage/>
      </div>
    </div>
  );
}
