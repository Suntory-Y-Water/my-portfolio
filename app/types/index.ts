export type ZennResponse = {
  articles: ZennPost[];
};

export type ZennPost = {
  id: number;
  path: string;
  emoji: string;
  title: string;
  published_at: string;
  source: 'Zenn';
};

export type QiitaPost = {
  created_at: string;
  id: string;
  title: string;
  url: string;
  source: 'Qiita';
};

export type Post = ZennPost | QiitaPost;
