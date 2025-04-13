type Props = {
  date: string;
  description: string;
};

export default function Career({ date, description }: Props) {
  return (
    <div className='flex flex-col py-2 md:flex-row md:space-x-2'>
      {/* モバイルでは上部、md以上では左側に配置 */}
      <div className='text-left font-semibold md:w-1/6'>{date}</div>
      {/* モバイルでは上部の下に配置し、md以上では左側に境界線と余白を付与 */}
      <div className='mt-1 border-t-2 md:mt-0 md:w-5/6 md:border-l-2 md:border-t-0 md:pl-4'>
        <p>{description}</p>
      </div>
    </div>
  );
}
