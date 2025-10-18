import { Server, Socket } from 'socket.io'
import { RoomManager } from '../../game/RoomManager'
import type { GameSettings } from '../../types/game.types'

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

      // 檢查玩家數量
      if (room.getAllPlayers().length < 2) {
        socket.emit('error', { message: '至少需要 2 位玩家' })
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
        // 所有玩家都作答了，立即顯示結果
        showQuestionResult(io, roomId, game, roomManager)
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

  // 倒數計時 10 秒
  let timeRemaining = 10
  const timerInterval = setInterval(() => {
    io.to(roomId).emit('time_update', { timeRemaining })
    timeRemaining--

    if (timeRemaining < 0) {
      clearInterval(timerInterval)
      // 時間到，顯示結果
      showQuestionResult(io, roomId, game, roomManager)
    }
  }, 1000)
}

function showQuestionResult(io: Server, roomId: string, game: any, roomManager: RoomManager) {
  const currentQuestion = game.getCurrentQuestion()
  const results = game.calculateResults()

  io.to(roomId).emit('question_result', {
    result: {
      correctAnswer: currentQuestion.correctAnswer,
      scoreboard: results
    }
  })

  console.log(`Question result shown in room ${roomId}`)

  // 5 秒後進入下一題或結束遊戲
  setTimeout(() => {
    if (game.isGameEnded()) {
      endGame(io, roomId, game)
    } else {
      startNextQuestion(io, roomId, game, roomManager)
    }
  }, 5000)
}

function endGame(io: Server, roomId: string, game: any) {
  const finalScoreboard = game.getFinalScoreboard()

  io.to(roomId).emit('game_ended', {
    finalScoreboard
  })

  console.log(`Game ended in room ${roomId}`)
}
