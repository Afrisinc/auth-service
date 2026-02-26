export interface SearchQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'asc' | 'desc';
  dateRange?: '24h' | '7d' | '30d';
}
