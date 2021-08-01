export interface AtomLink {
  href: string;
  rel: string;
  type: string;
}

export interface PepperMerchant {
  name: string;
  price: string;
}

export interface MediaContent {
  medium: string;
  url: string;
  width: number;
  height: number;
}

export interface Item {
  category: string;
  "pepper:merchant": PepperMerchant;
  "media:content": MediaContent;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
}

export interface Channel {
  title: string;
  description: string;
  link: string;
  "atom:link": AtomLink;
  item: Item[];
}

export interface Rss {
  "xmlns:content": string;
  "xmlns:wfw": string;
  "xmlns:dc": string;
  "xmlns:atom": string;
  "xmlns:sy": string;
  "xmlns:slash": string;
  "xmlns:media": string;
  "xmlns:pepper": string;
  version: number;
  channel: Channel;
}

export interface RootObject {
  rss: Rss;
}
