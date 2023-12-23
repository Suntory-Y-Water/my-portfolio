import React from 'react';

interface CareerProps {
  date: string;
  description: string;
}

const Career = ({ date, description }: CareerProps) => {
  return (
    <div className='flex py-2'>
      <div className='w-1/6 text-left font-semibold text-blue-600'>{date}</div>
      <div className='border-l-2 pl-4 w-5/6'>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Career;
