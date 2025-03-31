// Define the types for our search result data
export interface BaseSearchResult {
  id: number;
  type: string;
  title: string;
  description: string;
  relevanceScore: number;
  date?: string;
  source?: string;
}

export interface WebpageResult extends BaseSearchResult {
  type: "webpage";
  url: string;
  source: string;
  date: string;
}

export interface DocumentResult extends BaseSearchResult {
  type: "document";
  fileType: string;
  fileSize: string;
  author: string;
  date: string;
}

export interface ImageResult extends BaseSearchResult {
  type: "image";
  thumbnailUrl: string;
  dimensions: string;
  fileType: string;
  source: string;
}

export interface VideoResult extends BaseSearchResult {
  type: "video";
  thumbnailUrl: string;
  duration: string;
  channel: string;
  views: string;
  date: string;
}

export interface ApiResult extends BaseSearchResult {
  type: "api";
  apiVersion: string;
  lastUpdated: string;
  provider: string;
}

export type SearchResult =
  | WebpageResult
  | DocumentResult
  | ImageResult
  | VideoResult
  | ApiResult;

// Context type for saved results
export interface SearchContextType {
  savedResults: SearchResult[];
  saveResult: (result: SearchResult) => void;
  removeResult: (resultId: number) => void;
  isSaved: (resultId: number) => boolean;
}

// Props for the SearchResults component
export interface SearchResultsProps {
  initialResults?: SearchResult[];
  onSearch?: (query: string) => void;
  onSavedResultsChange?: (results: SearchResult[]) => void;
}

// Props for the SearchResultItem component
export interface SearchResultItemProps {
  result: SearchResult;
  expanded: boolean;
  toggleExpand: () => void;
}

// Props for the SelectedItems component
export interface SelectedItemsProps {
  title?: string;
  maxHeight?: number | string;
  onExport?: (items: SearchResult[]) => void;
  onShare?: (items: SearchResult[]) => void;
}
