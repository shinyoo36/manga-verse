import Link from 'next/link';
import { Drawer, IconButton } from "@mui/material";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useEffect, useRef, useState } from 'react';
import Modal from '@mui/material/Modal';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Manga, MangaStat } from '@/components/types';
import { getMangaCoverImage } from '@/utils/api';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

interface MainLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
  mainPage?: boolean;
  readPage?: boolean;
}

const MainLayout = ({ children, bgImage, mainPage, readPage}: MainLayoutProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchInput(''); 
    setSearchMangaData([]); 
    setMangaStats(null);
  };
  

  const [searchInput, setSearchInput] = useState("");
  const [searchMangaData, setSearchMangaData] = useState<Manga[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
      }, 100); // Delay ensures the drawer animation completes
    }
  }, [open]); // Run effect when `open` changes

  useEffect(() => {
    if (!searchInput) {
      setSearchMangaData([]); 
      setMangaStats(null);
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500); 
  
    return () => clearTimeout(delayDebounce); 
  }, [searchInput]);


const fetchData = async () => {
  try {
    // Fetch manga search results
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/manga/search/${searchInput}`
    );
    const mangaData = await response.json();
    
    setSearchMangaData(mangaData.data);

    const mangaIds = mangaData.data.map((manga: Manga) => manga.id);

    const statsData = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/manga/stat-ids/${mangaIds}`
    ).then(res => res.json());
    
    setMangaStats(statsData.statistics);

  } catch (error) {
    console.error("Failed to fetch manga data:", error);
  }
};

  return (
    <div className="w-full min-h-screen flex justify-center mb-5 gap">
      <div className="max-w-[1280px] w-full lg:max-w-none relative">
        <Drawer anchor="top" open={open} onClose={handleClose} onTransitionEnd={() => inputRef.current?.focus()}>
          <div className="flex flex-col px-4 bgItam  text-white">
            <div className="bgItam sticky top-0 z-50 h-[56px] w-full flex gap-2 flex-row justify-between items-center px-4">
              <div className="relative w-full">
                <input
                  ref={inputRef} 
                  className="text-white font-poppins w-full bgAbu no-arrows border-none outline-none rounded-sm focus:border-[#FD5F00] focus:ring-2 focus:ring-[#FD5F00] px-2 py-[5px]"
                  value={searchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                    setSearchMangaData([]); 
                    setMangaStats(null);
                  }}
                  placeholder="Type here..."
                />
                <img 
                  src="/icons/search.svg" 
                  alt="Search" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[20px]"
                />
              </div>
              <button className='w-[24px]'
               onClick={handleClose} >
                <CloseRoundedIcon sx={{ fontSize: "28px", color: "white" }} />
              </button>
            </div>
            {searchInput && (
              searchMangaData.length === 0 && !mangaStats ? (
              <div className="min-h-[calc(100vh-56px)] justify-center items-center h-full border-t-[2px] border-t-[#FD5F00] flex flex-col  gap-3 py-4">
                <div className="w-12 h-12 border-4 bgborder-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold">Loading{dots}</p>
              </div>    
              ) : (
              <div className="min-h-[calc(100vh-56px)] border-t-[2px] border-t-[#FD5F00] flex flex-col  gap-3 py-4">
                  {searchMangaData.map((manga, index) => {
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
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-md" 
                            alt={manga.attributes.title.en || "Manga Cover"} 
                          />
                            <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOren"} bgOren rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                          </div>
                          <div className='flex flex-col justify-between'>
                            <div>
                              <p className="text-[14px] font-semibold line-clamp-2">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                              <div className="flex flex-row gap-2 flex-wrap">
                                <p className="text-[12px] font-medium bgOren px-2 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
                                {manga.attributes.tags
                                  .filter((genre) => genre.attributes.group === 'genre')
                                  .slice(0, 6)
                                  .map((genre, i) => (
                                    <p
                                    className="text-[12px] font-regular bgAbu px-1 rounded-[3.5px]"
                                  >
                                    {genre.attributes.name.en.toUpperCase()}
                                  </p>
                                ))}
                              </div>
                              <p className="invisible md:visible text-[12px] font-regular text-justify line-clamp-4 break-all break-words opacity-80">
                                {manga.attributes.description.en}
                              </p>
                            </div>
                            <div className="flex flex-row gap-x-2 py-1 items-center">
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
                        </div>
                      </Link>
                    
                      );
                  })}
              </div>
              )
            )}
          </div>
        </Drawer>
        <div 
          className={`w-full header lg:flex lg:flex-col lg:items-center ${mainPage ? "h-[302.5px] md:h-[372.5px]" : "h-[337.5px]"} header`}
          style={bgImage ? { "--bg-image": `url(${bgImage})` } as React.CSSProperties : {}}
        >
          <div className="lg:max-w-[1280px] w-full py-1 px-4 flex justify-between items-center">
            <Link href="/" passHref>
              <p className="font-protest text-[32px] tracking-wide">MangaVerse</p>
            </Link>
            <div className="flex gap-4">
              <IconButton onClick={handleOpen}>
                <img src="/icons/search.svg" alt="Search" />
              </IconButton>
              {/* <img src="/icons/profile.svg" alt="Profile" /> */}
            </div>
          </div>
          <div className={`lg:max-w-[1280px] flex-grow flex flex-col ${readPage ? "px-0 pt-0 " : "px-4 pt-2"} *:pb-5 min-h-screen`}>
            {children}
            <Link href="https://mangadex.org/" passHref target="_blank" rel="noopener noreferrer" className='flex gap-2 justify-center'>
                <p>© </p>
                <p className='textOren'>MangaDex</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
