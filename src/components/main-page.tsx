import React from "react";

const MainPage = () => {

 const mangaData = Array(6).fill({
    title: "Myst, Might, Mayhem",
    img: "/img/tes.jpg",
    status: "Ongoing",
    chapters: [
      { name: "Chapter 61", time: "23 Hour Ago" },
      { name: "Chapter 60", time: "1 Day Ago" },
      { name: "Chapter 59", time: "2 Days Ago" },
      { name: "Chapter 58", time: "3 Days Ago" },
      { name: "Chapter 57", time: "4 Days Ago" },
    ],
  })

const murimData = Array(6).fill({
  category: "Murim",
  title: "Myst, Might, Mayhem",
  img: "/img/tes.jpg",
})

  return (
    <div className="w-full px-4 pt-5">
      <div className="space-y-5">
          <MangaDetail data={mangaData}/>
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
  data: MangaDataProps[];
}

const MangaDetail: React.FC<MangaDetailProps> = ({ data }) => {
  return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between">
          <p className="text-[16px] font-bold">Latest Updates</p>
          <p className="text-[14px] font-bold bg-[#FD5F00] px-2 rounded-sm">View All</p>
        </div>
        {data.map((manga, index) => (
          <div className="flex flex-row gap-2">
            <div className="relative min-w-[90px] min-h-[135px] ">
              <img src={manga.img} className="absolute w-[90px] h-[135px] rounded-sm" alt={manga.title}/>
              <p className="absolute z-10 font-medium text-[8px] bg-[#FD5F00] rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2">{manga.status}</p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <p className="font-bold">{manga.title}</p>
              <div className="flex flex-col gap-1">
                {manga.chapters.map((ch, index) => (
                  <div key={index} className="flex flex-row w-full items-center gap-1">
                    <div className="w-[4px] h-[4px] bg-[#FD5F00] rounded-full" />
                    <div className="w-full flex justify-between">
                      <p className="text-[12px] opacity-80">{ch.name}</p>
                      <p className="text-[12px]">{ch.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
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
      <div className="flex flex-row justify-between">
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