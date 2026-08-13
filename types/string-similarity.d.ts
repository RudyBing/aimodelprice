declare module 'string-similarity' {
  export function compareTwoStrings(str1: string, str2: string): number;
  export function findBestMatch(input: string, targets: string[]): {
    ratings: { target: string; rating: number }[];
    bestMatch: { target: string; rating: number };
    bestMatchIndex: number;
  };
}
