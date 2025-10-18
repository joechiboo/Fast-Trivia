<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4">
    <div class="text-center">
      <div class="text-9xl font-bold text-white animate-bounce mb-4">
        {{ count }}
      </div>
      <p class="text-2xl text-white font-semibold">準備開始...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()
const count = ref<number | string>(3)

// 監聽後端的倒數事件，與後端同步
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // 如果後端有發送 countdown 事件，會透過 store 更新
  // 否則使用本地倒數作為備案
  let hasReceivedServerCountdown = false

  const checkTimeout = setTimeout(() => {
    if (!hasReceivedServerCountdown) {
      // 如果 100ms 內沒收到後端倒數，使用本地倒數
      startLocalCountdown()
    }
  }, 100)

  // 簡單的本地倒數備案
  const startLocalCountdown = () => {
    const interval = setInterval(() => {
      if (typeof count.value === 'number') {
        count.value--
        if (count.value === 0) {
          count.value = 'GO!'
          clearInterval(interval)
        }
      }
    }, 1000)

    unsubscribe = () => clearInterval(interval)
  }

  return () => {
    clearTimeout(checkTimeout)
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
