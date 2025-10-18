<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <!-- 房間代碼 -->
      <div class="text-center mb-6">
        <p class="text-gray-600 text-sm mb-2">房間代碼</p>
        <div class="flex items-center justify-center gap-2">
          <p class="text-4xl font-bold text-primary-700 tracking-wider">{{ gameStore.roomId }}</p>
          <button
            @click="copyRoomCode"
            class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
          >
            {{ copied ? '✓ 已複製' : '複製' }}
          </button>
        </div>
      </div>

      <!-- 玩家列表 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold text-gray-800">玩家列表</h2>
          <span class="text-sm text-gray-500">({{ gameStore.players.length }}/8)</span>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="player in gameStore.players"
            :key="player.id"
            class="flex items-center gap-3 bg-white rounded-lg p-3 border-2"
            :class="player.id === gameStore.playerId ? 'border-primary-500' : 'border-gray-200'"
          >
            <span class="text-2xl">{{ player.isHost ? '👑' : '😊' }}</span>
            <span class="font-medium text-gray-800">{{ player.name }}</span>
            <span v-if="player.id === gameStore.playerId" class="ml-auto text-sm text-primary-600">(你)</span>
          </div>
        </div>
      </div>

      <!-- 遊戲設定 (房主才能看到) -->
      <div v-if="gameStore.isHost" class="mb-6 space-y-4">
        <!-- 題目分類 -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">選擇題目分類</h3>
          <div class="space-y-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all"
              :class="selectedCategory === cat.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="text-2xl">{{ cat.emoji }}</span>
              <span class="font-medium text-gray-800">{{ cat.label }}</span>
              <span v-if="selectedCategory === cat.value" class="ml-auto text-primary-600">✓</span>
            </button>
          </div>
        </div>

        <!-- 難度選擇 -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">選擇難度</h3>
          <div class="space-y-2">
            <button
              v-for="level in ageLevels"
              :key="level.value"
              @click="selectedAgeGroup = level.value"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all"
              :class="selectedAgeGroup === level.value
                ? 'border-secondary-500 bg-secondary-50'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="text-2xl">{{ level.emoji }}</span>
              <span class="font-medium text-gray-800">{{ level.label }}</span>
              <span v-if="selectedAgeGroup === level.value" class="ml-auto text-secondary-600">✓</span>
            </button>
          </div>
        </div>

        <p class="text-center text-gray-500 text-sm">共 5 題</p>
      </div>

      <!-- 等待提示 (非房主) -->
      <div v-else class="mb-6 text-center py-8">
        <div class="animate-pulse">
          <p class="text-gray-600">等待房主開始遊戲...</p>
        </div>
      </div>

      <!-- 按鈕 -->
      <div class="space-y-3">
        <button
          v-if="gameStore.isHost"
          @click="handleStartGame"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
        >
          開始遊戲 {{ gameStore.players.length === 1 ? '(單人練習)' : `(${gameStore.players.length} 人)` }}
        </button>

        <button
          @click="handleLeaveRoom"
          class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all text-lg"
        >
          離開房間
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/game'
import { useSocket } from '../composables/useSocket'
import type { Category, AgeGroup } from '../types/game.types'

const gameStore = useGameStore()
const { startGame, leaveRoom } = useSocket()

const selectedCategory = ref<Category>('mixed')
const selectedAgeGroup = ref<AgeGroup>('preschool')
const copied = ref(false)

const categories = [
  { value: 'chinese' as Category, label: '國語', emoji: '📖' },
  { value: 'english' as Category, label: '英文', emoji: '🔤' },
  { value: 'math' as Category, label: '數學', emoji: '🔢' },
  { value: 'general' as Category, label: '常識', emoji: '🌍' },
  { value: 'mixed' as Category, label: '綜合', emoji: '🎯' },
]

const ageLevels = [
  { value: 'preschool' as AgeGroup, label: '幼稚園中班 (4-6歲)', emoji: '🧸' },
  { value: 'grade1' as AgeGroup, label: '小學一年級 (7歲)', emoji: '📚' },
  { value: 'grade4' as AgeGroup, label: '小學四年級 (10歲)', emoji: '🎓' },
]

const copyRoomCode = async () => {
  try {
    await navigator.clipboard.writeText(gameStore.roomId)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleStartGame = () => {
  startGame({
    category: selectedCategory.value,
    questionCount: 5,
    ageGroup: selectedAgeGroup.value
  })
}

const handleLeaveRoom = () => {
  leaveRoom()
}
</script>
