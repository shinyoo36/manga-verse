"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/app/layout/index";
import { Manga, ChapterDetail, Chapter } from '@/components/types';
import Link from "next/link";
import { Loading } from "@/components/loading";
import { IconButton } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { NotFound } from "@/components/notfound";

const MangaDetailPage = () => {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  const { id, chapterId } = useParams(); 
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapterData, setChapterData] = useState<ChapterDetail | null>(null);
  const [hash, setHash] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
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
        const [mangaData, chapterList, chapterData] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/${id}`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/chapter/${id}/${0}`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chapter/details/${chapterId}`).then(res => res.json()),
        ]);
        if (mangaData.status === 404) {
          setNotFound(true);
        } else {
          setManga(mangaData.data);
          filterTopScanlationGroup(chapterList.data);
          setChapterData(chapterData);
          setHash(chapterData.chapter.hash);
          setBaseUrl(chapterData.baseUrl);
        }
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      }
    };

    fetchData();
  }, [id, chapterId]);

  if (notFound) {
    return <NotFound />;
  }

  if (!manga) return <Loading/>;
  if (!filteredChapters) return <Loading/>;
  if (!chapterData) return <Loading/>;

  const currentCh = filteredChapters.find(chapter => chapter.id === chapterId)?.attributes;
  const currentIndex = filteredChapters.findIndex((ch) => ch.id === chapterId);
  const isLast = currentIndex === 0;
  const isFirst = currentIndex === filteredChapters.length - 1;

  return (
    <MainLayout readPage={true}>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col min-h-[60px] gap-y-2 justify-center items-center w-full pt-4 pb-7">
          <div className="flex flex-col justify-center items-center">
            <Link href={`/title/${manga.id}`} passHref>
              <p className="text-[16px] text-center font-bold textOren">{manga.attributes.title.en}</p>
            </Link>
            <p className="text-[14px] font-regular opacity-80">
              {currentCh?.chapter ? `Chapter ${currentCh?.chapter}` : "Oneshot"}
            </p>
          </div>
          <div className="w-full px-4 items-center flex flex-row justify-center gap-4">
            <IconButton disabled={isFirst}>
              <ArrowBackRoundedIcon sx={{ color: isFirst ? "#403F3F" : "white" }} />
            </IconButton>
            <Autocomplete
              options={filteredChapters}
              getOptionLabel={(option) => option.attributes?.chapter ? `Chapter ${option.attributes.chapter}` : "Oneshot"}
              value={filteredChapters.find((ch) => ch.id === chapterId) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  router.push(`/title/${manga.id}/chapter/${newValue.id}`);
                }
              }}
              className="min-w-[250px]  px-2 bgAbu rounded-sm text-white"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  padding: "8px", 
                },
                "& .MuiSvgIcon-root": {
                  color: "white", 
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "white",
                },
              }}
              componentsProps={{
                paper: {
                  sx: {
                    bgcolor: "#403F3F", 
                    color: "white",
                  },
                },
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="standard" 
                  placeholder="Select Chapter"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    sx: { color: "white" },
                  }}
                />
              )}
            />
            <IconButton disabled={isLast}>
              <ArrowForwardRoundedIcon sx={{ color: isLast ? "#403F3F" : "white" }} />
            </IconButton>
          </div>
        </div>
        <div className="lg:max-w-[768px] min-h-screen">
        {chapterData.chapter.data.map((fileName, index) => (
          <img
            key={index}
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/chapter/image/${hash}/${fileName}?baseUrl=${encodeURIComponent(chapterData.baseUrl)}`}
            alt={`Page ${index + 1}`}
            loading="lazy"
            style={{ width: "100%", height: "auto" }}
          />
        ))}
        </div>
        <div className="w-full px-4 items-center flex flex-row justify-center gap-4 pt-7">
          <IconButton disabled={isFirst}>
            <ArrowBackRoundedIcon sx={{ color: isFirst ? "#403F3F" : "white" }} />
          </IconButton>
          <Autocomplete
            options={filteredChapters}
            getOptionLabel={(option) => option.attributes?.chapter ? `Chapter ${option.attributes.chapter}` : "Oneshot"}
            value={filteredChapters.find((ch) => ch.id === chapterId) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                router.push(`/title/${manga.id}/chapter/${newValue.id}`);
              }
            }}
            className="min-w-[250px]  px-2 bgAbu rounded-sm text-white"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                padding: "8px", 
              },
              "& .MuiSvgIcon-root": {
                color: "white", 
              },
              "& .MuiAutocomplete-popupIndicator": {
                color: "white",
              },
            }}
            componentsProps={{
              paper: {
                sx: {
                  bgcolor: "#403F3F", 
                  color: "white",
                },
              },
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                variant="standard" 
                placeholder="Select Chapter"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  sx: { color: "white" },
                }}
              />
            )}
          />
          <IconButton disabled={isLast}>
            <ArrowForwardRoundedIcon sx={{ color: isLast ? "#403F3F" : "white" }} />
          </IconButton>
        </div>
      </div>
    </MainLayout>
  );
};

export default MangaDetailPage;