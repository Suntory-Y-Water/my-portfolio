export type LiveName = {
  id: string;
  liveName: string;
  liveTypeId: string;
};

export type HeaderLinkProps = {
  href: string;
  title: string;
};

export type SongsSungProps = {
  id: number;
  song: SongProps;
  timesSung: number;
  liveName: LiveNameProps;
  venue: VenueNameProps;
};

export type SongProps = {
  title: string;
};

export type LiveNameProps = {
  liveName: string;
};

export type VenueNameProps = {
  name: string;
};
