import { Player } from './Player'
import { Game } from './Game'
import type { GameSettings } from '../types/game.types'

export class Room {
  id: string
  hostId: string
  players: Map<string, Player>
  game: Game | null
  maxPlayers: number
  createdAt: number

  constructor(id: string, hostId: string) {
    this.id = id
    this.hostId = hostId
    this.players = new Map()
    this.game = null
    this.maxPlayers = 8
    this.createdAt = Date.now()
  }

  addPlayer(playerId: string, playerName: string): Player | null {
    if (this.players.size >= this.maxPlayers) {
      return null
    }

    if (this.players.has(playerId)) {
      return null
    }

    const isHost = playerId === this.hostId
    const player = new Player(playerId, playerName, isHost)
    this.players.set(playerId, player)
    return player
  }

  removePlayer(playerId: string): boolean {
    const removed = this.players.delete(playerId)

    // 如果房主離開，指派新房主
    if (removed && playerId === this.hostId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0]
      this.hostId = newHost.id
      newHost.isHost = true
    }

    return removed
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId)
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  isEmpty(): boolean {
    return this.players.size === 0
  }

  isFull(): boolean {
    return this.players.size >= this.maxPlayers
  }

  startGame(settings: GameSettings): Game {
    this.game = new Game(this.id, settings)

    // 將房間的玩家加入遊戲
    this.players.forEach(player => {
      if (this.game) {
        this.game.addPlayer(player)
      }
    })

    this.game.startGame()
    return this.game
  }

  getGame(): Game | null {
    return this.game
  }

  toJSON() {
    return {
      id: this.id,
      hostId: this.hostId,
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      hasGame: this.game !== null
    }
  }
}
