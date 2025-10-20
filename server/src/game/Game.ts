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
  resultsCalculated: boolean // 防止重複計算結果

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
    this.resultsCalculated = false
  }

  private selectQuestions(category: string, count: number): Question[] {
    const allQuestions = questionsData as Question[]

    // 根據類別篩選
    let filtered: Question[]
    if (category === 'mixed') {
      filtered = allQuestions
    } else {
      filtered = allQuestions.filter(q => q.category === category)
    }

    // 根據難度篩選
    if (this.settings.ageGroup) {
      filtered = filtered.filter(q => q.ageGroup === this.settings.ageGroup)
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
    this.resultsCalculated = false // 重置結果計算標記

    // 隨機打亂選項順序並儲存
    const question = this.getCurrentQuestion()
    if (question) {
      const shuffled = this.shuffleOptions(question)
      this.questions[this.currentQuestionIndex] = shuffled // 儲存打亂後的題目
      return shuffled
    }
    return null
  }

  private shuffleOptions(question: Question): Question {
    // 建立選項索引和內容的配對
    const optionsWithIndex = question.options.map((option, index) => ({
      option,
      originalIndex: index
    }))

    // Fisher-Yates 洗牌算法
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]]
    }

    // 找出正確答案的新位置
    const newCorrectAnswerIndex = optionsWithIndex.findIndex(
      item => item.originalIndex === question.correctAnswer
    )

    return {
      ...question,
      options: optionsWithIndex.map(item => item.option) as [string, string, string, string],
      correctAnswer: newCorrectAnswerIndex as 0 | 1 | 2 | 3
    }
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

    // 防止重複計算結果
    if (this.resultsCalculated) {
      // 如果已經計算過，直接返回當前狀態
      return this.getAllPlayers().map(player => ({
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        isCorrect: player.answers[player.answers.length - 1]?.isCorrect || false,
        earnedPoints: player.answers[player.answers.length - 1]?.earnedPoints || 0,
        currentStreak: player.currentStreak
      })).sort((a, b) => b.score - a.score)
    }

    this.resultsCalculated = true

    const results = this.getAllPlayers().map(player => {
      const answer = this.submittedAnswers.get(player.id)

      if (!answer) {
        // 未作答 - 也要記錄到答題歷史
        player.currentStreak = 0
        player.submitAnswer(
          currentQuestion.id,
          -1, // 使用 -1 表示未作答
          this.answerDeadline,
          false,
          0
        )
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
        const timeBonus = (timeRemaining / 10) * 100 // 提高時間加成權重，最多100分
        const streakBonus = player.currentStreak * 20
        earnedPoints = Math.floor(basePoints + timeBonus + streakBonus) // 無條件捨去保留差異
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
