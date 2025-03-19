"use client"

import Link from 'next/link';
import { Drawer, IconButton } from "@mui/material";
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Manga, MangaStat, UserData } from '@/components/types';
import { getMangaCoverImage } from '@/utils/api';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/app/layout/index";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import { Loading } from '@/components/loading';

export default function SearchPage() {
    return (
      <Suspense fallback={<Loading />}>
        <SearchContent />
      </Suspense>
    );
}

function SearchContent () {
    const router = useRouter();
    const [dots, setDots] = useState(".");
    useEffect(() => {
        const interval = setInterval(() => {
          setDots((prev) => (prev.length === 3 ? "." : prev + "."));
        }, 500);
    
        return () => clearInterval(interval);
    }, []);
    const [total, setTotal] = useState(1);
    const [firstLoad, setFirstLoad] = useState(true);
    const [noData, setNoData] = useState(false);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const [offset, setOffset] = useState(0);
 
    useEffect(() => {
        if(currentPage != 1){
            let offset = currentPage * 20
            setOffset(offset)
        }
        fetchData();
        console.log("offset", offset);
    }, [currentPage]);

    const [openFilter, setOpenFilter] = useState(false);
    const [openGenre, setOpenGenre] = useState(false);
    const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const genreRefs = useRef<HTMLDivElement | null>(null);
    
    const handleToggle = (modalName: string) => {
        setOpenModals((prev) => ({
            [modalName]: !prev[modalName], 
        }));
    };

    const handleClose = (modalName: string) => {
        setOpenModals((prev) => ({
            ...prev,
            [modalName]: false,
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            let clickedOutside = true;

            Object.keys(dropdownRefs.current).forEach((modalName) => {
                if (dropdownRefs.current[modalName]?.contains(event.target as Node)) {
                    clickedOutside = false;
                }
            });

            if (genreRefs.current?.contains(event.target as Node)) {
                clickedOutside = false;
            }

            if (clickedOutside) {
                setOpenModals({});
                setOpenGenre(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(total == 0){
            setNoData(true)
        } else {
            setNoData(false)
        }
    }, [total]);

    const [searchInput, setSearchInput] = useState<string|null>(null);
    const [searchMangaData, setSearchMangaData] = useState<Manga[]>([]);
    const [mangaStats, setMangaStats] = useState<MangaStat | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [viewOptions, setViewOptions] = useState("grid");

    const sortOptions = [
        { label: "Most Follow", value: 'order[followedCount]=desc' },
        { label: "Least Follow", value: 'order[followedCount]=asc' },
        { label: "Highest Rating", value: 'order[rating]=desc' },
        { label: "Lowest Rating", value: 'order[rating]=asc' },
        { label: "Latest Upload", value: 'order[latestUploadedChapter]=desc' },
        { label: "Oldest Upload", value: 'order[latestUploadedChapter]=asc' },
        { label: "Recently Added", value: 'order[createdAt]=desc' },
        { label: "Oldest Added", value: 'order[createdAt]=asc' },
    ];
    const [selectedSort, setSelectedSort] = useState<string | null>('order[followedCount]=desc');
    const selectedSortLabel = sortOptions.find(option => option.value === selectedSort)?.label || "Select Sort";

    const modeOptions = [
        { label: "And", value: 'AND' },
        { label: "Or", value: 'OR' },
    ];
    const [selectedInclusionMode, setSelectedInclusionMode] = useState<string | null>('AND');
    const selectedInclusionModeLabel = modeOptions.find(option => option.value === selectedInclusionMode)?.label || "And";
    const [selectedExclusionMode, setSelectedExclusionMode] = useState<string | null>('OR');
    const selectedExclusionModeLabel = modeOptions.find(option => option.value === selectedExclusionMode)?.label || "Or";

    const genreOptions = [
        { label: "Action", value: '391b0423-d847-456f-aff0-8b0cfc03066b' },
        { label: "Adventure", value: '87cc87cd-a395-47af-b27a-93258283bbc6' },
        { label: "Boys' Love", value: '5920b825-4181-4a17-beeb-9918b0ff7a30' },
        { label: "Comedy", value: '4d32cc48-9f00-4cca-9b5a-a839f0764984' },
        { label: "Crime", value: '5ca48985-9a9d-4bd8-be29-80dc0303db72' },
        { label: "Drama", value: 'b9af3a63-f058-46de-a9a0-e0c13906197a' },
        { label: "Fantasy", value: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc' },
        { label: "Girls' Love", value: 'a3c67850-4684-404e-9b7f-c69850ee5da6' },
        { label: "Historical", value: '33771934-028e-4cb3-8744-691e866a923e' },
        { label: "Horror", value: 'cdad7e68-1419-41dd-bdce-27753074a640' },
        { label: "Isekai", value: 'ace04997-f6bd-436e-b261-779182193d3d' },
        { label: "Magical Girls", value: '81c836c9-914a-4eca-981a-560dad663e73' },
        { label: "Mecha", value: '50880a9d-5440-4732-9afb-8f457127e836' },
        { label: "Medical", value: 'c8cbe35b-1b2b-4a3f-9c37-db84c4514856' },
        { label: "Mystery", value: 'ee968100-4191-4968-93d3-f82d72be7e46' },
        { label: "Philosophical", value: 'b1e97889-25b4-4258-b28b-cd7f4d28ea9b' },
        { label: "Psychological", value: '3b60b75c-a2d7-4860-ab56-05f391bb889c' },
        { label: "Romance", value: '423e2eae-a7a2-4a8b-ac03-a8351462d71d' },
        { label: "Sci-Fi", value: '256c8bd9-4904-4360-bf4f-508a76d67183' },
        { label: "Slice of Life", value: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9' },
        { label: "Sports", value: '69964a64-2f90-4d33-beeb-f3ed2875eb4c' },
        { label: "Superhero", value: '7064a261-a137-4d3a-8848-2d385de3a99c' },
        { label: "Thriller", value: '07251805-a27e-4d59-b488-f0bfbec15168' },
        { label: "Tragedy", value: 'f8f62932-27da-4fe4-8ee1-6779a8c5edba' },
        { label: "Wuxia", value: 'acc803a4-c95a-4c22-86fc-eb6b582d82a2' },
    ];
    const [selectedGenres, setSelectedGenres] = useState<Record<string, "include" | "exclude" | null>>({});
    const [selectedGenresLabel, setSelectedGenresLabel] = useState<Record<string, "include" | "exclude" | null>>({});
    const selectedGenreLabel = (() => { 
        const delimiterInclusion = selectedInclusionMode === "and" ? " & " : " or ";
        const delimiterExclusion = selectedExclusionMode === "and" ? " & " : " or ";

        const included = Object.keys(selectedGenresLabel)
            .filter((genre) => selectedGenresLabel[genre] === "include")
            .join(delimiterInclusion);
    
        const excluded = Object.keys(selectedGenresLabel)
            .filter((genre) => selectedGenresLabel[genre] === "exclude")
            .join(delimiterExclusion);
    
        if (!included && !excluded) return "Select Genre"; 
    
        let label = "";
        if (included) label += `Include ${included}`;
        if (excluded) label += (included ? " & " : "") + `Exclude ${excluded}`;
    
        return label;
    })();
    const toggleGenre = (label: string, value: string) => {
        setSelectedGenres((prev) => {
            const currentStatus = prev[value] || null;
            const newStatus =
                currentStatus === null ? "include" :
                currentStatus === "include" ? "exclude" :
                null;
    
            return {
                ...prev,
                [value]: newStatus,
            };
        });
    
        setSelectedGenresLabel((prev) => {
            const currentStatus = prev[label] || null;
            const newStatus =
                currentStatus === null ? "include" :
                currentStatus === "include" ? "exclude" :
                null;
    
            return {
                ...prev,
                [label]: newStatus,
            };
        });
    };
    
    const publicationOptions = [
        { label: "Any", value: null },
        { label: "Ongoing", value: 'status[]=ongoing' },
        { label: "Completed", value: 'status[]=completed' },
        { label: "Hiatus", value: 'status[]=hiatus' },
        { label: "Cancelled", value: 'status[]=cancelled' },
    ];
    const [selectedPublication, setSelectedPublication] = useState<string | null>(null);
    const selectedPublicationlabel = publicationOptions.find(option => option.value === selectedPublication)?.label || "Any";

    const languageOptions = [
        { label: "All", value: null },
        { label: "Japanese", value: 'originalLanguage[]=ja' },
        { label: "Korean", value: 'originalLanguage[]=ko' },
        { label: "Chinese", value: 'originalLanguage[]=zh&originalLanguage[]=zh-hk' },
    ];
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const selectedLanguagelabel = languageOptions.find(option => option.value === selectedLanguage)?.label || "All  ";

    
    const [filterCount, setFilterCount] = useState(0);

    const buildQueryString = () => {
        const queryParts: string[] = [];
    
        queryParts.push(`limit=20`);
        if(currentPage == 1){
            queryParts.push(`offset=0`);
        } else {
            queryParts.push(`offset=${offset}`);
        }

        if (searchInput) {
            queryParts.push(`title=${searchInput}`);
        }

        Object.entries(selectedGenres).forEach(([genreId, status]) => {
            if (status === "include") {
                queryParts.push(`includedTags[]=${genreId}`);
            } else if (status === "exclude") {
                queryParts.push(`excludedTags[]=${genreId}`);
            }
        });

        
        if (selectedPublication) {
            queryParts.push(selectedPublication);
        }
    
        if (selectedSort) {
            queryParts.push(selectedSort);
        }
    
        if (selectedLanguage) {
            queryParts.push(selectedLanguage);
        }
    
        if (selectedInclusionMode) {
            queryParts.push(`includedTagsMode=${selectedInclusionMode}`);
        }

        if (selectedExclusionMode) {
            queryParts.push(`excludedTagsMode=${selectedExclusionMode}`);
        }

        return queryParts.join("&");
    };

    const reqParams = useMemo(() => buildQueryString(), [currentPage, searchInput, selectedGenres, selectedPublication, selectedSort, selectedLanguage, selectedInclusionMode, selectedExclusionMode]);

    useEffect(() => {
        const genreCount = Object.values(selectedGenres).filter(status => status !== null).length;
        let count = 0;
        count += genreCount;
        // count += selectedPublication ? 1 : 0;
        // count += selectedLanguage ? 1 : 0;

        setFilterCount(count);

    }, [selectedGenres]);
    

    useEffect(() => {
        fetchData();
    
        const delayDebounce = setTimeout(() => {
            setFirstLoad(false);
        }, 5000); 
        return () => clearTimeout(delayDebounce); 

    }, [firstLoad]);

    // useEffect(() => {
    //          const delayDebounce = setTimeout(() => {
    //       fetchData();
    //       router.push(`/search?page=${1}`);
    //     }, 1000); 
    
    //     return () => clearTimeout(delayDebounce); 
    // }, [reqParams]);

    const handleSearch = () => {
        setOffset(0);
        setTimeout(() => {
            fetchData(); 
        }, 0);
        router.push(`/search?page=${1}`);
    }

    useEffect(() => {
        if(searchMangaData.length === 0 && !noData){
            fetchData();
        }
    }, [noData, searchMangaData]);
    
    const handleClear = () => {
        setSearchInput(null); 
        setOffset(0);
        setSearchMangaData([])
    }

    const fetchData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manga-search/search?${reqParams}`);
            
            const mangaData = await response.json();
            setTotal(Math.min(500, Math.ceil((mangaData.total || 0) / 20)));
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

    const generatePagination = (currentPage: number, total: number) => {
        const pages: (number | "...")[] = [];
        const showDots = total > 4;
        
        if(total === 1){
            pages.push(1)
            return pages;
        }

        if (currentPage <= 2) {
          pages.push(1, 2, 3);
          if (showDots) pages.push("...");
          pages.push(total);
        } else if (currentPage >= total - 1) {
          if (showDots) pages.push(1, "...");
          pages.push(total - 2, total - 1, total);
        } else {
          pages.push(1, "...");
          pages.push(currentPage - 1, currentPage, currentPage + 1);
          pages.push("...", total);
        }
      
        return pages;
      };
      
    const pagination = generatePagination(currentPage, total);

    const [inputStates, setInputStates] = useState<Record<number, boolean>>({});
    const [pageInput, setPageInput] = useState("");

    const handlePageSubmit = (index: number) => {
        let pageNumber = parseInt(pageInput, 10);

        if (!isNaN(pageNumber)) {
            pageNumber = Math.max(1, Math.min(pageNumber, total));
            router.push(`/search?page=${pageNumber}`);
        }
        
        setInputStates((prev) => ({ ...prev, [index]: false }));
        setPageInput("");
    };
    
    return(
        <MainLayout>
            <div className='w-full'>
                <div className='min-h-[calc(100vh-136px)] flex w-full h-full flex-col gap-x-2'>
                    <div className='bgItam sticky top-0 z-50  flex flex-col gap-y-3 pb-3'>
                        <div className='flex items-center gap-x-2'>
                            <Link href={"/"} passHref>
                                <ArrowBackRoundedIcon/>
                            </Link>
                            <p className='text-[24px]'>Advanced Search</p>
                        </div>

                        <div className="w-full flex gap-x-2 flex-row justify-between items-center">
                            <div className="relative w-full">
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-[20px]">
                                    <SearchRoundedIcon sx={{fontSize: "28px"}}/>
                                </div> 
                                <input
                                    ref={inputRef} 
                                    className="pl-[44px] text-white font-poppins w-full bgAbuHover no-arrows border-none outline-none rounded-sm focus:border-[#FD5F00] focus:ring-[#FD5F00] px-2 py-[5px]"
                                    value={searchInput || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchInput(value);
                                    }}
                                    placeholder="Type here..."
                                />
                                {searchInput && (
                                    <button className='absolute right-3 top-1/2 transform -translate-y-1/2 w-[20px]' onClick={handleClear} >
                                        <CloseRoundedIcon
                                            sx={{
                                                fontSize: "28px",
                                                color: "white",
                                                "&:hover": {
                                                color: "#FD5F00",
                                                },
                                            }}
                                        />
                                    </button>
                                )}
                            </div>
                            <div className='hidden sm:flex max-w-[150px] w-full relative bgAbu select-none flex-row gap-x-2 rounded-sm'>
                                <div 
                                    className={`${openFilter ? 'bgAbuHoverActive' : 'bgAbuHover'} rounded-sm cursor-pointer w-full flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2`}
                                    onClick={() => setOpenFilter((prev) => !prev)}
                                >
                                    <p className='text-[12px] sm:text-[14px] text-center font-medium '>{openFilter ? 'Hide Filters' : 'Open Filters'}</p>
                                    {openFilter ? (
                                        <KeyboardArrowUpRoundedIcon/>
                                    ): (
                                        <KeyboardArrowDownRoundedIcon/>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex sm:hidden w-full relative bgAbu select-none flex-row gap-x-2 rounded-sm'>
                            <div 
                                className={`${openFilter ? 'bgAbuHoverActive' : 'bgAbuHover'} rounded-sm cursor-pointer w-full flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2`}
                                onClick={() => setOpenFilter((prev) => !prev)}
                            >
                                <p className='text-[12px] sm:text-[14px] text-center font-medium '>{openFilter ? 'Hide Filters' : 'Open Filters'}</p>
                                {openFilter ? (
                                    <KeyboardArrowUpRoundedIcon/>
                                ): (
                                    <KeyboardArrowDownRoundedIcon/>
                                )}
                            </div>
                        </div>
                        {openFilter && (
                        <div className='flex flex-col gap-y-3'>
                            <div className='flex flex-col sm:flex-row justify-between gap-x-2 gap-y-3'>
                                <div className='flex flex-col gap-y-2 w-full'>
                                    <div className='flex flex-row gap-x-1'>
                                        <p className='text-[12px] sm:text-[14px] *:font-semibold'>Genre</p>
                                        <p className='text-[12px] sm:text-[14px] font-semibold textOren'>({filterCount} genre selected)</p>
                                    </div>
                                    <div className='flex flex-row flex-wrap gap-x-2 gap-y-2'>
                                        <div className={`${openGenre ? 'bgAbuHoverActive' : 'bgAbuHover'} w-full relative bgAbuHover select-none flex flex-row gap-x-2 rounded-sm`} ref={genreRefs} >
                                            <div 
                                                className={`${openGenre ? 'bgAbu' : ''} rounded-sm cursor-pointer w-full flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2`}
                                                onClick={() => setOpenGenre((prev) => !prev)}
                                            >
                                                <p className="text-[12px] sm:text-[14px] *:font-semibold text-ellipsis line-clamp-1">{selectedGenreLabel}</p>
                                                {openGenre ? (
                                                    <KeyboardArrowUpRoundedIcon/>
                                                ): (
                                                    <KeyboardArrowDownRoundedIcon/>
                                                )}
                                            </div>
                                            {openGenre && (
                                            <div className='w-full absolute bgAbu z-40 top-10 flex flex-col py-2 px-2 gap-y-2'>
                                                <div className='select-none flex flex-wrap flex-row gap-2 rounded-sm'>
                                                {genreOptions.map((genre, index) => {
                                                    const status = selectedGenres[genre.value] || null;
                                                    return (
                                                    <div 
                                                        key={index} 
                                                        className={`min-w-fit text-[14px] select-none cursor-pointer bgAbu2 px-2 py-1 rounded-md border-2  
                                                        ${(status !== "include" && status !== "exclude") ? "border-transparent" : ""} 
                                                        ${status === "include" ? "border-green-500 " : ""} 
                                                        ${status === "exclude" ? "border-red-600 border-dashed bg-red-500 bg-opacity-20" : ""}`}
                                                        onClick={() => toggleGenre(genre.label, genre.value)}
                                                    >
                                                        <p className='text-[12px] font-medium'>{genre.label}</p>
                                                    </div>
                                                )})}
                                                </div>
                                                <div className='gap-x-2 flex flex-row justify-between'>
                                                    <CustomModal
                                                        title='Inclusion Mode'
                                                        modalKey="inclusion"
                                                        openModals={openModals}
                                                        handleToggle={handleToggle}
                                                        handleClose={handleClose}
                                                        label={selectedInclusionModeLabel}
                                                        setValue={setSelectedInclusionMode}
                                                        options={modeOptions}
                                                        dropdownRefs={dropdownRefs}
                                                        bgAbu={true}
                                                    />
                                                    <CustomModal
                                                        title='Exclusion Mode'
                                                        modalKey="exclusion"
                                                        openModals={openModals}
                                                        handleToggle={handleToggle}
                                                        handleClose={handleClose}
                                                        label={selectedExclusionModeLabel}
                                                        setValue={setSelectedExclusionMode}
                                                        options={modeOptions}
                                                        dropdownRefs={dropdownRefs}
                                                        bgAbu={true}
                                                    />
                                                </div>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CustomModal
                                    title='Sort By'
                                    modalKey="sort"
                                    openModals={openModals}
                                    handleToggle={handleToggle}
                                    handleClose={handleClose}
                                    label={selectedSortLabel}
                                    setValue={setSelectedSort}
                                    options={sortOptions}
                                    dropdownRefs={dropdownRefs}
                                />
                            </div>
                            <div className='flex flex-col sm:flex-row justify-between gap-x-2 gap-y-3'>
                                <CustomModal
                                    title='Publication Status'
                                    modalKey="publication"
                                    openModals={openModals}
                                    handleToggle={handleToggle}
                                    handleClose={handleClose}
                                    label={selectedPublicationlabel}
                                    setValue={setSelectedPublication}
                                    options={publicationOptions}
                                    dropdownRefs={dropdownRefs}
                                />
                                <CustomModal
                                    title='Original Language'
                                    modalKey="language"
                                    openModals={openModals}
                                    handleToggle={handleToggle}
                                    handleClose={handleClose}
                                    label={selectedLanguagelabel}
                                    setValue={setSelectedLanguage}
                                    options={languageOptions}
                                    dropdownRefs={dropdownRefs}
                                />
                            </div>
                        </div>
                        )}
                        <div className='flex flex-row justify-between'>
                            <div className='flex flex-row gap-x-2'>
                                <button 
                                    className='max-w-[130px] sm:max-w-[150px] w-full bgAbuHover select-none rounded-sm cursor-pointer flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2'
                                    onClick={() => {
                                        setSelectedGenres({});
                                        setSelectedGenresLabel({});
                                        setSelectedPublication(null);
                                        setSelectedLanguage(null);
                                        setSelectedSort('order[followedCount]=desc');
                                        setSelectedInclusionMode('AND');
                                        setSelectedExclusionMode('OR');
                                        setOffset(0);
                                    }}
                                    disabled={!(selectedInclusionMode != 'AND' || selectedExclusionMode != 'OR' || selectedLanguage || selectedPublication || Object.values(selectedGenres).some(value => value !== null) || selectedSort != 'order[followedCount]=desc')}
                                >
                                    <p className='text-[12px] sm:text-[14px] text-center font-medium '>Clear Filters</p>
                                    <FilterAltOffOutlinedIcon/>
                                </button>
                                <button 
                                    className=' bgAbuHover select-none rounded-sm cursor-pointer flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2'
                                    onClick={handleSearch}
                                    disabled={!(searchInput || selectedInclusionMode != 'AND' || selectedExclusionMode != 'OR' || selectedLanguage || selectedPublication || Object.values(selectedGenres).some(value => value !== null) || selectedSort != 'order[followedCount]=desc')}
                                >
                                    <p className='text-[12px] sm:text-[14px] text-center font-medium '>Search</p>
                                </button>
                            </div>
                            <div className='flex flex-row gap-x-2 items-center justify-center'>
                                <div 
                                    className={`cursor-pointer px-1 py-1  w-fit h-fit rounded-md ${viewOptions === 'grid' ? 'bgOrenNoHover' : ''}`}
                                    onClick={() => setViewOptions('grid')}
                                >
                                    <img src="/icons/customGrid.svg" className='w-[24px]'/>
                                </div>
                                <div 
                                    className={`cursor-pointer px-1 py-1  w-fit h-fit rounded-md ${viewOptions === 'row' ? 'bgOrenNoHover' : ''}`}
                                    onClick={() => setViewOptions('row')}
                                >
                                    <img src="/icons/customList.svg" className='w-[24px]'/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {noData && !firstLoad && (
                        <div className='flex w-full h-full justify-center items-center'>
                            <p className='text center text-[32px] font-bold'>No Data Found</p>
                        </div>  
                    )}
                    {(firstLoad  ? (
                    <div className="h-full justify-center items-center flex flex-col gap-3">
                        <div className="w-12 h-12 border-4 bgborder-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <p className="text-lg font-semibold">Loading{dots}</p>
                    </div>    
                    ) : (
                    viewOptions === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-3 gap-x-4">
                    {searchMangaData.map((manga, index) => {
                        const image = getMangaCoverImage(manga.id, manga.relationships, "256");
                        const follows = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.follows ?? 0 : 0;
                        const rating = mangaStats ? mangaStats[Object.keys(mangaStats)[index]]?.rating.average ?? 0 : 0;
                        const formattedFollows = follows >= 1000 ? `${(follows / 1000).toFixed(0)}k` : follows;
                        const formattedRating = rating?.toFixed(2);

                        return (
                        <Link key={manga.id} href={`/title/${manga.id}`} passHref>
                            <div  className="flex flex-col gap-y-[2px]">
                                <div className="relative w-full h-full aspect-[3/4]">
                                    <img 
                                    src={image} 
                                    className="absolute top-0 left-0 w-full h-full object-cover rounded-sm" 
                                    alt={manga.attributes.title.en || "Manga Cover"} 
                                    />
                                    <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"}  rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                                </div>
                                <p className="text-[12px] md:text-[14px] font-semibold line-clamp-1">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                                <div className='flex flex-row justify-between items-center w-full'>
                                    <div className="flex flex-row gap-2 flex-wrap">
                                        <p className="text-[10px] md:text-[12px] font-medium bgOrenNoHover px-1 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-row gap-x-[2px] items-center">
                                        <div className="flex flex-row  justify-center items-center">
                                            <BookmarkBorderRoundedIcon className='text-[17px] sm:text-[19px]' sx={{color:'#FD5F00'}} />
                                            <p className="text-[10px] md:text-[12px] font-regular ">{formattedFollows}</p>
                                        </div>
                                        <div className="flex flex-row justify-center items-center">
                                            <StarBorderRoundedIcon className='text-[18px] sm:text-[20px]' sx={{color:'#FD5F00'}} />
                                            <p className="text-[10px] md:text-[12px] font-regular">{formattedRating}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                    </div>
                    ) : (
                    <div className='flex flex-col gap-3 '>
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
                                        className="absolute top-0 left-0 w-full h-full object-cover rounded-sm" 
                                        alt={manga.attributes.title.en || "Manga Cover"} 
                                    />
                                    <p className={`absolute z-10 font-medium text-[10px] ${manga.attributes.status === 'completed' ? "bgIjo" : "bgOrenNoHover"} rounded-t-sm bottom-0 px-1 left-1/2 transform -translate-x-1/2`}>{manga.attributes.status}</p>
                                </div>
                                <div className='flex flex-col justify-between'>
                                    <div>
                                        <p className="text-[14px] font-semibold line-clamp-3 md:line-clamp-1">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</p>
                                        <div className="flex flex-row gap-2 flex-wrap">
                                            <p className="text-[12px] font-medium bgOrenNoHover px-2 rounded-sm">{manga.attributes.contentRating.toUpperCase()}</p>
                                            {manga.attributes.tags
                                            .filter((genre) => genre.attributes.group === 'genre')
                                            .slice(0, 6)
                                            .map((genre, i) => (
                                                <p 
                                                    key={genre.id || `${genre.attributes.name.en}-${i}`} // Ensure uniqueness
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
                                        <div className="flex flex-row gap-x-[2px] justify-center items-center">
                                            <BookmarkBorderRoundedIcon sx={{color:'#FD5F00'}} />
                                            <p className="text-[14px] font-regular ">{formattedFollows}</p>
                                        </div>
                                        <div className="flex flex-row gap-x-[2px] justify-center items-center">
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
                    )))}
                    {(!noData || firstLoad) && (
                    <div className='flex flex-row gap-4 justify-center items-center'>
                        <IconButton disabled={currentPage === 1}>
                            <Link href={`/search?page=${currentPage-1}`} passHref>
                            <ArrowBackRoundedIcon sx={{ color: currentPage === 1 ? "#403F3F" : "white" }} />
                            </Link>
                        </IconButton>
                        <div className='flex flex-row gap-2 justify-center items-center'>
                        {pagination.map((page, index) => (
                            typeof page === "number" ? (
                            <Link key={index} href={`/search?page=${page}`} passHref>
                                <div
                                className={`text-[16px] font-medium py-1 min-w-[30px] text-center rounded cursor-pointer ${
                                    currentPage === page ? "bg-[#FD5F00] text-white" : "bgAbu"
                                }`}
                                >
                                <p>{page}</p>
                                </div>
                            </Link>
                            ) : (
                            <div
                            key={index}
                            className="text-[16px] font-medium py-1 min-w-[30px] text-center rounded bgAbu cursor-pointer"
                            onClick={() => setInputStates((prev) => ({ ...prev, [index]: true }))}
                            >
                            {inputStates[index] ? (
                            <input
                                type="number"
                                className="w-[25px] text-center bgAbu no-arrows"
                                placeholder="..."
                                value={pageInput}
                                onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                    setPageInput(value);
                                }
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handlePageSubmit(index)}
                                onBlur={() => handlePageSubmit(index)}
                                autoFocus
                            />
                            ) : (
                            <p>...</p>
                            )}
                        </div>
                            )
                        ))}
                        </div>
                        <IconButton disabled={currentPage === total}>
                            <Link href={`/search?page=${currentPage+1}`} passHref>
                            <ArrowForwardRoundedIcon sx={{ color: currentPage === total ? "#403F3F" : "white" }} />
                            </Link>
                        </IconButton>
                    </div>
                    )}
                </div>  
            </div>
        </MainLayout>
        
    );
}


interface CustomModalProps {
    title: string;
    modalKey: string;
    openModals: { [key: string]: boolean };
    handleToggle: (key: string) => void;
    handleClose: (key: string) => void;
    label: string;
    setValue: (value: string) => void;
    options: { label: string; value: string | null }[];
    dropdownRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
    bgAbu?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({ 
    title,
    modalKey,
    openModals, 
    handleToggle, 
    handleClose, 
    label, 
    setValue, 
    options,
    dropdownRefs,
    bgAbu = false,
}) => {
    return (
       <div className='flex flex-col gap-y-2 w-full'>
        <p className='text-[12px] sm:text-[14px] *:font-semibold'>{title}</p>
        <div 
            className={`${openModals[modalKey] ? (bgAbu ? 'bgAbu2HoverActive' : 'bgAbuHoverActive') : (bgAbu ? 'bgAbu2Hover' : 'bgAbuHover') } w-full relative select-none flex flex-row gap-x-2 rounded-sm`} 
            ref={(el) => { dropdownRefs.current[modalKey] = el }} 
        >
            <div 
                className={`${openModals[modalKey] ? (bgAbu ? 'bgAbu2' : 'bgAbu') : ''} rounded-sm cursor-pointer w-full flex flex-row justify-between items-center py-1 gap-x-2 pl-3 pr-2`}
                onClick={() => handleToggle(modalKey)}
            >
                <p className='text-[12px] sm:text-[14px] font-medium'>{label}</p>
                {openModals[modalKey] ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
            </div>
            
            {openModals[modalKey] && (
                <div className={`${bgAbu ? 'bgAbu2' : 'bgAbu'} w-full absolute z-40 top-10  select-none flex flex-col gap-1 py-2 px-2 rounded-sm`}>
                    {options.map((option, index) => (
                        <p 
                            key={index}
                            className='text-[12px] sm:text-[14px] opacity-80 hover:bg-[#403F3F] py-1 px-2 rounded-sm cursor-pointer'
                            onClick={() => {
                                handleClose(modalKey);
                                setValue(option.value || '');
                            }}
                        >
                            {option.label}
                        </p>
                    ))}
                </div>
            )}
        </div>
       </div>
    );
};
