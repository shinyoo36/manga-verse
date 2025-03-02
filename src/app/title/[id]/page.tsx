"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMangaCoverImage } from "@/utils/api";
import { format } from "date-fns";
import MainLayout from "@/app/layout/index";
import Link from 'next/link';
import { Manga, MangaStat, Chapter } from '@/components/types';
import { Loading } from "@/components/loading";
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

const MangaDetailPage = () => {
  const { id } = useParams(); 
  const [manga, setManga] = useState<Manga | null>(null);
  const [mangaStat, setMangaStat] = useState<MangaStat | null>(null);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [scanlationGroup, setScanlationGroup] = useState('');
  
  const filterTopScanlationGroup = (chapters: Chapter[]) => {
    const scanlationCounts: Record<string, number> = {};

    chapters.forEach((chapter) => {
      const scanlation = chapter.relationships.find((rel) => rel.type === "scanlation_group");
      if (scanlation && scanlation.attributes?.name) {
        scanlationCounts[scanlation.attributes.name] = (scanlationCounts[scanlation.attributes.name] || 0) + 1;
      }
    });

    const topGroup = Object.entries(scanlationCounts).reduce(
      (max, group) => (group[1] > max[1] ? group : max),
      ["", 0]
    )[0];

    setScanlationGroup(topGroup);

    const filtered = chapters.filter((chapter) =>
      chapter.relationships.some(
        (rel) => rel.type === "scanlation_group" && rel.attributes?.name === topGroup
      )
    );

    setFilteredChapters(filtered);
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [mangaData, chapterList, chapterList2, mangaStat] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/${id}`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/chapter/${id}/${0}`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/chapter/${id}/${500}`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/stat/${id}`).then(res => res.json()),
        ]);
        const mergedChapters = [...chapterList.data, ...chapterList2.data];

        setManga(mangaData.data);
        filterTopScanlationGroup(mergedChapters);
        setMangaStat(mangaStat.statistics);
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      }
    };

    fetchData();
  }, [id]);


  if (!manga) return <Loading/>;

  const image = getMangaCoverImage(manga.id, manga.relationships, "512");

  if (!image) return <Loading/>;

  const authors = manga.relationships
    .filter((relation) => relation.type === "author")
    .map((author) => ({
      id: author.id,
      name: author.attributes?.name || "Unknown",
    }));

  const artists = manga.relationships
    .filter((relation) => relation.type === "artist")
    .map((author) => ({
      id: author.id,
      name: author.attributes?.name || "Unknown",
    }));

  
  const genres = manga.attributes.tags
    .filter((genre) => genre.attributes.group === 'genre')
    .map((genre) => ({
      id: genre.id,
      name: genre.attributes?.name.en || "Unknown",
    }));

  const formats = manga.attributes.tags
    .filter((format) => format.attributes.group === 'format')
    .map((format) => ({
      id: format.id,
      name: format.attributes?.name.en || "Unknown",
    }));


  const follows = mangaStat ? mangaStat[Object.keys(mangaStat)[0]]?.follows ?? 0 : 0;
  const rating = mangaStat ? mangaStat[Object.keys(mangaStat)[0]]?.rating.average ?? 0 : 0;
  const formattedFollows = new Intl.NumberFormat("en-US").format(follows); 
  const formattedRating = rating?.toFixed(2);

  return (
    <MainLayout bgImage={image}>
      <div className="md:hidden flex flex-col items-center justify-center">
        <div className="relative min-h-[200px] aspect-[3/4]">
          <img 
            src={image} 
            className="absolute h-full w-full rounded-md object-cover"
            alt={manga.attributes.title.en || "Manga Cover"} 
          />
          <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOren"} bgOren rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
        </div>
        <p className="text-[16px] font-bold pt-3 text-center line-clamp-1 w-[90%]">{manga.attributes.title.en}</p>
        <div className="flex flex-row gap-x-2 py-1 items-center justify-center">
          <div className="flex flex-row gap-1 justify-center items-center">
            <BookmarkBorderRoundedIcon sx={{color:'#FD5F00'}} />
            <p className="text-[14px] font-regular ">{formattedFollows}</p>
          </div>
          <div className="flex flex-row gap-1 justify-center items-center">
            <StarBorderRoundedIcon sx={{color:'#FD5F00'}} />
            <p className="text-[14px] font-regular">{formattedRating}</p>
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-row gap-x-4 px-3">
        <div className="relative min-h-[265px] aspect-[3/4]">
          <img 
            src={image} 
            className="absolute h-full w-full rounded-md object-cover"
            alt={manga.attributes.title.en || "Manga Cover"} 
          />
          <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOren"} bgOren rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
        </div> 
        <div className="flex flex-col justify-between">
          <p className="text-[32px] font-bold text-left">{manga.attributes.title.en}</p>
          <div className="flex flex-row gap-x-2 py-1 items-center">
            <div className="flex flex-row gap-1 justify-center items-center">
              <BookmarkBorderRoundedIcon sx={{color:'#FD5F00', fontSize:'30px'}} />
              <p className="text-[24px] font-regular ">{formattedFollows}</p>
            </div>
            <div className="flex flex-row gap-1 justify-center items-center">
              <StarBorderRoundedIcon sx={{color:'#FD5F00', fontSize:'30px'}} />
              <p className="text-[24px] font-regular">{formattedRating}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold md:text-[24px] md:font-bold">Title</p>
            <p className="text-[12px] font-regular md:text-[20px] md:opacity-80">{manga.attributes.title.en}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold md:text-[24px] md:font-bold">Alternative Title</p>
            <p className="text-[12px] font-regular text-justify md:text-[20px] md:opacity-80">{manga.attributes.altTitles.find(title => title.en)?.en ?? "-"}</p>
          </div>
          <InfoList title="Author" data={authors} />
          <InfoList title="Artist" data={artists} />
          <InfoList title="Genre" data={genres} />
          <InfoList title="Format" data={formats} />
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold md:text-[24px] md:font-bold">
              Synopsis
            </p>
            <p className="text-[12px] font-regular text-justify md:text-[20px] md:opacity-80">
              {manga.attributes.description.en}
            </p>
          </div>
          <div className="bgAbu h-[1.5px] w-full"/>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between">
            <p className="text-[14px] font-semibold md:text-[24px] md:font-bold">Chapters List</p>
            <p className="text-[14px] font-medium textOren md:text-[24px] md:font-semibold">© {scanlationGroup}</p>
          </div>
          {filteredChapters.length > 0 && (() => {
            const validChapters = filteredChapters
              .filter(c => !isNaN(Number(c.attributes.chapter)))
              .map(c => ({ id: c.id, chapter: Number(c.attributes.chapter) }));

            if (validChapters.length === 0) return null;

            const firstChapter = validChapters.reduce((prev, curr) => (curr.chapter < prev.chapter ? curr : prev));
            const lastChapter = validChapters.reduce((prev, curr) => (curr.chapter > prev.chapter ? curr : prev));

            return (
              <div className="flex flex-row gap-4 justify-center">
                <Link href={`/title/${manga.id}/chapter/${firstChapter.id}`} passHref>
                  <div className="bgOren gap-1 flex flex-col px-7 py-2 items-center rounded-[3.5px]">
                    <p className="text-[12px] font-semibold md:text-[24px] md:font-bold">Read First</p>
                    <p className="text-[12px] font-regular md:text-[22px] md:opacity-80">Chapter {firstChapter.chapter}</p>
                  </div>
                </Link>
                <Link href={`/title/${manga.id}/chapter/${lastChapter.id}`} passHref>
                  <div className="bgOren gap-1 flex flex-col px-7 py-2 items-center rounded-[3.5px]">
                    <p className="text-[12px] font-semibold md:text-[24px] md:font-bold">Read Last</p>
                    <p className="text-[12px] font-regular md:text-[22px] md:opacity-80">Chapter {lastChapter.chapter}</p>
                  </div>
                </Link>
              </div>
            );
          })()}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px]">
            {filteredChapters.map((chapter) => (
            <Link key={chapter.id} href={`/title/${manga.id}/chapter/${chapter.id}`} passHref>
              <div className="bgAbu flex flex-row gap-2">
                <div className="bgOren w-[4px] min-h-fit rounded-r-md"/>
                <div className="py-1 gap-[2px] flex flex-col">
                  <p className="text-[12px] font-semibold md:text-[18px] md:font-bold">
                    {chapter.attributes.chapter ? `Chapter ${chapter.attributes.chapter}` : "Oneshot"}
                  </p>
                  <p className="text-[10px] font-regular md:text-[14px] md:opacity-80">
                    {format(new Date(chapter.attributes.createdAt), "MMMM do, yyyy")}
                  </p>
                </div>
              </div>
            </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MangaDetailPage;

interface InfoListProps {
  title: string;
  data: { id: string; name: string }[];
}

const InfoList: React.FC<InfoListProps> = ({ title, data }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[14px] font-semibold md:text-[24px] md:font-bold">{title}</p>
      <div className="flex flex-row gap-2 flex-wrap">
        {data.map((item) => (
          <p
            key={item.id}
            className="text-[12px] font-regular md:text-[18px] bgAbu px-2 py-1 rounded-[3.5px]"
          >
            {item.name}
          </p>
        ))}
      </div>
    </div>
  );
};

