// Data types mirroring the iOS models in Models/*.swift.

export interface KataSubMove {
  order: number;
  technique: string;
  hiragana?: string;
  stance: string;
  stanceHiragana?: string;
  description: string;
  icon: string; // SF Symbol name from the iOS app, mapped to a web icon in Icon.tsx
  kiai?: boolean;
}

export interface KataMove {
  sequence: number; // -1 = Rei, 0 = Yōi, 1..n = real moves
  sequenceName?: string; // e.g. "Rei", "Yōi"
  japaneseName: string;
  direction: string; // N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW
  kiai?: boolean;
  subMoves: KataSubMove[];
}

export interface Kata {
  name: string;
  japaneseName: string;
  hiraganaName?: string;
  numberOfMoves: number;
  kataNumber: number;
  beltRank: string; // e.g. "8_kyu", "1_dan"
  description: string;
  keyTechniques: string[];
  referenceURL?: string;
  videoURLs?: string[];
  moves: KataMove[];
}

export interface KataFileInfo {
  fileName: string;
  kataNumber: number;
  name: string;
  enabled: boolean;
}

export interface KataConfiguration {
  availableKata: KataFileInfo[];
}

export interface VocabularyTerm {
  id: number;
  term: string;
  japaneseName: string;
  hiraganaName: string;
  shortDescription: string;
  definition: string;
  category: string;
  componentBreakdown?: string;
}
