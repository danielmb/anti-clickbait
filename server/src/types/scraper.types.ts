// for the files in the scrapers folder

// export config

export interface Article {
  title: string;
  url: string;
  content: string;
  date: Date;
}

export type Scrape = () => Promise<Article[]>;

export type ScrapeFile = {
  default: Scrape;
};
