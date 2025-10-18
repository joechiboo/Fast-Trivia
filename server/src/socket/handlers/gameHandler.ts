import { Server, Socket } from 'socket.io'
import { RoomManager } from '../../game/RoomManager'
import type { GameSettings } from '../../types/game.types'

// 儲存每個房間的計時器，以便在需要時清除
const roomTimers = new Map<string, NodeJS.Timeout>()
// 追蹤每個房間當前題目的結果是否已顯示，防止重複顯示
const roomResultShown = new Map<string, boolean>()

export function handleGameEvents(io: Server, socket: Socket, roomManager: RoomManager) {
  // 開始遊戲
  socket.on('start_game', ({ roomId, settings }: { roomId: string; settings: GameSettings }) => {
    try {
      const room = roomManager.getRoom(roomId)

      if (!room) {
        socket.emit('error', { message: '房間不存在' })
        return
      }

      // 檢查是否為房主
      if (room.hostId !== socket.id) {
        socket.emit('error', { message: '只有房主可以開始遊戲' })
        return
      }

      // 移除玩家數量限制，允許單人遊戲
      // 原本的限制：至少需要 2 位玩家
      if (room.getAllPlayers().length < 1) {
        socket.emit('error', { message: '房間內沒有玩家' })
        return
      }

      // 開始遊戲
      const game = room.startGame(settings)

      // 通知所有玩家遊戲開始
      io.to(roomId).emit('game_started', { settings })

      console.log(`Game started in room ${roomId}`)

      // 3 秒倒數
      let countdown = 3
      const countdownInterval = setInterval(() => {
        io.to(roomId).emit('countdown', { count: countdown })
        countdown--

        if (countdown < 0) {
          clearInterval(countdownInterval)
          // 開始第一題
          startNextQuestion(io, roomId, game, roomManager)
        }
      }, 1000)
    } catch (error) {
      console.error('Error starting game:', error)
      socket.emit('error', { message: '開始遊戲失敗' })
    }
  })

  // 提交答案
  socket.on('submit_answer', ({ roomId, playerId, questionId, answerIndex, timestamp }: {
    roomId: string
    playerId: string
    questionId: string
    answerIndex: number
    timestamp: number
  }) => {
    try {
      const room = roomManager.getRoom(roomId)

      if (!room) {
        socket.emit('error', { message: '房間不存在' })
        return
      }

      const game = room.getGame()

      if (!game) {
        socket.emit('error', { message: '遊戲未開始' })
        return
      }

      const success = game.submitAnswer(playerId, answerIndex, timestamp)

      if (!success) {
        socket.emit('error', { message: '提交答案失敗' })
        return
      }

      console.log(`Player ${playerId} submitted answer ${answerIndex}`)

      // 檢查是否所有玩家都已作答
      if (game.submittedAnswers.size === game.players.size) {
        // 檢查是否已經顯示過結果
        if (!roomResultShown.get(roomId)) {
          // 清除該房間的計時器
          if (roomTimers.has(roomId)) {
            clearInterval(roomTimers.get(roomId)!)
            roomTimers.delete(roomId)
          }
          // 所有玩家都作答了，立即顯示結果
          showQuestionResult(io, roomId, game, roomManager)
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      socket.emit('error', { message: '提交答案失敗' })
    }
  })
}

function startNextQuestion(io: Server, roomId: string, game: any, roomManager: RoomManager) {
  const question = game.nextQuestion()

  if (!question) {
    // 遊戲結束
    endGame(io, roomId, game)
    return
  }

  // 重置結果顯示標記
  roomResultShown.set(roomId, false)

  // 發送題目（不包含正確答案）
  io.to(roomId).emit('question', {
    question: {
      id: question.id,
      category: question.category,
      question: question.question,
      options: question.options,
      ageGroup: question.ageGroup
    },
    questionIndex: game.currentQuestionIndex,
    totalQuestions: game.questions.length
  })

  console.log(`Question ${game.currentQuestionIndex + 1} started in room ${roomId}`)

  // 清除該房間之前的計時器（如果有）
  if (roomTimers.has(roomId)) {
    clearInterval(roomTimers.get(roomId)!)
    roomTimers.delete(roomId)
  }

  // 倒數計時 10 秒
  let timeRemaining = 10
  // 先發送初始時間
  io.to(roomId).emit('time_update', { timeRemaining })

  const timerInterval = setInterval(() => {
    timeRemaining--

    if (timeRemaining < 0) {
      clearInterval(timerInterval)
      roomTimers.delete(roomId)
      // 時間到，顯示結果（檢查是否已顯示）
      if (!roomResultShown.get(roomId)) {
        showQuestionResult(io, roomId, game, roomManager)
      }
    } else {
      io.to(roomId).emit('time_update', { timeRemaining })
    }
  }, 1000)

  // 儲存計時器引用
  roomTimers.set(roomId, timerInterval)
}

function showQuestionResult(io: Server, roomId: string, game: any, roomManager: RoomManager) {
  // 標記結果已顯示，防止重複顯示
  roomResultShown.set(roomId, true)

  const currentQuestion = game.getCurrentQuestion()
  const results = game.calculateResults()

  io.to(roomId).emit('question_result', {
    result: {
      correctAnswer: currentQuestion.correctAnswer,
      scoreboard: results
    }
  })

  console.log(`Question result shown in room ${roomId}`)

  // 5 秒倒數後進入下一題或結束遊戲
  let nextQuestionCountdown = 5
  const nextQuestionInterval = setInterval(() => {
    io.to(roomId).emit('next_question_countdown', { count: nextQuestionCountdown })
    nextQuestionCountdown--

    if (nextQuestionCountdown < 0) {
      clearInterval(nextQuestionInterval)
      if (game.isGameEnded()) {
        endGame(io, roomId, game)
      } else {
        startNextQuestion(io, roomId, game, roomManager)
      }
    }
  }, 1000)
}

function endGame(io: Server, roomId: string, game: any) {
  const finalScoreboard = game.getFinalScoreboard()

  io.to(roomId).emit('game_ended', {
    finalScoreboard
  })

  console.log(`Game ended in room ${roomId}`)
}
