export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className='flex gap-2 mt-2'>
      {tags.map((tag) => (
        <span key={tag} className='text-sm bg-gray-100 px-2 py-1 rounded'>
          {tag}
        </span>
      ))}
    </div>
  );
}
