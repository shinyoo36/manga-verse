

import Link from 'next/link';
import { Drawer, IconButton } from "@mui/material";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useEffect, useRef, useState } from 'react';
import Modal from '@mui/material/Modal';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Manga, MangaStat, UserData } from '@/components/types';
import { getMangaCoverImage } from '@/utils/api';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { useRouter } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
  mainPage?: boolean;
  readPage?: boolean;
}

const MainLayout = ({ children, bgImage, mainPage, readPage}: MainLayoutProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchInput(''); 
    setSearchMangaData([]); 
    setMangaStats(null);
  };
  
  const [openProfile, setOpenProfile] = useState(false);
  const handleOpenProfile = () => setOpenProfile(true);
  const handleCloseProfile = () => setOpenProfile(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchMangaData, setSearchMangaData] = useState<Manga[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dots, setDots] = useState(".");

  const [userData, setUserData] = useState<UserData | null>(null);
  
  const handleLogOut = () => {
    localStorage.removeItem("userData"); 
    setUserData(null);
    setTimeout(() => {
      router.push("/")
  }, 500)
  }

  useEffect(() => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
          const parsedData = JSON.parse(storedData);
  
          const now = new Date().getTime();
          if (parsedData.expiry > now) {
              setUserData(parsedData.data);
          } else {
              localStorage.removeItem("userData"); 
          }
      }
  }, []);
  
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
    <div className="w-full min-h-screen flex justify-center pb-5 gap">
      <div className="max-w-[1280px] w-full lg:max-w-none relative">
        <Drawer anchor="top" open={open} onClose={handleClose} onTransitionEnd={() => inputRef.current?.focus()} PaperProps={{sx: { backgroundColor: "#171717" }}}>
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
                            <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                          </div>
                          <div className='flex flex-col justify-between'>
                            <div>
                              <p className="text-[14px] font-semibold line-clamp-2">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                              <div className="flex flex-row gap-2 flex-wrap">
                                <p className="text-[12px] font-medium bgOrenNoHover px-2 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
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
                              <div className='hidden md:flex'>
                                <p className="text-[12px] font-regular text-justify line-clamp-4 break-all break-words opacity-80">
                                  {manga.attributes.description.en}
                                </p>
                              </div>
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
        <Drawer anchor="right" open={openProfile} onClose={handleCloseProfile}  PaperProps={{sx: { backgroundColor: "#171717" }}}>
          <div className="flex flex-col px-4 bgItam h-full w-full min-w-[300px] text-white">
            <div className="bgItam sticky top-0 z-50 min-h-[156px] w-full px-4 py-5 space-y-5">
                <div className='flex items-center justify-center flex-col gap-2'>
                    <p className='text-[24px]  text-white'>{userData?.name || 'Guest'}</p>
                    {userData? (
                      <img src="/img/bruno.jpg" className='w-[200px] aspect-square rounded-full'/>
                      ) : (
                      <AccountCircleRoundedIcon sx={{ fontSize: 100}}/>
                    )}
                </div>
                {!userData && (
                <div className='flex flex-col items-center gap-4 border-t-[2px] border-t-[#FD5F00] pt-4'>
                  <Link href={"/sign-in"} passHref>
                    <p className='w-[160px] bgOren text-center py-2 rounded-sm text-[14px] font-medium'>Sign In</p>
                  </Link>
                  <Link href={"/register"} passHref>
                    <p className='w-[160px] chList text-center py-2 rounded-sm text-[14px] font-medium'>Register</p>
                  </Link>
                </div>
                )}
                {userData && (
                <div>
                  <div className='flex flex-col border-t-[2px] border-t-[#FD5F00] py-4'>
                      <Link href="/profile" passHref className='flex flex-row items-center gap-x-2 cursor-pointer'>
                        <PersonOutlineRoundedIcon sx={{fontSize: 32}}/>
                        <p className='w-[160px] py-2 rounded-sm text-[18px] font-medium opacity-80'>Profile</p>
                      </Link>
                      <Link href="/bookmark" passHref className='flex flex-row items-center gap-x-2 cursor-pointer'>
                        <BookmarkBorderRoundedIcon sx={{fontSize: 30}}/>
                        <p className='w-[160px] py-2 rounded-sm text-[18px] font-medium opacity-80'>Bookmark</p>
                      </Link>
                  </div>
                  <div className='flex flex-col items-center gap-4 border-t-[2px] border-t-[#FD5F00] py-4 cursor-pointer' onClick={handleLogOut}>
                      <p className='w-[160px] bgOren text-center py-2 rounded-sm text-[14px] font-medium'>Log Out</p>
                  </div>
                </div>
                )}
            </div>
          </div>
        </Drawer>
        <div 
          className={`w-full header lg:flex lg:flex-col lg:items-center ${mainPage ? "h-[302.5px] md:h-[372.5px]" : "h-[378.5px] md:h-[338.5px]"} header`}
          style={bgImage ? { "--bg-image": `url(${bgImage})` } as React.CSSProperties : {}}
        >
          <div className="lg:max-w-[1280px] w-full py-1 px-4 flex justify-between items-center">
            <Link href="/" passHref>
              <p className="font-protest text-[32px] tracking-wide">MangaVerse</p>
            </Link>
            <div className="flex gap-x-1 md:gap-x-2">
              <IconButton onClick={handleOpen}>
                <img src="/icons/search.svg" alt="Search" className='width-[30px]'/>
              </IconButton>
              <IconButton onClick={handleOpenProfile}>
                <img src="/icons/profile.svg" alt="Search" className='width-[30px]'/>
              </IconButton>
            </div>
          </div>
          <div className={`min-h-[calc(100vh-56px)] h-full lg:max-w-[1280px] w-full flex-grow flex flex-col ${readPage ? "px-0 pt-0 " : "px-4 pt-2"} *:pb-5 `}>
            {children}
            <Link href="https://mangadex.org/" passHref target="_blank" rel="noopener noreferrer" className='z-100 flex gap-2 justify-center'>
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
