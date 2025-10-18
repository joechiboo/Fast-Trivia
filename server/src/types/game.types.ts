export type Category = 'chinese' | 'english' | 'math' | 'general' | 'mixed'

export interface Question {
  id: string
  category: Exclude<Category, 'mixed'>
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation?: string
  ageGroup?: 'preschool' | 'grade1'
}

export interface Player {
  id: string
  name: string
  score: number
  currentStreak: number
  isHost: boolean
  answers: Answer[]
}

export interface Answer {
  questionId: string
  answerIndex: number
  timestamp: number
  isCorrect: boolean
  earnedPoints: number
}

export interface GameSettings {
  category: Category
  questionCount: 5
}

export type GameStatus = 'waiting' | 'countdown' | 'question' | 'result' | 'ended'
