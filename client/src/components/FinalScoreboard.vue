<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
    <div class="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
      <!-- 標題 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-700 mb-2">🎉 遊戲結束！</h1>
        <p class="text-gray-600">恭喜所有玩家！</p>
      </div>

      <!-- 前三名 -->
      <div class="mb-8">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <!-- 第二名 -->
          <div v-if="topThree[1]" class="text-center order-1">
            <div class="text-6xl mb-2">🥈</div>
            <div class="font-bold text-gray-800">{{ topThree[1].name }}</div>
            <div class="text-2xl font-bold text-primary-600">{{ topThree[1].score }}</div>
          </div>

          <!-- 第一名 -->
          <div v-if="topThree[0]" class="text-center order-2 transform scale-110">
            <div class="text-8xl mb-2">🥇</div>
            <div class="font-bold text-gray-800 text-lg">{{ topThree[0].name }}</div>
            <div class="text-3xl font-bold text-yellow-600">{{ topThree[0].score }}</div>
          </div>

          <!-- 第三名 -->
          <div v-if="topThree[2]" class="text-center order-3">
            <div class="text-6xl mb-2">🥉</div>
            <div class="font-bold text-gray-800">{{ topThree[2].name }}</div>
            <div class="text-2xl font-bold text-primary-600">{{ topThree[2].score }}</div>
          </div>
        </div>
      </div>

      <!-- 完整排行榜 -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">完整排行榜</h3>
        <div class="space-y-2">
          <div
            v-for="(player, index) in allPlayers"
            :key="player.id"
            class="flex items-center gap-3 p-4 rounded-xl"
            :class="player.id === gameStore.playerId
              ? 'bg-primary-100 border-2 border-primary-500'
              : 'bg-white'"
          >
            <div class="text-xl font-bold w-10 text-center text-gray-600">
              {{ index + 1 }}.
            </div>
            <div class="flex-1 font-semibold text-gray-800">
              {{ player.name }}
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">總分</div>
              <div class="text-xl font-bold text-primary-700">{{ player.score }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 個人統計 -->
      <div v-if="myStats" class="mb-6 p-4 bg-primary-50 rounded-xl">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">你的成績</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-sm text-gray-600">排名</div>
            <div class="text-2xl font-bold text-primary-700">第 {{ myRank }} 名</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-600">總得分</div>
            <div class="text-2xl font-bold text-primary-700">{{ myStats.score }}</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-600">答對題數</div>
            <div class="text-2xl font-bold text-green-600">{{ correctCount }}/5</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-600">正確率</div>
            <div class="text-2xl font-bold text-green-600">{{ accuracy }}%</div>
          </div>
        </div>
      </div>

      <!-- 按鈕 -->
      <div class="space-y-3">
        <button
          @click="handlePlayAgain"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
        >
          再來一局
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
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { useSocket } from '../composables/useSocket'

const gameStore = useGameStore()
const { leaveRoom } = useSocket()

const allPlayers = computed(() => {
  return gameStore.sortedPlayers
})

const topThree = computed(() => {
  return allPlayers.value.slice(0, 3)
})

const myStats = computed(() => {
  return allPlayers.value.find(p => p.id === gameStore.playerId)
})

const myRank = computed(() => {
  return allPlayers.value.findIndex(p => p.id === gameStore.playerId) + 1
})

// 這裡需要額外追蹤答對題數，暫時簡化計算
const correctCount = computed(() => {
  // 根據連勝數估算 (實際應該追蹤每題的答題記錄)
  const score = myStats.value?.score ?? 0
  return Math.round(score / 150) // 簡化估算
})

const accuracy = computed(() => {
  return Math.round((correctCount.value / 5) * 100)
})

const handlePlayAgain = () => {
  // 重置遊戲狀態回到等候室
  gameStore.setGameStatus('waiting')
}

const handleLeaveRoom = () => {
  leaveRoom()
}
</script>
