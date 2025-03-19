"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { useEffect, useRef, useState } from 'react';
import { getMangaCoverImage } from '@/utils/api';
import Link from 'next/link';
import MainLayout from "@/app/layout/index";
import { Manga, MangaApiResponse, Chapter } from '@/components/types';
import { Loading } from '@/components/loading';
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function Home() {
  const [popularNewTitle, setPopularNewTitle] = useState<Manga[]>([]);
  const [latestUpdatesData, setLatestUpdatesData] = useState<Chapter[]>([]);
  const [latestUpdatesMangaData, setLatestUpdatesMangaData] = useState<Manga[]>([]);
  const [mostFollowedData, setMostFollowedData] = useState<Manga[]>([]);
  const [topRatingData, setTopRatingData] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const currentManga = popularNewTitle[activeIndex];
  const currentImage = currentManga ? getMangaCoverImage(currentManga.id, currentManga.relationships, "256") : "";
  const swiperRef = useRef<any>(null); 
  const [sliderRef] = useKeenSlider({
    loop: false, // Set to true for infinite scrolling
    mode: "free",
    slides: { perView: "auto", spacing: 10 },
  });

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        const [topResponse, latestResponse, mostFollowedResponse, topRatingResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/top`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/latest/20/0`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/mostfollowed/10/0`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/highestrating/10/0`).then(res => res.json()),
        ]);

        setPopularNewTitle(topResponse.data);
        setLatestUpdatesData(latestResponse.data);
        setMostFollowedData(mostFollowedResponse.data);
        setTopRatingData(topRatingResponse.data);
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      }
    };

    fetchMangaData();
  }, []);


  useEffect(() => {
      if (latestUpdatesData.length === 0) return;

      const ids = Array.from(
          new Set(
              latestUpdatesData
                  .map(chapter => chapter.relationships.find(rel => rel.type === "manga")?.id)
                  .filter(Boolean)
          )
      ).slice(0, 10);

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
    <MainLayout bgImage={currentImage} mainPage={true}>
      <div className='cursor-pointer'>
        <div className="flex justify-center items-center gap-x-2 pb-6">
          {popularNewTitle.map((_, index) => (
            <div
              key={index}
              className={`w-[8px] h-[8px] rounded-full cursor-pointer ${
                index === activeIndex ? "bgOren" : "bg-[#FFFFFF]"
              }`}
              onClick={() => {
                setActiveIndex(index)
                if (swiperRef.current) {
                  swiperRef.current.slideToLoop(index); 
                }
              }}
            />
          ))}
        </div>
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          spaceBetween={10}
          slidesPerView={1}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          className="w-full"
          modules={[Pagination, Autoplay]}
          initialSlide={activeIndex}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
        >
          {popularNewTitle.map((manga) => {
            const author = manga.relationships.find(rel => rel.type === "author");
            const artist = manga.relationships.find(rel => rel.type === "artist");
            const image = getMangaCoverImage(manga.id, manga.relationships, "256");
            return(
            <SwiperSlide key={manga.id}>
              <Link href={`/title/${manga.id}`} passHref>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row gap-2 md:gap-x-4">
                    <div className="relative min-w-[160px] md:min-w-[250px] lg:min-w-[300px] h-full aspect-[3/4]">
                      <img 
                        src={image} 
                        className="absolute h-full w-full rounded-md object-cover"
                        alt={manga.attributes.title.en || "Manga Cover"} 
                      />
                      <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-[16px] md:text-[32px] font-bold line-clamp-3">{manga.attributes.title.en}</p>
                        <div className="flex gap-2 flex-wrap">
                          <div className="bgOrenNoHover px-2 rounded-md">
                              <p className="text-[12px] md:text-[14px] font-medium">{manga.attributes.contentRating.toUpperCase()}</p>
                          </div>
                          {manga.attributes.tags
                            .filter((genre) => genre.attributes.group === 'genre')
                            .slice(0,5)
                            .map((genre, i) => (
                            <div key={i} className="bgAbu px-2 rounded-md">
                              <p className="text-[12px] md:text-[14px] font-medium">{genre.attributes.name.en.toUpperCase()}</p>
                            </div>
                          ))}
                          <div className='hidden md:flex'>
                            <p className="text-[16px] font-regular text-justify md:line-clamp-5 line-clamp-6 break-all break-words">
                              {manga.attributes.description.en}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[14px] md:text-[24px] italic">{author?.attributes?.name}, {artist?.attributes?.name}</p>
                    </div>
                  </div>

        
                </div>
              </Link>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <div className='space-y-4'>
        <div className='space-y-3'>
          <div className="flex flex-row justify-between items-center">
            <p className="text-[16px] md:text-[24px] font-bold">Most Followed</p>
            <Link href="/most-followed" passHref>
              <p className="text-[14px] md:text-[18px] font-bold bgOren px-2 rounded-sm">View All</p>
            </Link>
          </div>
          <div  ref={sliderRef}  className='keen-slider overflow-hidden max-w-full w-full h-full'>
          {mostFollowedData.map((manga) => {
            const image = getMangaCoverImage(manga.id, manga.relationships, "256");
            return (
              <div key={manga.id} className="keen-slider__slide min-w-[200px] sm:min-w-[250px] lg:min-w-[300px]">
                <Link href={`/title/${manga.id}`} passHref>
                  <div  className="w-full h-full flex flex-col gap-y-[2px] relative group">
                    <div className="relative w-full h-full aspect-[3/4]">
                      <img 
                        src={image}   
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md" 
                        alt={manga.attributes.title.en || "Manga Cover"} 
                      />
                      <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                    </div>
                    <p className="text-[14px] font-semibold line-clamp-1">
                      {manga.attributes.title?.en || Object.values(manga.attributes.title || {})[0] }
                    </p>
                    <div className="flex flex-col items-center p-4 absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 text-white rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 ">
                      <div className="flex flex-col justify-between gap-2 flex-wrap">
                          <div className='flex flex-row gap-1 flex-wrap'>
                            <div className="bgOrenNoHover px-2 rounded-md">
                                <p className="text-[10px] sm:text-[12px] font-medium">{manga.attributes.contentRating.toUpperCase()}</p>
                            </div>
                            {manga.attributes.tags
                              .filter((genre) => genre.attributes.group === 'genre')
                              .slice(0,5)
                              .map((genre, i) => (
                              <div key={i} className="bgAbu px-2 rounded-md">
                                <p className="text-[10px] sm:text-[12px] font-medium">{genre.attributes.name.en.toUpperCase()}</p>
                              </div>
                            ))}
                          </div>
                          <div className='max-h-[165px] sm:max-h-[220px] lg:max-h-[300px] px-1 overflow-y-auto'>
                            <p className="text-[12px] sm:text-[14px] font-regular text-justify break-all break-words">
                              {manga.attributes.description.en}
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          </div>
        </div>
        <div className='space-y-3'>
          <div className="flex flex-row justify-between items-center">
            <p className="text-[16px] md:text-[24px] font-bold">Top Rating</p>
            <Link href="/highest-rating" passHref>
              <p className="text-[14px] md:text-[18px] font-bold bgOren px-2 rounded-sm">View All</p>
            </Link>
          </div>
          <div  ref={sliderRef}  className='keen-slider overflow-hidden max-w-full w-full h-full'>
          {topRatingData.map((manga) => {
            const image = getMangaCoverImage(manga.id, manga.relationships, "256");
            return (
              <div key={manga.id} className="keen-slider__slide min-w-[200px] sm:min-w-[250px] lg:min-w-[300px]">
                <Link href={`/title/${manga.id}`} passHref>
                  <div  className="w-full h-full flex flex-col gap-y-[2px] relative group">
                    <div className="relative w-full h-full aspect-[3/4]">
                      <img 
                        src={image}   
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md" 
                        alt={manga.attributes.title.en || "Manga Cover"} 
                      />
                      <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                    </div>
                    <p className="text-[14px] font-semibold line-clamp-1">
                      {manga.attributes.title?.en || Object.values(manga.attributes.title || {})[0] }
                    </p>
                    <div className="flex flex-col items-center p-4 absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 text-white rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 ">
                      <div className="flex flex-col justify-between gap-2 flex-wrap">
                          <div className='flex flex-row gap-1 flex-wrap'>
                            <div className="bgOrenNoHover px-2 rounded-md">
                                <p className="text-[10px] sm:text-[12px] font-medium">{manga.attributes.contentRating.toUpperCase()}</p>
                            </div>
                            {manga.attributes.tags
                              .filter((genre) => genre.attributes.group === 'genre')
                              .slice(0,5)
                              .map((genre, i) => (
                              <div key={i} className="bgAbu px-2 rounded-md">
                                <p className="text-[10px] sm:text-[12px] font-medium">{genre.attributes.name.en.toUpperCase()}</p>
                              </div>
                            ))}
                          </div>
                          <div className='max-h-[165px] sm:max-h-[220px] lg:max-h-[300px] px-1 overflow-y-auto'>
                            <p className="text-[12px] sm:text-[14px] font-regular text-justify break-all break-words">
                              {manga.attributes.description.en}
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          </div>
        </div>
        <LatestUpdates data={latestUpdatesMangaData}  chapterDatas={latestUpdatesData}/>
      </div>
    </MainLayout>
  );
}

interface MangaDetailProps {
  data: Manga[];
  chapterDatas: Chapter[];
}

const LatestUpdates: React.FC<MangaDetailProps> = ({ data, chapterDatas }) => {
  
  return (
      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[16px] md:text-[24px] font-bold">Latest Updates</p>
          <Link href="/latest-updates" passHref>
            <p className="text-[14px] md:text-[18px] font-bold bgOren px-2 rounded-sm">View All</p>
          </Link>
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
                    <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                  </div>
                  <p className="text-[14px] font-semibold line-clamp-1">
                    {manga.attributes.title?.en || Object.values(manga.attributes.title || {})[0] }
                  </p>
                  <div className='flex flex-row justify-between items-center w-full'>
                    <div className="flex flex-row items-center justify-center gap-1">
                      <div className="w-[4px] h-[4px] bgOren rounded-full" />
                      <p className="text-[12px] opacity-80">{chapterData?.chapter ? `Chapter ${chapterData?.chapter}` : "Oneshot"}</p>
                    </div>
                      <p className="text-[12px] opacity-80">{timeAgo}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
  
      </div>
   
  );
};