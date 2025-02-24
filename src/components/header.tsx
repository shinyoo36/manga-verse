"use client";


import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { useEffect, useRef, useState } from 'react';

const data = Array(10).fill({
  title: "Myst, Might, Mayhem",
  imgSrc: "/img/tes.jpg",
  genres: ["ACTION", "ADVENTURE", "DRAMA", "FANTASY"],
  author: "Hanjung Wolya (한중월야), Madbird (매드버드)",
  description:
    "All Jeong wants is a second chance -- for revenge! His grandfather’s gruesome death has transformed him into the bloodthirsty and ruthless Scythe Demon...",
});


interface Manga {
  id: string;
  type: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    isLocked: boolean;
    links: Record<string, string>;
    originalLanguage: string;
    lastVolume: string;
    lastChapter: string;
    publicationDemographic: string;
    status: string;
    year: number;
    contentRating: string;
    tags: {
      id: string;
      type: string;
      attributes: {
        name: Record<string, string>;
        description: Record<string, string>;
        group: string;
        version: number;
      };
      relationships: any[];
    }[];
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: {
    id: string;
    type: string;
    attributes?: {
      name: string;
      fileName: string;
      imageUrl?: string | null;
      biography?: Record<string, string>;
      twitter?: string | null;
      pixiv?: string | null;
      melonBook?: string | null;
      fanBox?: string | null;
      booth?: string | null;
      namicomi?: string | null;
      nicoVideo?: string | null;
      skeb?: string | null;
      fantia?: string | null;
      tumblr?: string | null;
      youtube?: string | null;
      weibo?: string | null;
      naver?: string | null;
      website?: string | null;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
  }[];
}

interface MangaApiResponse {
  result: string;
  response: string;
  data: Manga[];
}

const Header = () => {


  return (
    <div className="w-full h-[380px] header space-y-3">
      <div className="h-[70px]  px-4 flex justify-between items-center">
        <p className="font-protest text-[32px] tracking-wide">MangaVerse</p>
        <div className="flex gap-4">
          <img src="/icons/search.svg" alt="Search" />
          <img src="/icons/profile.svg" alt="Profile" />
        </div>
      </div>
      <Carousel />
    </div>
  );
};

export default Header;

const Carousel = () => {
  const [popularNewTitle, setPopularNewTitle] = useState<Manga[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null); 

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&createdAtSince=2025-01-24T17%3A00%3A00`
    ,{
      method: "GET",
      headers: {
        "Origin": "https://mangaverseread.vercel.app",
        "Content-Type": "application/json",
      },
    })
    .then(response => response.json())
    .then((data: MangaApiResponse) => setPopularNewTitle(data.data));
  }, []);

  console.log("popularNewTitle", popularNewTitle);

  return (
    <div>
      <div className="flex justify-center items-center gap-2 pb-6">
        {popularNewTitle.map((_, index) => (
          <div
            key={index}
            className={`w-[8px] h-[8px] rounded-full cursor-pointer ${
              index === activeIndex ? "bg-[#FD5F00]" : "bg-[#FFFFFF]"
            }`}
            onClick={() => {
              setActiveIndex(index)
              if (swiperRef.current) {
                swiperRef.current.slideToLoop(index); // Ensure correct loop index
              }
            }}
          />
        ))}
      </div>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={10}
        slidesPerView={1}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} 
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
          const coverArt = manga.relationships.find(rel => rel.type === "cover_art");
          const author = manga.relationships.find(rel => rel.type === "author");
          const artist = manga.relationships.find(rel => rel.type === "artist");

          return(
          <SwiperSlide key={manga.id}>
            <div className="flex flex-col gap-3  px-4">
              <div className="flex flex-row gap-2 ">
                <div className="relative min-h-[196px] min-w-[150px]">
                  <img 
                    src={coverArt ? `https://mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : "/fallback-image.jpg"} 
                    className="h-[196px] w-[150px] rounded-md object-cover"
                    alt={manga.attributes.title.en || "Manga Cover"} 
                  />
                  <p className="absolute z-10 font-medium text-[8px] bg-[#FD5F00] rounded-t-md bottom-0 px-1 left-1/2 transform -translate-x-1/2">{manga.attributes.status}</p>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[16px] font-bold line-clamp-2 sm:line-clamp-none">{manga.attributes.title.en}</p>
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-[#FD5F00] px-2 rounded-md">
                          <p className="text-[12px] font-medium">{manga.attributes.contentRating.toUpperCase()}</p>
                      </div>
                      {manga.attributes.tags
                        .filter((genre) => genre.attributes.group === 'genre')
                        .map((genre, i) => (
                        <div key={i} className="bg-[#403F3F] px-2 rounded-md">
                          <p className="text-[12px] font-medium">{genre.attributes.name.en.toUpperCase()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[14px] italic">{author?.attributes?.name}, {artist?.attributes?.name}</p>
                </div>
              </div>

              <p className="text-[12px] text-justify line-clamp-2 sm:line-clamp-none">
                {manga.attributes.description.en}
              </p>

              <div className="flex flex-col items-center relative">
                <div className="bg-[#FD5F00] h-[1.5px] w-full absolute"/>
                <div className="bg-[#FD5F00] w-fit flex flex-row gap-2 px-2 rounded-b-[5px] ">
                  <img src="/icons/dropdown.svg"/>
                  <p className="text-[12px]">see more</p>
                  <img src="/icons/dropdown.svg"/>
                </div>
              </div>
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="custom-pagination flex justify-center items-center gap-2 pt-3"></div>
    </div>
  );
};