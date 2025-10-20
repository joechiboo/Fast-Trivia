<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-700 mb-2">Fast Trivia 🎯</h1>
        <p class="text-gray-600">快速問答競賽</p>
      </div>

      <div class="space-y-4">
        <input
          ref="nameInput"
          v-model="playerName"
          type="text"
          placeholder="輸入你的暱稱"
          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-lg"
          maxlength="12"
          @keyup.enter="handleCreateRoom"
        />

        <button
          @click="handleCreateRoom"
          :disabled="!playerName.trim()"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:transform-none text-lg"
        >
          創建房間
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">或</span>
          </div>
        </div>

        <!-- 房間列表選擇 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-gray-700">選擇房間</label>
            <button
              @click="fetchRooms"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              🔄 重新整理
            </button>
          </div>
          <select
            v-model="selectedRoomId"
            @change="onRoomSelect"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-lg"
            :disabled="availableRooms.length === 0"
          >
            <option value="">{{ availableRooms.length === 0 ? '-- 目前沒有可用房間 --' : '-- 選擇現有房間 --' }}</option>
            <option v-for="room in availableRooms" :key="room.roomId" :value="room.roomId">
              {{ room.roomId }} ({{ room.hostName }}, {{ room.playerCount }} 人)
            </option>
          </select>
        </div>

        <!-- 手動輸入房間代碼 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">或手動輸入</label>
          <input
            v-model="roomCode"
            type="text"
            placeholder="輸入房間代碼"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-lg uppercase"
            maxlength="6"
            @keyup.enter="handleJoinRoom"
          />
        </div>

        <button
          @click="handleJoinRoom"
          :disabled="!playerName.trim() || !roomCode.trim()"
          class="w-full bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:transform-none text-lg"
        >
          加入房間
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocket } from '../composables/useSocket'
import { useGameStore } from '../stores/game'

interface Room {
  roomId: string
  playerCount: number
  hostName: string
}

const playerName = ref('')
const roomCode = ref('')
const selectedRoomId = ref('')
const availableRooms = ref<Room[]>([])
const nameInput = ref<HTMLInputElement | null>(null)

const { createRoom, joinRoom } = useSocket()
const gameStore = useGameStore()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const fetchRooms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/rooms`)
    const data = await response.json()
    availableRooms.value = data.rooms || []
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    availableRooms.value = []
  }
}

const onRoomSelect = () => {
  if (selectedRoomId.value) {
    roomCode.value = selectedRoomId.value
  }
}

onMounted(() => {
  // 自動 focus 在暱稱欄位
  nameInput.value?.focus()
  // 載入房間列表
  fetchRooms()
  // 每 5 秒更新房間列表
  setInterval(fetchRooms, 5000)
})

const handleCreateRoom = () => {
  if (playerName.value.trim()) {
    gameStore.setPlayer('', playerName.value)
    createRoom(playerName.value)
  }
}

const handleJoinRoom = () => {
  if (playerName.value.trim() && roomCode.value.trim()) {
    gameStore.setPlayer('', playerName.value)
    joinRoom(roomCode.value.toUpperCase(), playerName.value)
  }
}
</script>
