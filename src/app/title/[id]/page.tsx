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
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import { Modal } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { NotFound } from "@/components/notfound";

const MangaDetailPage = () => {
  const { id } = useParams(); 
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [notFound, setNotFound] = useState(false);

  const [manga, setManga] = useState<Manga | null>(null);
  const [mangaStat, setMangaStat] = useState<MangaStat | null>(null);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [scanlationGroup, setScanlationGroup] = useState('');
  const [status, setStatus] = useState<string>("reading");
  const [message, setMessage] = useState<string|null>(null);
  const [userData, setUserData] = useState(() => {
    return JSON.parse(localStorage.getItem("userData") || "{}");
  });

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
        if (mangaData.status === 404) {
          setNotFound(true);
        } else {
          const chapterData1 = Array.isArray(chapterList.data) ? chapterList.data : [];
          const chapterData2 = Array.isArray(chapterList2.data) ? chapterList2.data : [];
          const mergedChapters = [...chapterData1, ...chapterData2];
          setManga(mangaData.data);
          filterTopScanlationGroup(mergedChapters);
          setMangaStat(mangaStat.statistics);
        }
      } catch (error) {
        console.error("Failed to fetch manga data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (userData?.data?.bookmarkList) {
      const foundBookmark = userData.data.bookmarkList.find(
        (bookmark: { bookmark: { mangaId: string }; status: string }) =>
          bookmark.bookmark.mangaId === manga?.id
      );

      if (foundBookmark) {
        setStatus(foundBookmark.status);
      }
    }
  }, [userData, manga?.id]); 
  
  if (notFound) {
    return <NotFound />;
  }

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
  const coverArt = manga.relationships.find(rel => rel.type === "cover_art");

  const bookmarkManga = async (id: string, mangaId: string, coverId: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/bookmark`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id,
            mangaId, 
            coverId,
            status,
          }) 
      });

      if (response.status === 200) {
        const updatedUserData = await response.json();
        const newUserData = {
          data: updatedUserData,
          expiry: userData.expiry
        };
        localStorage.setItem("userData", JSON.stringify(newUserData));
        setUserData(newUserData);
        setMessage("Bookmark added");
        setTimeout(() => {
          setMessage(null);
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to update bookmarks:", error);
    }
  }

  const removeBookmark = async (id: string, mangaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/bookmark`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id,
            mangaId, 
          }) 
      });

      if (response.status === 200) {
        const updatedUserData = await response.json();
        const newUserData = {
          data: updatedUserData,
          expiry: userData.expiry
        };
        localStorage.setItem("userData", JSON.stringify(newUserData));
        setUserData(newUserData);
        setMessage("Bookmark removed")
        setTimeout(() => {
          setMessage(null);
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to remove bookmarks:", error);
    }
  }

  const handleUpdate = (id: string, mangaId: string, coverId: string, status: string) => {
      if(status === 'remove') {
        removeBookmark(id, mangaId);
      } else{
        bookmarkManga(id, mangaId, coverId, status);
      }
      setOpen(false);
  }

  return (
    <MainLayout bgImage={image}>
      {message && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 flex justify-center items-center min-w-[120px]">
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
            {message}
          </Alert>
        </div>
      )}
      <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="modal px-4 py-4 bgItam w-full max-w-[300px] lg:max-w-[800px]">
            <div className="flex w-full h-full lg:flex-row flex-col gap-x-4">
              <div className="relative min-h-[160px] lg:h-[265px] aspect-[3/4]">
                <img 
                  src={image} 
                  className="absolute h-full w-full rounded-md object-cover"
                  alt={manga.attributes.title.en || "Manga Cover"} 
                />
                <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
              </div> 
              <div className="flex flex-col gap-y-4 justify-between w-full">
                <p className="pt-1 text-justify text-[16px] font-regular md:text-[20px] md:opacity-80">{manga.attributes.title.en}</p>
                <div className="flex gap-y-4 flex-col lg:flex-row justify-between items-center rounded-sm">
                  <div className="w-[200px] bg-red-200 relative chList rounded-md">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-1 bgAbu rounded-sm appearance-none"
                    >
                      <option value="reading" >Reading</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                      <option value="remove">Remove</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <KeyboardArrowDownRoundedIcon/>
                    </span>
                  </div>
                  <div className="flex flex-row gap-x-2">
                    <p className='w-[120px] chList text-center py-2 rounded-sm text-[14px] font-medium cursor-pointer' onClick={handleClose}>Cancel</p>
                    <p className='w-[120px] bgOren text-center py-2 rounded-sm text-[14px] font-medium cursor-pointer' onClick={() => handleUpdate(userData.data.id, manga.id, coverArt?.attributes?.fileName || '', status)}>OK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </Modal>
      <div className="md:hidden flex flex-col items-center justify-center ">
        <div className="relative min-h-[200px] aspect-[3/4]">
          <img 
            src={image} 
            className="absolute h-full w-full rounded-md object-cover"
            alt={manga.attributes.title.en || "Manga Cover"} 
          />
          <p className={`cursor-not-allowed absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
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
     
        {!userData?.data?.bookmarkList?.some(
            (bookmark: { bookmark: {mangaId: string; coverId: string} }) => bookmark.bookmark?.mangaId === manga.id
          ) ? (
            <div onClick={handleOpen} className="flex flex-row gap-2 items-center justify-center bgOren mt-2 px-2 py-1 rounded-sm cursor-pointer">
              <BookmarkAddRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
              <p className="text-[14px] font-regular">Bookmark</p>
            </div>
          ) : (
            <div onClick={handleOpen} className="flex flex-row gap-2 items-center justify-center bgOren mt-2 px-2 py-1 rounded-sm cursor-pointer">
              <BookmarkAddedRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
              <p className="text-[14px] font-regular">Update</p>
            </div>
        )}
      </div>
      <div className="hidden md:flex flex-row gap-x-4 px-3">
        <div className="relative min-h-[265px] aspect-[3/4]">
          <img 
            src={image} 
            className="absolute h-full w-full rounded-md object-cover"
            alt={manga.attributes.title.en || "Manga Cover"} 
          />
          <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
        </div> 
        <div className="flex flex-col justify-between w-full">
          <p className="text-[32px] font-bold text-left">{manga.attributes.title.en}</p>
          <div className="flex flex-row gap-x-2 py-1 justify-between items-center w-full">
            <div className="flex flex-row gap-x-2">
              <div className="flex flex-row gap-1 justify-center items-center">
                <BookmarkBorderRoundedIcon sx={{color:'#FD5F00', fontSize:'30px'}} />
                <p className="text-[24px] font-regular ">{formattedFollows}</p>
              </div>
              <div className="flex flex-row gap-1 justify-center items-center">
                <StarBorderRoundedIcon sx={{color:'#FD5F00', fontSize:'30px'}} />
                <p className="text-[24px] font-regular">{formattedRating}</p>
              </div>
            </div>
            {!userData?.data?.bookmarkList?.some(
                (bookmark: { bookmark: {mangaId: string; coverId: string} }) => bookmark.bookmark?.mangaId === manga.id
              ) ? (
                <div onClick={handleOpen} className="flex flex-row gap-2 items-center justify-center bgOren mt-2 px-2 py-1 rounded-sm cursor-pointer">
                  <BookmarkAddRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
                  <p className="text-[14px] font-regular">Bookmark</p>
                </div>
              ) : (
                <div onClick={handleOpen} className="flex flex-row gap-2 items-center justify-center bgOren mt-2 px-2 py-1 rounded-sm cursor-pointer">
                  <BookmarkAddedRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
                  <p className="text-[14px] font-regular">Update</p>
                </div>
            )}
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
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] md:max-h-[360px]">
            {filteredChapters.map((chapter) => (
            <Link key={chapter.id} href={`/title/${manga.id}/chapter/${chapter.id}`} passHref>
              <div className="chList rounded-sm flex flex-row gap-2">
                <div className="bgOren w-[4px] min-h-fit rounded-r-lg"/>
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

