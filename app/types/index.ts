export type ZennResponse = {
  articles: ZennPost[];
};

type ZennPost = {
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

export type Post = {
  id: string;
  url: string;
  emoji?: string; // Zennのみ。Qiitaの場合はないので、post側ではQiitaアイコンを表示する
  title: string;
  createdAt: string;
};
