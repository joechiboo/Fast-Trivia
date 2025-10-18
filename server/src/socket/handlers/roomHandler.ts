import { Server, Socket } from 'socket.io'
import { RoomManager } from '../../game/RoomManager'

export function handleRoomEvents(io: Server, socket: Socket, roomManager: RoomManager) {
  // 創建房間
  socket.on('create_room', ({ playerName }: { playerName: string }) => {
    try {
      const room = roomManager.createRoom(socket.id)
      const player = room.addPlayer(socket.id, playerName)

      if (!player) {
        socket.emit('error', { message: '無法創建房間' })
        return
      }

      // 加入 Socket.IO 房間
      socket.join(room.id)

      socket.emit('room_created', {
        roomId: room.id,
        playerId: socket.id,
        playerName: player.name
      })

      socket.emit('player_joined', {
        players: room.getAllPlayers().map(p => p.toJSON())
      })

      console.log(`Room ${room.id} created by ${playerName}`)
    } catch (error) {
      console.error('Error creating room:', error)
      socket.emit('error', { message: '創建房間失敗' })
    }
  })

  // 加入房間
  socket.on('join_room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    try {
      const room = roomManager.getRoom(roomId)

      if (!room) {
        socket.emit('error', { message: '房間不存在' })
        return
      }

      if (room.isFull()) {
        socket.emit('error', { message: '房間已滿' })
        return
      }

      const player = room.addPlayer(socket.id, playerName)

      if (!player) {
        socket.emit('error', { message: '無法加入房間' })
        return
      }

      // 加入 Socket.IO 房間
      socket.join(roomId)

      socket.emit('room_joined', {
        roomId: room.id,
        playerId: socket.id,
        players: room.getAllPlayers().map(p => p.toJSON())
      })

      // 通知其他玩家
      socket.to(roomId).emit('player_joined', {
        players: room.getAllPlayers().map(p => p.toJSON())
      })

      console.log(`${playerName} joined room ${roomId}`)
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: '加入房間失敗' })
    }
  })

  // 離開房間
  socket.on('leave_room', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
    try {
      const room = roomManager.getRoom(roomId)

      if (!room) {
        return
      }

      room.removePlayer(playerId)
      socket.leave(roomId)

      if (room.isEmpty()) {
        roomManager.deleteRoom(roomId)
        console.log(`Room ${roomId} deleted (empty)`)
      } else {
        // 通知其他玩家
        io.to(roomId).emit('player_left', {
          players: room.getAllPlayers().map(p => p.toJSON())
        })
      }

      console.log(`Player ${playerId} left room ${roomId}`)
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  })

  // 斷線處理
  socket.on('disconnect', () => {
    // 從所有房間中移除此玩家
    roomManager.getAllRooms().forEach(room => {
      if (room.getPlayer(socket.id)) {
        room.removePlayer(socket.id)

        if (room.isEmpty()) {
          roomManager.deleteRoom(room.id)
          console.log(`Room ${room.id} deleted (empty after disconnect)`)
        } else {
          io.to(room.id).emit('player_left', {
            players: room.getAllPlayers().map(p => p.toJSON())
          })
        }
      }
    })

    console.log(`Player ${socket.id} disconnected`)
  })
}
