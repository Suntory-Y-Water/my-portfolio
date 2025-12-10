'use client';

import { useState } from 'react';
import type { SelfAssessmentData } from '@/types/self-assessment';

type Props = {
  selfAssessment: SelfAssessmentData;
};

export function SelfAssessment({ selfAssessment }: Props) {
  return (
    <div className='my-8 space-y-6'>
      <h2 className='text-2xl font-bold'>理解度チェック</h2>
      {selfAssessment.quizzes.map((quiz, index) => (
        <QuizItem
          key={`quiz-${quiz.question.slice(0, 20)}-${index}`}
          quiz={quiz}
          quizNumber={index + 1}
        />
      ))}
    </div>
  );
}

type QuizItemProps = {
  quiz: SelfAssessmentData['quizzes'][number];
  quizNumber: number;
};

function QuizItem({ quiz, quizNumber }: QuizItemProps) {
  return (
    <div className='flex flex-col justify-center'>
      <h3 className='rounded-t-md bg-gray-200 px-4 py-8 text-lg font-medium dark:bg-zinc-600'>
        問題{quizNumber}: {quiz.question}
      </h3>
      <ul className='flex flex-col justify-center'>
        {quiz.answers.map((answer, index) => (
          <li key={`answer-${answer.text.slice(0, 20)}-${index}`}>
            <AnswerItem answer={answer} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type AnswerItemProps = {
  answer: SelfAssessmentData['quizzes'][number]['answers'][number];
};

function AnswerItem({ answer }: AnswerItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className='border border-t-0 border-gray-300 font-medium text-gray-900 dark:border-zinc-600 dark:text-gray-50'
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className='cursor-pointer p-4 text-lg hover:bg-gray-100 dark:hover:bg-zinc-700'>
        {answer.text}
      </summary>
      <div className='p-4'>
        <p>
          {answer.correct ? (
            <span className='flex items-center gap-1 text-green-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='h-6 w-6'
                aria-label='正解アイコン'
              >
                <title>正解</title>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                />
              </svg>
              正解！
            </span>
          ) : (
            <span className='flex items-center gap-2 text-red-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='h-6 w-6'
                aria-label='不正解アイコン'
              >
                <title>不正解</title>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              もう一度考えてみましょう
            </span>
          )}
        </p>
        {answer.explanation && <p className='mt-4'>{answer.explanation}</p>}
      </div>
    </details>
  );
}
