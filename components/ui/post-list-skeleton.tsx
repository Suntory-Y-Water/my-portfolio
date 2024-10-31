import { Skeleton } from './skeleton';

export default function PostsListSkeleton() {
  const skeletonCount = 6;
  return (
    <ul className='grid place-items-center gap-7 items-stretch grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <li key={index} className='w-full'>
          <div className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl'>
            <Skeleton className='h-16 w-16 rounded-full' />
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
