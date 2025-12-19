import { z } from 'zod';

export const AnswerSchema = z.object({
  text: z.string(),
  correct: z.boolean(),
  explanation: z.string().nullable(),
});

export const QuizSchema = z.object({
  question: z.string(),
  answers: z.array(AnswerSchema),
});

export const SelfAssessmentSchema = z.object({
  quizzes: z.array(QuizSchema),
});

export type Answer = z.infer<typeof AnswerSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type SelfAssessmentData = z.infer<typeof SelfAssessmentSchema>;
