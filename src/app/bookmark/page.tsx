"use client"

import { useEffect, useRef, useState } from 'react';
import { Bookmark, Manga, MangaApiResponse, MangaStat, UserBookmark, UserData } from '@/components/types';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import MainLayout from "@/app/layout/index";
import { format } from "date-fns";
import { getMangaCoverImage } from '@/utils/api';
import Link from 'next/link';

const bookmark = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [bookmarkMangas, setBookmarkMangas] = useState<Manga[]>([]);
    const mangaIds = userData?.bookmarkList.map(manga => manga.bookmark.mangaId) || [];
    const userBookmark = userData?.bookmarkList.map(manga => manga) || [];
    const [status, setStatus] = useState('reading');

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
        if(mangaIds.length === 0){
            return;
        }
        const fetchMangaData = async () => {
        const queryParams = mangaIds.map(id => `ids=${id}`).join("&");
          try {
            await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga/latest/data?${queryParams}`)
                .then(response => response.json())
                .then((data: MangaApiResponse) => setBookmarkMangas(data.data))
                .catch(error => console.error("Failed to fetch latest manga data:", error))
            ]);
          } catch (error) {
            console.error("Failed to fetch manga data:", error);
          }
        };
    
        fetchMangaData();
      }, [mangaIds]);

      const filteredBookmarks = bookmarkMangas 
      ? userBookmark
          .filter(bookmark => bookmark.status === status)
          .map(bookmark => {
            const manga = bookmarkMangas.find(manga => manga.id === bookmark.bookmark.mangaId);
            return manga ? { bookmark, manga } : null;
          })
          .filter((item): item is { bookmark: UserBookmark; manga: Manga } => item !== null) 
      : [];

    return(
        <MainLayout>
            <div className=' flex justify-center'>
                <div className='flex w-full h-full min-h-[calc(100vh-136px)] max-w-[900px] items-center flex-col gap-2 pt-12'>
                    {userData? (
                      <img src="/img/bruno.jpg" className='w-[200px] aspect-square rounded-full'/>
                      ) : (
                      <AccountCircleRoundedIcon sx={{ fontSize: 100}}/>
                    )}
                    <div className='w-full  flex flex-col gap-y-2'>
                        <p className='text-[24px] text-center font-semibold'>{userData?.name || 'Guest'}</p>
                        <div>
                            <p className='text-[24px] font-semibold'>Bookmark List</p>
                        </div>
                        <div className='flex flex-row gap-2 bgAbu px-[5px] py-1 w-fit rounded-sm mb-2'>
                            <p 
                                className={`${status === 'reading' ? "bgOrenNoHover cursor-default" : "bgAbu hover:border-[#FD5F00] cursor-pointer"} border-2 border-transparent text-[14px]  px-2 py-1 rounded-sm`} 
                                onClick={() => setStatus('reading')}>Reading</p>
                            <p 
                                className={`${status === 'completed' ? "bgOrenNoHover cursor-default" : "bgAbu hover:border-[#FD5F00] cursor-pointer"} border-2 border-transparent text-[14px]  px-2 py-1 rounded-sm`} 
                                onClick={() => setStatus('completed')}>Completed</p>
                            <p
                                className={`${status === 'dropped' ? "bgOrenNoHover cursor-default" : "bgAbu hover:border-[#FD5F00] cursor-pointer"} border-2 border-transparent text-[14px]  px-2 py-1 rounded-sm`} 
                                onClick={() => setStatus('dropped')}>Dropped</p>
                        </div>
                        <div>
                        <div className='grid grid-cols-1 w-full gap-[8px] min-h-[380px] overflow-y-auto'>
                        {filteredBookmarks.length === 0 ? (
                        <p className="text-center text-[18px] font-semibold textOren">No Entry</p>
                        ) : (
                        filteredBookmarks.map(({ bookmark, manga }, index) => {
                            const image = getMangaCoverImage(manga.id, manga.relationships, "256");
                            return (
                            <Link href={`/title/${manga.id}`} passHref key={index} className="flex flex-row gap-x-2 h-full">
                                <div className="relative w-auto h-[120px] sm:h-[200px] aspect-[3/4]">
                                <img 
                                    src={image} 
                                    className="absolute h-full w-full rounded-md object-cover"
                                    alt={manga.attributes.title.en || "Manga Cover"} 
                                />
                                <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>
                                    {manga.attributes.status}
                                </p>
                                </div> 
                                <div className="flex flex-col">
                                <p className="text-[14px] sm:text-[18px] font-semibold line-clamp-1">
                                    {manga.attributes.title.en || Object.values(manga.attributes.title)[0]}
                                </p>
                                <p className="text-[12px] sm:text-[14px] font-regular text-justify line-clamp-4 break-all break-words opacity-80">
                                    {manga.attributes.description.en}
                                </p>
                                </div>
                            </Link>
                            );
                        })
                        )}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
       
        </MainLayout>
           
    );
}

export default bookmark;