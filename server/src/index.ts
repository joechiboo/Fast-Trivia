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

// CORS 設定 - 開發環境接受所有 localhost
const isDevelopment = process.env.NODE_ENV !== 'production'
const allowedOrigins: string[] = [
  'https://joechiboo.github.io',
  process.env.CLIENT_URL
].filter((origin): origin is string => Boolean(origin))

const corsOptions = {
  origin: isDevelopment
    ? /^http:\/\/localhost:\d+$/ // 開發環境：接受任何 localhost port
    : allowedOrigins, // 生產環境：允許 GitHub Pages 和自訂網址
  credentials: true
}

app.use(cors(corsOptions))

// Socket.IO 設定
const io = new Server(httpServer, {
  cors: corsOptions
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

// 取得所有開放房間列表
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getAllRooms()
    .filter(room => room.game.status === 'waiting') // 只顯示等待中的房間
    .map(room => ({
      roomId: room.roomId,
      playerCount: room.game.getAllPlayers().length,
      hostName: room.game.getAllPlayers().find(p => p.isHost)?.name || 'Unknown'
    }))
  res.json({ rooms })
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
