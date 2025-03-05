"use client"

import { useEffect, useRef, useState } from 'react';
import { Manga, MangaStat, UserData } from '@/components/types';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import MainLayout from "@/app/layout/index";
import { format } from "date-fns";

const profile = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
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

    return(
        <MainLayout>
            <div className='h-full flex justify-center'>
                <div className='flex w-full max-w-[600px] items-center flex-col gap-2 pt-12'>
                    {userData? (
                      <img src="/img/bruno.jpg" className='w-[200px] aspect-square rounded-full'/>
                      ) : (
                      <AccountCircleRoundedIcon sx={{ fontSize: 100}}/>
                    )}
                    <div className='w-full  flex flex-col gap-y-2'>
                        <p className='text-[24px] text-center font-semibold'>{userData?.name || 'Guest'}</p>
                         <div className="flex flex-col gap-1">
                            <p className="font-semibol dtext-[24px]">User Id</p>
                            <div className="flex flex-row gap-2 flex-wrap">
                                <p className=" font-regular text-[18px] bgAbu px-2 py-1 rounded-[3.5px]">
                                    {userData?.id || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="font-semibol dtext-[24px]">Date Joined</p>
                            <div className="flex flex-row gap-2 flex-wrap">
                                <p className=" font-regular text-[18px] bgAbu px-2 py-1 rounded-[3.5px]">
                                    {userData?.createdAt ? format(new Date(userData.createdAt), "MMMM dd, yyyy") : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
       
        </MainLayout>
           
    );
}

export default profile;