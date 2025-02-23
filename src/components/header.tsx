const Header = () => {

  return (
    <div className="w-full h-[380px] header px-4 space-y-3">
      <div className="h-[70px] flex justify-between items-center z-100">
          <p className="font-protest text-[32px] tracking-wide">MangaVerse</p>
          <div className="flex gap-4">
            <img src="/icons/search.svg" />
            <img src="/icons/profile.svg" />
          </div>
      </div>
      <div className="flex justify-center items-center gap-2 pb-3">
        <div className="w-[8px] h-[8px] rounded-full bg-[#FD5F00]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
        <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]"/>
      </div>
      <div className="flex flex-row gap-2">
        <img src="/img/tes.jpg" className="h-[196px] rounded-md"/>
          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-[16px] font-bold">Myst, Might, Mayhem</p>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-[#403F3F] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-medium">ACTION</p>
                </div>
                <div className="bg-[#403F3F] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-medium">ADVENTURE</p>
                </div>
                <div className="bg-[#403F3F] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-medium">DRAMA</p>
                </div>
                <div className="bg-[#403F3F] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-medium">FANTASY</p>
                </div>
              </div>
            </div>
            <p className="text-[14px] font-mediu italic">Hanjung Wolya (한중월야), Madbird (매드버드)</p>
          </div>

      </div>
      <p className="text-[12px] font-regular text-justify max-w-[calc(100vw-16px)] sm:max-w-none line-clamp-2 sm:line-clamp-none">
        All Jeong wants is a second chance -- for revenge! His grandfather’s gruesome death has transformed him into the bloodthirsty and ruthless Scythe Demon. He will stop at nothing until he has killed the man responsible. Yet rage and determination alone are not enough. He must train in martial arts if he ever wants to stand a chance against such a formidable foe. Will he succeed in his revenge on the murderer of his grandfather?
      </p>
      <div className="flex flex-col items-center relative">
        <div className="bg-[#FD5F00] h-[1.5px] w-full absolute"/>
        <div className="bg-[#FD5F00] w-fit flex flex-row gap-2 px-2 rounded-b-[5px] absolute top-[1px]">
          <img src="/icons/dropdown.svg"/>
          <p className="text-[12px]">see more</p>
          <img src="/icons/dropdown.svg"/>
        </div>
      </div>
    </div>
  );
};

export default Header;  