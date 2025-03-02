export interface Manga {
    id: string;
    type: string;
    attributes: {
      title: Record<string, string>;
      altTitles: Record<string, string>[];
      description: Record<string, string>;
      isLocked: boolean;
      links: Record<string, string>;
      originalLanguage: string;
      lastVolume: string;
      lastChapter: string;
      publicationDemographic: string;
      status: string;
      year: number;
      contentRating: string;
      tags: {
        id: string;
        type: string;
        attributes: {
          name: Record<string, string>;
          description: Record<string, string>;
          group: string;
          version: number;
        };
        relationships: any[];
      }[];
      state: string;
      chapterNumbersResetOnNewVolume: boolean;
      createdAt: string;
      updatedAt: string;
      version: number;
      availableTranslatedLanguages: string[];
      latestUploadedChapter: string;
    };
    relationships: {
      id: string;
      type: string;
      attributes?: {
        name: string;
        fileName: string;
        imageUrl?: string | null;
        biography?: Record<string, string>;
        twitter?: string | null;
        pixiv?: string | null;
        melonBook?: string | null;
        fanBox?: string | null;
        booth?: string | null;
        namicomi?: string | null;
        nicoVideo?: string | null;
        skeb?: string | null;
        fantia?: string | null;
        tumblr?: string | null;
        youtube?: string | null;
        weibo?: string | null;
        naver?: string | null;
        website?: string | null;
        createdAt: string;
        updatedAt: string;
        version: number;
      };
    }[];
}


export interface MangaApiResponse {
    result: string;
    response: string;
    data: any;
}

export interface Chapter {
  id: string;
  type: "chapter";
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
  };
  relationships: Relationship[];
}

export interface Relationship {
  id: string;
  type: "manga" | "scanlation_group" | "user";
  attributes?: {
    name?: string; 
  };
}

export interface MangaStat {
  [mangaId: string]: {
    comments: {
      threadId: number;
      repliesCount: number;
    };
    rating: {
      average: number;
      bayesian: number;
      distribution: {
        [key: string]: number;
      };
    };
    follows: number;
  };
}

export interface ChapterDetail {
  result: string; // "ok"
  baseUrl: string; // Base URL for images
  chapter: {
    hash: string; // Unique hash for this chapter
    data: string[]; // Array of high-quality image file names
    dataSaver: string[]; // Array of compressed image file names
  };
}