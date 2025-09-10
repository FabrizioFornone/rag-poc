export interface DocumentMatch {
  id: number;
  content: string;
  similarity: number;
  [key: string]: any;
}
