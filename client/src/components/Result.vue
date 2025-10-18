<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
    <div class="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
      <!-- 正確答案 -->
      <div class="text-center mb-6">
        <div
          class="inline-block px-6 py-3 rounded-full text-white font-semibold text-lg mb-3"
          :class="isCorrect ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ isCorrect ? '✓ 答對了！' : '✗ 答錯了' }}
        </div>
        <p class="text-gray-700">
          正確答案：
          <span class="font-bold text-green-600">
            {{ String.fromCharCode(65 + (gameStore.lastResult?.correctAnswer ?? 0)) }}.
            {{ gameStore.currentQuestion?.options[gameStore.lastResult?.correctAnswer ?? 0] }}
          </span>
        </p>
      </div>

      <!-- 得分資訊 -->
      <div v-if="myResult" class="text-center mb-6 py-4 bg-primary-50 rounded-xl">
        <div class="text-3xl font-bold text-primary-700 mb-1">
          +{{ myResult.earnedPoints }} 分
        </div>
        <div v-if="myResult.currentStreak > 0" class="text-lg font-semibold text-orange-600 animate-bounce">
          🔥 連勝 ×{{ myResult.currentStreak }}!
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">目前排名</h3>
        <div class="space-y-2">
          <div
            v-for="(player, index) in gameStore.lastResult?.scoreboard"
            :key="player.playerId"
            class="flex items-center gap-3 p-4 rounded-xl transition-all"
            :class="[
              player.playerId === gameStore.playerId ? 'bg-primary-100 border-2 border-primary-500' : 'bg-white',
              index === 0 ? 'shadow-lg' : 'shadow'
            ]"
          >
            <!-- 排名 -->
            <div class="text-2xl font-bold w-12 text-center">
              <span v-if="index === 0">🥇</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
              <span v-else class="text-gray-600">{{ index + 1 }}</span>
            </div>

            <!-- 玩家名稱 -->
            <div class="flex-1">
              <div class="font-semibold text-gray-800">{{ player.playerName }}</div>
              <div v-if="player.currentStreak > 0" class="text-sm text-orange-600">
                🔥 ×{{ player.currentStreak }}
              </div>
            </div>

            <!-- 本題得分 -->
            <div class="text-right">
              <div
                class="font-bold text-lg"
                :class="player.isCorrect ? 'text-green-600' : 'text-gray-400'"
              >
                {{ player.isCorrect ? `+${player.earnedPoints}` : '0' }}
              </div>
            </div>

            <!-- 總分 -->
            <div class="text-right min-w-[80px]">
              <div class="text-sm text-gray-500">總分</div>
              <div class="font-bold text-xl text-primary-700">{{ player.score }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下一題倒數 -->
      <div class="text-center">
        <div v-if="gameStore.nextQuestionCountdown > 0" class="text-6xl font-bold text-primary-600 animate-pulse">
          {{ gameStore.nextQuestionCountdown }}
        </div>
        <p class="text-gray-600 mt-2">準備下一題...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

const myResult = computed(() => {
  return gameStore.lastResult?.scoreboard.find(s => s.playerId === gameStore.playerId)
})

const isCorrect = computed(() => {
  return myResult.value?.isCorrect ?? false
})
</script>
