<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
    <div class="max-w-2xl w-full">
      <!-- 題目卡片 -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 mb-4">
        <!-- 進度與時間 -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-semibold text-gray-700">
            題目 {{ gameStore.currentQuestionIndex + 1 }}/{{ gameStore.totalQuestions }}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-2xl">⏱</span>
            <span
              class="text-2xl font-bold"
              :class="timeColor"
            >
              {{ gameStore.timeRemaining }}s
            </span>
          </div>
        </div>

        <!-- 進度條 -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            class="h-2 rounded-full transition-all duration-1000"
            :class="progressColor"
            :style="{ width: `${(gameStore.timeRemaining / 10) * 100}%` }"
          ></div>
        </div>

        <!-- 題目 -->
        <div class="mb-6">
          <p class="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
            {{ gameStore.currentQuestion?.question }}
          </p>
        </div>

        <!-- 選項 -->
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(option, index) in gameStore.currentQuestion?.options"
            :key="index"
            @click="handleSelectAnswer(index)"
            :disabled="gameStore.selectedAnswer !== null"
            class="w-full text-left px-5 py-4 rounded-xl border-2 transition-all transform text-lg font-medium"
            :class="getOptionClass(index)"
          >
            <span class="font-bold mr-3">{{ String.fromCharCode(65 + index) }}.</span>
            {{ option }}
          </button>
        </div>

        <!-- 已選擇提示 -->
        <div v-if="gameStore.selectedAnswer !== null" class="mt-4 text-center">
          <p class="text-gray-600 animate-pulse">等待其他玩家...</p>
        </div>
      </div>

      <!-- 即時排行榜 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🏆</span>
          <span>目前排名</span>
        </h3>
        <div class="space-y-2">
          <div
            v-for="(player, index) in topPlayers"
            :key="player.id"
            class="flex items-center gap-3 bg-white rounded-lg px-3 py-2"
          >
            <span class="text-lg font-bold w-6">{{ index + 1 }}.</span>
            <span class="font-medium text-gray-800 flex-1">{{ player.name }}</span>
            <span class="font-bold text-primary-600">{{ player.score }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { useSocket } from '../composables/useSocket'

const gameStore = useGameStore()
const { submitAnswer } = useSocket()

const timeColor = computed(() => {
  if (gameStore.timeRemaining > 5) return 'text-green-600'
  if (gameStore.timeRemaining > 2) return 'text-yellow-600'
  return 'text-red-600'
})

const progressColor = computed(() => {
  if (gameStore.timeRemaining > 5) return 'bg-green-500'
  if (gameStore.timeRemaining > 2) return 'bg-yellow-500'
  return 'bg-red-500'
})

const topPlayers = computed(() => {
  return gameStore.sortedPlayers.slice(0, 3)
})

const getOptionClass = (index: number) => {
  const isSelected = gameStore.selectedAnswer === index
  const isDisabled = gameStore.selectedAnswer !== null

  if (isSelected) {
    return 'bg-primary-600 text-white border-primary-600 scale-105'
  }
  if (isDisabled) {
    return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
  }
  return 'bg-white border-gray-300 hover:border-primary-500 hover:bg-primary-50 active:scale-95'
}

const handleSelectAnswer = (index: number) => {
  if (gameStore.selectedAnswer === null) {
    submitAnswer(index)
  }
}
</script>
