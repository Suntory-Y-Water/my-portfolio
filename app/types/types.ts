export type LiveName = {
  id: string;
  liveName: string;
  liveType: {
    type: string;
  };
};

export type HeaderLinkProps = {
  href: string;
  title: string;
};

export type SongsSungProps = {
  id: number;
  song: { title: string };
  timesSung: number;
  liveName: { liveName: string };
  venue: { name: string };
};

export type CheckBoxProps = {
  id: string;
  name: string;
};
