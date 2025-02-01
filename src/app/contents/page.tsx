type Props = {
  searchParams: { page?: string };
};

export default async function Home({ searchParams }: Props) {
  const currentPage = Number(searchParams.page) || 1;

  // API実行
  // const posts = await getAllPosts();
  // const dbInfo = await getDatabase();

  return (
    <div className='max-w-2xl mx-auto px-4'>
      <h1>コンテンツページです</h1>
    </div>
  );
}
