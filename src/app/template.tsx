type Props = {
  children: React.ReactNode;
};

export default function RootTemplate({ children }: Props) {
  return <div className='animate-fade-in-bottom'>{children}</div>;
}
