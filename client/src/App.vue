<template>
  <div id="app">
    <component :is="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from './stores/game'
import { useSocket } from './composables/useSocket'
import Home from './components/Home.vue'
import Lobby from './components/Lobby.vue'
import Countdown from './components/Countdown.vue'
import Question from './components/Question.vue'
import Result from './components/Result.vue'
import FinalScoreboard from './components/FinalScoreboard.vue'

const gameStore = useGameStore()

// 在 App 層級初始化 Socket 連線，避免組件切換時斷線
const { connect } = useSocket()
connect()

const currentComponent = computed(() => {
  // 根據遊戲狀態顯示不同元件
  if (!gameStore.roomId) {
    return Home
  }

  switch (gameStore.status) {
    case 'waiting':
      return Lobby
    case 'countdown':
      return Countdown
    case 'question':
      return Question
    case 'result':
      return Result
    case 'ended':
      return FinalScoreboard
    default:
      return Home
  }
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
