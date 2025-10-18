import type { Question, GameSettings, GameStatus } from '../types/game.types'
import { Player } from './Player'
import questionsData from '../data/questions.json'

export class Game {
  roomId: string
  players: Map<string, Player>
  settings: GameSettings
  questions: Question[]
  currentQuestionIndex: number
  status: GameStatus
  questionStartTime: number
  answerDeadline: number
  submittedAnswers: Map<string, { answerIndex: number; timestamp: number }>

  constructor(roomId: string, settings: GameSettings) {
    this.roomId = roomId
    this.players = new Map()
    this.settings = settings
    this.questions = this.selectQuestions(settings.category, settings.questionCount)
    this.currentQuestionIndex = -1
    this.status = 'waiting'
    this.questionStartTime = 0
    this.answerDeadline = 0
    this.submittedAnswers = new Map()
  }

  private selectQuestions(category: string, count: number): Question[] {
    const allQuestions = questionsData as Question[]

    let filtered: Question[]
    if (category === 'mixed') {
      filtered = allQuestions
    } else {
      filtered = allQuestions.filter(q => q.category === category)
    }

    // 隨機打亂並選取指定數量
    const shuffled = filtered.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  addPlayer(player: Player): void {
    this.players.set(player.id, player)
  }

  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId)
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId)
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  startGame(): void {
    this.status = 'countdown'
    this.currentQuestionIndex = -1

    // 重置所有玩家分數
    this.players.forEach(player => player.resetForNewGame())
  }

  nextQuestion(): Question | null {
    this.currentQuestionIndex++

    if (this.currentQuestionIndex >= this.questions.length) {
      this.status = 'ended'
      return null
    }

    this.status = 'question'
    this.questionStartTime = Date.now()
    this.answerDeadline = this.questionStartTime + 10000 // 10 seconds
    this.submittedAnswers.clear()

    return this.getCurrentQuestion()
  }

  getCurrentQuestion(): Question | null {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) {
      return null
    }
    return this.questions[this.currentQuestionIndex]
  }

  submitAnswer(playerId: string, answerIndex: number, timestamp: number): boolean {
    // 檢查是否在答題時間內
    if (timestamp > this.answerDeadline) {
      return false
    }

    // 檢查是否已經作答
    if (this.submittedAnswers.has(playerId)) {
      return false
    }

    this.submittedAnswers.set(playerId, { answerIndex, timestamp })
    return true
  }

  calculateResults(): Array<{
    playerId: string
    playerName: string
    score: number
    isCorrect: boolean
    earnedPoints: number
    currentStreak: number
  }> {
    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) return []

    const results = this.getAllPlayers().map(player => {
      const answer = this.submittedAnswers.get(player.id)

      if (!answer) {
        // 未作答
        player.currentStreak = 0
        return {
          playerId: player.id,
          playerName: player.name,
          score: player.score,
          isCorrect: false,
          earnedPoints: 0,
          currentStreak: 0
        }
      }

      const isCorrect = answer.answerIndex === currentQuestion.correctAnswer
      const timeRemaining = Math.max(0, this.answerDeadline - answer.timestamp) / 1000

      let earnedPoints = 0
      if (isCorrect) {
        // 計分公式：基礎分 + 時間加成 + 連勝加成
        const basePoints = 100
        const timeBonus = (timeRemaining / 10) * 50
        const streakBonus = player.currentStreak * 20
        earnedPoints = Math.round(basePoints + timeBonus + streakBonus)
      }

      // 更新玩家狀態
      player.submitAnswer(
        currentQuestion.id,
        answer.answerIndex,
        answer.timestamp,
        isCorrect,
        earnedPoints
      )

      return {
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        isCorrect,
        earnedPoints,
        currentStreak: player.currentStreak
      }
    })

    // 按分數排序
    return results.sort((a, b) => b.score - a.score)
  }

  isGameEnded(): boolean {
    return this.currentQuestionIndex >= this.questions.length - 1
  }

  getFinalScoreboard() {
    return this.getAllPlayers()
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        correctCount: player.answers.filter(a => a.isCorrect).length,
        totalQuestions: this.questions.length
      }))
      .sort((a, b) => b.score - a.score)
  }
}
