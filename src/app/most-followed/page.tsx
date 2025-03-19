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
import { Manga, MangaApiResponse, Chapter, MangaStat } from '@/components/types';
import { Loading } from '@/components/loading';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

export default function MostFollowedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MostFollowedContent />
    </Suspense>
  );
}

function MostFollowedContent () {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const size = 10;
  const offset = (page - 1) * size; 

  const [latestUpdatesMangaData, setMostFollowedMangaData] = useState<Manga[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        setLoading(true);
  
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/mostfollowed/${size}/${offset}`);
        const mangaData = await response.json();
  
        const mangaIds = mangaData.data.map((manga: Manga) => manga.id);
  
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/stat-ids/${mangaIds}`);
        const statsData = await statsResponse.json();
  
        setMostFollowedMangaData(mangaData.data);
        setMangaStats(statsData.statistics);
  
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMangaData();
  }, [size, offset]);
  
  return (
    <MainLayout mainPage={true}>
      <MostFollowed data={latestUpdatesMangaData} mangaStats={mangaStats} loading={loading} total={100} currentPage={page}/>
    </MainLayout>
  );
}

interface MangaDetailProps {
  data: Manga[];
  mangaStats: MangaStat | null;
  loading: boolean;
  total: number;
  currentPage: number;
}

const MostFollowed: React.FC<MangaDetailProps> = ({ data, mangaStats, loading, total, currentPage }) => {
  const router = useRouter();
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);
  
  const generatePagination = (currentPage: number, total: number) => {
    const pages: (number | "...")[] = [];
    const showDots = total > 4;
  
    if (currentPage <= 2) {
      pages.push(1, 2, 3);
      if (showDots) pages.push("...");
      pages.push(total);
    } else if (currentPage >= total - 1) {
      if (showDots) pages.push(1, "...");
      pages.push(total - 2, total - 1, total);
    } else {
      pages.push(1, "...");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("...", total);
    }
  
    return pages;
  };
  
  const pagination = generatePagination(currentPage, total);

  const [inputStates, setInputStates] = useState<Record<number, boolean>>({});
  const [pageInput, setPageInput] = useState("");
  const [viewOptions, setViewOptions] = useState("grid");

  const handlePageSubmit = (index: number) => {
    let pageNumber = parseInt(pageInput, 10);

    if (!isNaN(pageNumber)) {
      pageNumber = Math.max(1, Math.min(pageNumber, total)); 
      router.push(`/most-followed?page=${pageNumber}`);
    }

    setInputStates((prev) => ({ ...prev, [index]: false }));
    setPageInput("");
  };

  return (
      <div className="flex flex-col justify-center gap-4">
        <div className='flex flex-row justify-between items-center'>
            <div className="flex gap-x-2 items-center">
              <Link href={"/"} passHref>
                  <ArrowBackRoundedIcon/>
              </Link>
              <p className='text-[24px]'>Most Followed</p>
            </div>
            <div className='flex flex-row gap-x-2 items-center justify-center'>
                <div 
                    className={`cursor-pointer px-1 py-1  w-fit h-fit rounded-md ${viewOptions === 'grid' ? 'bgOrenNoHover' : ''}`}
                    onClick={() => setViewOptions('grid')}
                >
                    <img src="/icons/customGrid.svg" className='w-[24px]'/>
                </div>
                <div 
                    className={`cursor-pointer px-1 py-1  w-fit h-fit rounded-md ${viewOptions === 'row' ? 'bgOrenNoHover' : ''}`}
                    onClick={() => setViewOptions('row')}
                >
                    <img src="/icons/customList.svg" className='w-[24px]'/>
                </div>
            </div>
        </div>
        {loading ? (
        <div className="min-h-[calc(100vh-248px)] h-full justify-center items-center flex flex-col gap-3">
            <div className="w-12 h-12 border-4 bgborder-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-lg font-semibold">Loading{dots}</p>
        </div>    
        ) : (
          (viewOptions === 'grid') ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4 '>
              {data.map((manga, index) => {
                const image = getMangaCoverImage(manga.id, manga.relationships, "256");
                const follows = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.follows ?? 0 : 0;
                const rating = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.rating.average ?? 0 : 0;
                const formattedFollows = follows >= 1000 ? `${(follows / 1000).toFixed(0)}k` : follows;
                const formattedRating = rating?.toFixed(2);
  
                return (
                  <Link key={manga.id} href={`/title/${manga.id}`} passHref>
                    <div  className="flex flex-col gap-y-[2px]">
                      <div className="relative w-full h-full aspect-[3/4]">
                        <img 
                          src={image} 
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-md" 
                          alt={manga.attributes.title.en || "Manga Cover"} 
                        />
                        <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                      </div>
                      <p className="text-[14px] font-semibold line-clamp-1">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                      <div className='flex flex-row justify-between items-center w-full'>
                          <div className="flex flex-row gap-2 flex-wrap">
                              <p className="text-[10px] md:text-[12px] font-medium bgOrenNoHover px-1 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
                          </div>
                          <div className="flex flex-row gap-x-[2px] items-center">
                              <div className="flex flex-row  justify-center items-center">
                                  <BookmarkBorderRoundedIcon className='text-[17px] sm:text-[19px]' sx={{color:'#FD5F00'}} />
                                  <p className="text-[10px] md:text-[12px] font-regular ">{formattedFollows}</p>
                              </div>
                              <div className="flex flex-row justify-center items-center">
                                  <StarBorderRoundedIcon className='text-[18px] sm:text-[20px]' sx={{color:'#FD5F00'}} />
                                  <p className="text-[10px] md:text-[12px] font-regular">{formattedRating}</p>
                              </div>
                          </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className='flex flex-col gap-3 '>
              {data.map((manga, index) => {
                const image = getMangaCoverImage(manga.id, manga.relationships, "256");
                const follows = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.follows ?? 0 : 0;
                const rating = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.rating.average ?? 0 : 0;
                const formattedFollows = new Intl.NumberFormat("en-US").format(follows); 
                const formattedRating = rating?.toFixed(2);
  
                return (
                  <Link key={manga.id} href={`/title/${manga.id}`} passHref>
                    <div  className="flex flex-row gap-x-2">
                      <div className="relative w-[105px] h-[140px] aspect-[3/4]">
                          <img 
                              src={image} 
                              className="absolute top-0 left-0 w-full h-full object-cover rounded-sm" 
                              alt={manga.attributes.title.en || "Manga Cover"} 
                          />
                          <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                      </div>
                      <div className='flex flex-col gap-y-2 justify-between w-full'>
                        <div>
                          <p className="text-[14px] font-semibold line-clamp-1">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                          <div className="flex flex-row gap-2 flex-wrap">
                              <p className="text-[12px] font-medium bgOrenNoHover px-2 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
                              {manga.attributes.tags
                              .filter((genre) => genre.attributes.group === 'genre')
                              .slice(0, 6)
                              .map((genre, i) => (
                                  <p 
                                      key={genre.id || `${genre.attributes.name.en}-${i}`} // Ensure uniqueness
                                      className="text-[12px] font-regular bgAbu px-1 rounded-[3.5px]"
                                  >
                                      {genre.attributes.name.en.toUpperCase()}
                                  </p>
                              ))}
                          </div>
                          <div className='hidden md:flex'>
                              <p className="text-[12px] font-regular text-justify line-clamp-4 break-all break-words opacity-80">
                              {manga.attributes.description.en}
                              </p>
                          </div>
                        </div>
                        <div className="flex flex-row gap-x-2 py-1 items-center">
                            <div className="flex flex-row gap-x-[2px] justify-center items-center">
                                <BookmarkBorderRoundedIcon sx={{color:'#FD5F00'}} />
                                <p className="text-[14px] font-regular ">{formattedFollows}</p>
                            </div>
                            <div className="flex flex-row gap-x-[2px] justify-center items-center">
                                <StarBorderRoundedIcon sx={{color:'#FD5F00'}} />
                                <p className="text-[14px] font-regular">{formattedRating}</p>
                            </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
        <div className='flex flex-row gap-4 justify-center items-center'>
          <IconButton disabled={currentPage === 1}>
            <Link href={`/most-followed?page=${currentPage-1}`} passHref>
              <ArrowBackRoundedIcon sx={{ color: currentPage === 1 ? "#403F3F" : "white" }} />
            </Link>
          </IconButton>
          <div className='flex flex-row gap-2 justify-center items-center'>
          {pagination.map((page, index) => (
            typeof page === "number" ? (
              <Link key={index} href={`/most-followed?page=${page}`} passHref>
                <div
                  className={`text-[16px] font-medium py-1 min-w-[30px] text-center rounded cursor-pointer ${
                    currentPage === page ? "bgOrenNoHover text-white" : "bgAbu"
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
            <Link href={`/most-followed?page=${currentPage+1}`} passHref>
              <ArrowForwardRoundedIcon sx={{ color: currentPage === total ? "#403F3F" : "white" }} />
            </Link>
          </IconButton>
        </div>
      </div>
  );
};