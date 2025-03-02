export const getMangaCoverImage = (mangaId: string, relationships: any[], size: string): string => {
    const coverArt = relationships.find(rel => rel.type === "cover_art");
    return coverArt
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/manga/cover/${mangaId}/${coverArt.attributes?.fileName}/${size}`
        : "/fallback-image.jpg";
};