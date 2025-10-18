import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { RoomManager } from './game/RoomManager'
import { handleRoomEvents } from './socket/handlers/roomHandler'
import { handleGameEvents } from './socket/handlers/gameHandler'

const app = express()
const httpServer = createServer(app)

// CORS 設定
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// Socket.IO 設定
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
})

// 房間管理器
const roomManager = new RoomManager()

// Socket.IO 連線處理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // 註冊事件處理器
  handleRoomEvents(io, socket, roomManager)
  handleGameEvents(io, socket, roomManager)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: 'Fast Trivia Server',
    version: '1.0.0',
    status: 'running'
  })
})

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: roomManager.getAllRooms().length,
    uptime: process.uptime()
  })
})

// 定期清理空房間
setInterval(() => {
  roomManager.cleanupEmptyRooms()
}, 60000) // 每分鐘檢查一次

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`🎯 Fast Trivia Server running on port ${PORT}`)
  console.log(`📝 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
})
