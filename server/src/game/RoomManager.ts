import { Room } from './Room'

export class RoomManager {
  private rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map()
  }

  generateRoomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let roomId = ''

    do {
      roomId = ''
      for (let i = 0; i < 6; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length))
      }
    } while (this.rooms.has(roomId))

    return roomId
  }

  createRoom(hostId: string): Room {
    const roomId = this.generateRoomId()
    const room = new Room(roomId, hostId)
    this.rooms.set(roomId, room)
    return room
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId)
  }

  cleanupEmptyRooms(): void {
    this.rooms.forEach((room, roomId) => {
      if (room.isEmpty()) {
        this.deleteRoom(roomId)
      }
    })
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }
}
