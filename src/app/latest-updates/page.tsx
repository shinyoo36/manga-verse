"use client";

import { Suspense } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { useEffect, useRef, useState } from 'react';
import { useParams } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import { getMangaCoverImage } from '@/utils/api';
import Link from 'next/link';
import MainLayout from "@/app/layout/index";
import { Manga, MangaApiResponse, Chapter } from '@/components/types';
import { Loading } from '@/components/loading';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LatestUpdatesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LatestUpdatesContent />
    </Suspense>
  );
}

function LatestUpdatesContent () {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const size = 32;
  const offset = (page - 1) * size; 

  const [latestUpdatesData, setLatestUpdatesData] = useState<Chapter[]>([]);
  const [latestUpdatesMangaData, setLatestUpdatesMangaData] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        const [latestResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/latest/${size}/${offset}`).then(res => res.json()),
        ]);
        setLatestUpdatesData(latestResponse.data);
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      }
    };

    fetchMangaData();
  }, [size, offset]);


  useEffect(() => {
      if (latestUpdatesData.length === 0) return;

      const ids = Array.from(
          new Set(
              latestUpdatesData
                  .map(chapter => chapter.relationships.find(rel => rel.type === "manga")?.id)
                  .filter(Boolean)
          )
      ).slice(0, 20);

      if (ids.length === 0) return;

      const queryParams = ids.map(id => `ids=${id}`).join("&");

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/latest/data?${queryParams}`)
          .then(response => response.json())
          .then((data: MangaApiResponse) => setLatestUpdatesMangaData(data.data))
          .catch(error => console.error("Failed to fetch latest manga data:", error))
          .finally(() => setLoading(false)); 
  }, [latestUpdatesData]);

  if (loading) {
    return <Loading/>;
  }


  return (
    <MainLayout mainPage={true}>
      <LatestUpdates data={latestUpdatesMangaData}  chapterDatas={latestUpdatesData} total={50} currentPage={page}/>
    </MainLayout>
  );
}

interface MangaDetailProps {
  data: Manga[];
  chapterDatas: Chapter[];
  total: number;
  currentPage: number;
}

const LatestUpdates: React.FC<MangaDetailProps> = ({ data, chapterDatas, total, currentPage }) => {
  const router = useRouter();

  const generatePagination = (currentPage: number, total: number) => {
    const pages: (number | "...")[] = [];
    const showDots = total > 4; // Show dots only if more than 4 pages
  
    if (currentPage <= 2) {
      // First few pages case: 1 2 3 ... lastPage
      pages.push(1, 2, 3);
      if (showDots) pages.push("...");
      pages.push(total);
    } else if (currentPage >= total - 1) {
      // Last few pages case: 1 ... last-2 last-1 lastPage
      if (showDots) pages.push(1, "...");
      pages.push(total - 2, total - 1, total);
    } else {
      // Middle pages case: 1 ... current-1 current current+1 ... lastPage
      pages.push(1, "...");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("...", total);
    }
  
    return pages;
  };
  
  const pagination = generatePagination(currentPage, total);

  const [inputStates, setInputStates] = useState<Record<number, boolean>>({});
  const [pageInput, setPageInput] = useState("");

  const handlePageSubmit = (index: number) => {
    let pageNumber = parseInt(pageInput, 10);

    if (!isNaN(pageNumber)) {
      pageNumber = Math.max(1, Math.min(pageNumber, total)); // Keep within valid range
      router.push(`/latest-updates?page=${pageNumber}`);
    }

    setInputStates((prev) => ({ ...prev, [index]: false }));
    setPageInput("");
  };

  return (
      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[16px] font-bold">Latest Updates</p>
          <p className="text-[14px] font-bold bg-[#FD5F00] px-2 rounded-sm">Back</p>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4 '>
          {data.map((manga, index) => {
            const image = getMangaCoverImage(manga.id, manga.relationships, "256");

            const chapterDataList = chapterDatas
            .filter(chapter => chapter.relationships.find(rel => rel.type === "manga")?.id == manga.id)
              .map(chapter => ({
                id: chapter.id,
                chapter: chapter.attributes.chapter, 
                readableAt: chapter.attributes.readableAt, 
              }));
          
            const chapterData = chapterDataList.length > 0 
              ? chapterDataList.sort((a, b) => new Date(b.readableAt).getTime() - new Date(a.readableAt).getTime())[0]
              : null;
            
            const currentTime = new Date();

            const readableAtTime = chapterData ? new Date(chapterData.readableAt) : null;

            const getTimeDifference = (pastTime: Date) => {
              const diffInSeconds = Math.floor((currentTime.getTime() - pastTime.getTime()) / 1000);
              
              if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
              const diffInMinutes = Math.floor(diffInSeconds / 60);
              if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
              const diffInHours = Math.floor(diffInMinutes / 60);
              if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
              const diffInDays = Math.floor(diffInHours / 24);
              return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
            };
            
            const timeAgo = readableAtTime ? getTimeDifference(readableAtTime) : "";

            return (
              <Link key={manga.id} href={`/title/${manga.id}`} passHref>
                <div  className="flex flex-col gap-y-[2px]">
                  <div className="relative w-full h-full aspect-[3/4]">
                    <img 
                      src={image} 
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-md" 
                      alt={manga.attributes.title.en || "Manga Cover"} 
                    />
                    <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOren"} bgOren rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                  </div>
                  <p className="text-[14px] font-semibold line-clamp-1">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                  <div className='flex flex-row justify-between w-full'>
                    <div className="flex flex-row items-center gap-1">
                      <div className="w-[4px] h-[4px] bg-[#FD5F00] rounded-full" />
                      <p className="text-[12px] opacity-80">{chapterData?.chapter ? `Chapter ${chapterData?.chapter}` : "Oneshot"}</p>
                    </div>
                      <p className="text-[12px] opacity-80">{timeAgo}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className='flex flex-row gap-4 justify-center items-center'>
          <IconButton disabled={currentPage === 1}>
            <Link href={`/latest-updates?page=${currentPage-1}`} passHref>
              <ArrowBackRoundedIcon sx={{ color: currentPage === 1 ? "#403F3F" : "white" }} />
            </Link>
          </IconButton>
          <div className='flex flex-row gap-2 justify-center items-center'>
          {pagination.map((page, index) => (
            typeof page === "number" ? (
              <Link key={index} href={`/latest-updates?page=${page}`} passHref>
                <div
                  className={`text-[16px] font-medium py-1 min-w-[30px] text-center rounded cursor-pointer ${
                    currentPage === page ? "bg-[#FD5F00] text-white" : "bgAbu"
                  }`}
                >
                  <p>{page}</p>
                </div>
              </Link>
            ) : (
            <div
              key={index}
              className="text-[16px] font-medium py-1 min-w-[30px] text-center rounded bgAbu cursor-pointer"
              onClick={() => setInputStates((prev) => ({ ...prev, [index]: true }))}
            >
            {inputStates[index] ? (
              <input
                type="number"
                className="w-[25px] text-center bgAbu no-arrows"
                placeholder="..."
                value={pageInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                    setPageInput(value);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePageSubmit(index)}
                onBlur={() => handlePageSubmit(index)}
                autoFocus
              />
            ) : (
              <p>...</p>
            )}
          </div>
            )
          ))}
          </div>
          <IconButton disabled={currentPage === total}>
            <Link href={`/latest-updates?page=${currentPage+1}`} passHref>
              <ArrowForwardRoundedIcon sx={{ color: currentPage === total ? "#403F3F" : "white" }} />
            </Link>
          </IconButton>
        </div>
      </div>
  );
};