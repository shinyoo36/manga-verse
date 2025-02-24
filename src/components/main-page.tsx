"use client";

import React, {useEffect, useState} from "react";

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

const MainPage = () => {

  const [popularNewTitleData, setPopularNewTitleData] = useState<Manga[]>([]);
  const [latestUpdatesData, setLatestUpdatesData] = useState<Manga[]>([]);

  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&createdAtSince=2025-01-24T17%3A00%3A00`)
  //     .then(response => response.json())
  //     .then((data: MangaApiResponse) => setPopularNewTitleData(data.data));
  // }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/manga?includes[]=cover_art&limit=6&order%5BlatestUploadedChapter%5D=desc`)
      .then(response => response.json())
      .then((data: MangaApiResponse) => setLatestUpdatesData(data.data));
  }, []);
  // console.log("latestUpdatesData", latestUpdatesData);


const murimData = Array(6).fill({
  category: "Murim",
  title: "Myst, Might, Mayhem",
  img: "/img/tes.jpg",
})

  return (
    <div className="w-full px-4 pt-5">
      <div className="space-y-5">
          <LatestUpdates data={latestUpdatesData}/>
          <MangaRec category="Murim" data={murimData}/>
          <MangaRec category="Murim" data={murimData}/>
          <MangaRec category="Murim" data={murimData}/>
          <MangaRec category="Murim" data={murimData}/>
      </div>
    </div>
  );
};

export default MainPage;  

interface MangaDataProps {
  title: string;
  img: string;
  status: string;
  chapters: { name: string; time: string }[];
}

interface MangaDetailProps {
  data: Manga[];
}

const LatestUpdates: React.FC<MangaDetailProps> = ({ data }) => {
  
  return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[16px] font-bold">Latest Updates</p>
          <p className="text-[14px] font-bold bg-[#FD5F00] px-2 rounded-sm">View All</p>
        </div>
        {data.map((manga) => {
          const coverArt = manga.relationships.find(rel => rel.type === "cover_art");

          return (
            <div key={manga.id} className="flex flex-row gap-2">
              <div className="relative min-w-[90px] min-h-[135px] ">
              <img 
                src={coverArt ? `https://mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : "/fallback-image.jpg"} 
                className="absolute w-[90px] h-[135px] rounded-sm object-cover" 
                alt={manga.attributes.title.en || "Manga Cover"} 
              />
                <p className="absolute z-10 font-medium text-[8px] bg-[#FD5F00] rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2">{manga.attributes.status}</p>
              </div>
              <div className="w-full flex flex-col gap-1">
                <p className="font-bold">{manga.attributes.title.en}</p>
                {/* <div className="flex flex-col gap-1">
                  {manga.chapters.map((ch, index) => (
                    <div key={index} className="flex flex-row w-full items-center gap-1">
                      <div className="w-[4px] h-[4px] bg-[#FD5F00] rounded-full" />
                      <div className="w-full flex justify-between">
                        <p className="text-[12px] opacity-80">{ch.name}</p>
                        <p className="text-[12px]">{ch.time}</p>
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
   
  );
};


interface MangaRecDataProps {
  title: string;
  img: string;
}

interface MangaRecProps {
  category: string;
  data: MangaRecDataProps[];
}

const MangaRec: React.FC<MangaRecProps> = ({ category, data }) => {
  return (
    <div className="flex flex-col w-full space-y-3">
      <div className="flex flex-row justify-between items-center">
        <p className="text-[16px] font-bold">{category}</p>
        <p className="text-[14px] font-bold bg-[#FD5F00] px-2 rounded-sm">View All</p>
      </div>
      <div className="flex flex-row gap-2 max-w-[calc(100vw-16px)] overflow-x-auto ">
        {data.map((manga, index) => (
            <div className="relative min-w-[90px] min-h-[135px] ">
              <img src={manga.img} className="absolute w-[90px] h-[135px] rounded-sm" alt={manga.title}/>
            </div>
        ))}
      </div>

    </div>
  );
};