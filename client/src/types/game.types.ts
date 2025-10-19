export type Category = 'chinese' | 'english' | 'math' | 'general' | 'mixed'

export interface Question {
  id: string
  category: Exclude<Category, 'mixed'>
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation?: string
  ageGroup?: 'preschool' | 'grade1' | 'grade2' | 'grade4'
}

export interface Player {
  id: string
  name: string
  score: number
  currentStreak: number
  isHost: boolean
}

export type AgeGroup = 'preschool' | 'grade2' | 'grade4'

export interface GameSettings {
  category: Category
  questionCount: 5
  ageGroup?: AgeGroup
}

export interface Answer {
  playerId: string
  answerIndex: number
  timestamp: number
}

export interface QuestionResult {
  correctAnswer: number
  scoreboard: Array<{
    playerId: string
    playerName: string
    score: number
    isCorrect: boolean
    earnedPoints: number
    currentStreak: number
  }>
}

export type GameStatus = 'waiting' | 'countdown' | 'question' | 'result' | 'ended'

export interface GameState {
  roomId: string
  players: Player[]
  currentQuestionIndex: number
  totalQuestions: number
  status: GameStatus
  timeRemaining: number
  currentQuestion?: Question
  lastResult?: QuestionResult
}
