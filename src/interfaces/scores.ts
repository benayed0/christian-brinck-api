export interface Scores {
  [dimension: string]: {
    [variable: string]: {
      1: {
        start: number;
        end: number;
        text: string;
      }[];
      3: {
        start: number;
        end: number;
        text: string;
      }[];
      5: {
        start: number;
        end: number;
        text: string;
      }[];
    };
  };
}
