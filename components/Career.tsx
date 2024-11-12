type Props = {
  date: string;
  description: string;
};

function Career({ date, description }: Props) {
  return (
    <div className='flex py-2 space-x-2'>
      <div className='w-1/6 text-left'>{date}</div>
      <div className='border-l-2 pl-4 w-5/6'>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default Career;
