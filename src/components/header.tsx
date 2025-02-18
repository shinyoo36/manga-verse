import Image from "next/image";

const Header = () => {

  return (
    <div className="w-full h-[380px] header relative">
      <div className="content relative">
        <div className="relative h-[70px] flex justify-between items-center px-2 z-100">
            <p className="font-protest text-[32px] tracking-wide">MangaVerse</p>
            <div className="flex gap-2">
              <img src="/icons/search.svg" />
              <img src="/icons/profile.svg" />
            </div>
        </div>
        <div className="flex p-2 gap-2">
          <img src="/img/tes.jpg" className="w-[125px] rounded-md"/>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[14px] font-bold">The Veteran Healer is Overpowered</p>
              <div className="flex gap-1 flex-wrap">
                <div className="bg-[#171717] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-bold">ACTION</p>
                </div>
                <div className="bg-[#171717] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-bold">ADVENTURE</p>
                </div>
                <div className="bg-[#171717] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-bold">DRAMA</p>
                </div>
                <div className="bg-[#171717] flex-wrap flex w-fit px-1 rounded-sm">
                  <p className="text-[12px] font-bold">FANTASY</p>
                </div>
              </div>
            </div>
            <p className="text-[14px] font-semibold italic">Awonit, Kang Hari, jd</p>
          </div>
        </div>
        <p className="text-[12px] font-semibold text-justify px-2 max-h-[80px]">
          A certain village was attacked by a monster army and fell into a dire situation. At that moment, the strongest hero, Eric, appeared and instantly mowed down the enemies. However, due to his overwhelming strength, his equipment couldn’t withstand the battle, and he was cursed with the tragic fate of becoming naked after every fight…!? The curtain opens on a liberating fully loaded adventure craft comedy!
        </p>
      </div>
    </div>
  );
};

export default Header;  