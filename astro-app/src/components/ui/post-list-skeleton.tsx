import { Skeleton } from './skeleton';

export default function PostsListSkeleton() {
  const skeletonCount = 6;
  return (
    <ul className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] place-items-center items-stretch gap-7'>
      {Array.from({ length: skeletonCount }, (_, index) => index).map((id) => (
        <li key={`skeleton-${id}`} className='w-full'>
          <div className='flex aspect-[4/3] size-full flex-col items-center justify-center gap-4 rounded-3xl border p-6'>
            <Skeleton className='size-16 rounded-full' />
            <div className='w-full space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            <Skeleton className='h-3 w-24' />
          </div>
        </li>
      ))}
    </ul>
  );
}
