import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '../stores/game'
import type { Player, Question, QuestionResult, GameSettings } from '../types/game.types'

const socket = ref<Socket | null>(null)

export function useSocket() {
  const gameStore = useGameStore()

  function connect() {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
    socket.value = io(serverUrl)

    // 連線事件
    socket.value.on('connect', () => {
      console.log('Connected to server')
    })

    socket.value.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    // 房間事件
    socket.value.on('room_created', (data: { roomId: string; playerId: string; playerName: string }) => {
      gameStore.setRoom(data.roomId)
      gameStore.setPlayer(data.playerId, data.playerName)
    })

    socket.value.on('room_joined', (data: { roomId: string; playerId: string; players: Player[] }) => {
      gameStore.setRoom(data.roomId)
      gameStore.setPlayer(data.playerId, gameStore.playerName)
      gameStore.updatePlayers(data.players)
    })

    socket.value.on('player_joined', (data: { players: Player[] }) => {
      gameStore.updatePlayers(data.players)
    })

    socket.value.on('player_left', (data: { players: Player[] }) => {
      gameStore.updatePlayers(data.players)
    })

    // 遊戲事件
    socket.value.on('game_started', (data: { settings: GameSettings }) => {
      gameStore.updateGameSettings(data.settings)
      gameStore.setGameStatus('countdown')
    })

    socket.value.on('countdown', (data: { count: number }) => {
      console.log('Countdown:', data.count)
    })

    socket.value.on('question', (data: { question: Question; questionIndex: number; totalQuestions: number }) => {
      gameStore.setCurrentQuestion(data.question, data.questionIndex)
      gameStore.setGameStatus('question')
    })

    socket.value.on('time_update', (data: { timeRemaining: number }) => {
      gameStore.setTimeRemaining(data.timeRemaining)
    })

    socket.value.on('question_result', (data: { result: QuestionResult }) => {
      gameStore.setQuestionResult(data.result)
      gameStore.updatePlayers(data.result.scoreboard.map(s => ({
        id: s.playerId,
        name: s.playerName,
        score: s.score,
        currentStreak: s.currentStreak,
        isHost: false // 這裡需要從 players 中保留 isHost 狀態
      })))
      gameStore.setGameStatus('result')
    })

    socket.value.on('game_ended', (data: { finalScoreboard: QuestionResult['scoreboard'] }) => {
      gameStore.setGameStatus('ended')
    })

    socket.value.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message)
      alert(data.message)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  function createRoom(playerName: string) {
    if (socket.value) {
      socket.value.emit('create_room', { playerName })
    }
  }

  function joinRoom(roomId: string, playerName: string) {
    if (socket.value) {
      socket.value.emit('join_room', { roomId, playerName })
    }
  }

  function leaveRoom() {
    if (socket.value && gameStore.roomId) {
      socket.value.emit('leave_room', { roomId: gameStore.roomId, playerId: gameStore.playerId })
      gameStore.reset()
    }
  }

  function startGame(settings: GameSettings) {
    if (socket.value && gameStore.roomId) {
      socket.value.emit('start_game', {
        roomId: gameStore.roomId,
        settings
      })
    }
  }

  function submitAnswer(answerIndex: number) {
    if (socket.value && gameStore.roomId && gameStore.currentQuestion) {
      socket.value.emit('submit_answer', {
        roomId: gameStore.roomId,
        playerId: gameStore.playerId,
        questionId: gameStore.currentQuestion.id,
        answerIndex,
        timestamp: Date.now()
      })
      gameStore.selectAnswer(answerIndex)
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    submitAnswer
  }
}
