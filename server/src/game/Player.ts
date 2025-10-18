import type { Player as PlayerType, Answer } from '../types/game.types'

export class Player implements PlayerType {
  id: string
  name: string
  score: number
  currentStreak: number
  isHost: boolean
  answers: Answer[]

  constructor(id: string, name: string, isHost: boolean = false) {
    this.id = id
    this.name = name
    this.score = 0
    this.currentStreak = 0
    this.isHost = isHost
    this.answers = []
  }

  submitAnswer(questionId: string, answerIndex: number, timestamp: number, isCorrect: boolean, earnedPoints: number): void {
    this.answers.push({
      questionId,
      answerIndex,
      timestamp,
      isCorrect,
      earnedPoints
    })

    if (isCorrect) {
      this.currentStreak++
      this.score += earnedPoints
    } else {
      this.currentStreak = 0
    }
  }

  resetForNewGame(): void {
    this.score = 0
    this.currentStreak = 0
    this.answers = []
  }

  toJSON(): PlayerType {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
      currentStreak: this.currentStreak,
      isHost: this.isHost,
      answers: this.answers
    }
  }
}
