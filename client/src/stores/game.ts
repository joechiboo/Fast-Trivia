import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, GameState, GameSettings, Question, QuestionResult } from '../types/game.types'

export const useGameStore = defineStore('game', () => {
  // State
  const roomId = ref<string>('')
  const playerId = ref<string>('')
  const playerName = ref<string>('')
  const players = ref<Player[]>([])
  const gameSettings = ref<GameSettings>({
    category: 'mixed',
    questionCount: 5
  })
  const currentQuestionIndex = ref<number>(0)
  const totalQuestions = ref<number>(5)
  const status = ref<GameState['status']>('waiting')
  const timeRemaining = ref<number>(10)
  const currentQuestion = ref<Question | null>(null)
  const lastResult = ref<QuestionResult | null>(null)
  const selectedAnswer = ref<number | null>(null)

  // Computed
  const isHost = computed(() => {
    const me = players.value.find(p => p.id === playerId.value)
    return me?.isHost || false
  })

  const currentPlayer = computed(() => {
    return players.value.find(p => p.id === playerId.value)
  })

  const sortedPlayers = computed(() => {
    return [...players.value].sort((a, b) => b.score - a.score)
  })

  // Actions
  function setRoom(id: string) {
    roomId.value = id
  }

  function setPlayer(id: string, name: string) {
    playerId.value = id
    playerName.value = name
  }

  function updatePlayers(newPlayers: Player[]) {
    players.value = newPlayers
  }

  function updateGameSettings(settings: Partial<GameSettings>) {
    gameSettings.value = { ...gameSettings.value, ...settings }
  }

  function setGameStatus(newStatus: GameState['status']) {
    status.value = newStatus
  }

  function setCurrentQuestion(question: Question, index: number) {
    currentQuestion.value = question
    currentQuestionIndex.value = index
    selectedAnswer.value = null
    timeRemaining.value = 10
  }

  function setTimeRemaining(time: number) {
    timeRemaining.value = time
  }

  function selectAnswer(answerIndex: number) {
    selectedAnswer.value = answerIndex
  }

  function setQuestionResult(result: QuestionResult) {
    lastResult.value = result
  }

  function reset() {
    roomId.value = ''
    playerId.value = ''
    playerName.value = ''
    players.value = []
    currentQuestionIndex.value = 0
    status.value = 'waiting'
    currentQuestion.value = null
    lastResult.value = null
    selectedAnswer.value = null
  }

  return {
    // State
    roomId,
    playerId,
    playerName,
    players,
    gameSettings,
    currentQuestionIndex,
    totalQuestions,
    status,
    timeRemaining,
    currentQuestion,
    lastResult,
    selectedAnswer,
    // Computed
    isHost,
    currentPlayer,
    sortedPlayers,
    // Actions
    setRoom,
    setPlayer,
    updatePlayers,
    updateGameSettings,
    setGameStatus,
    setCurrentQuestion,
    setTimeRemaining,
    selectAnswer,
    setQuestionResult,
    reset
  }
})
