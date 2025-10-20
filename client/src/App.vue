<template>
  <div id="app" :class="{ 'halloween-theme': isHalloween }">
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

const isHalloween = computed(() => {
  return gameStore.gameSettings.ageGroup === 'halloween'
})

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
  transition: background 0.5s ease;
}

/* 萬聖節主題背景 */
#app.halloween-theme {
  background: linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #4a2c6b 50%, #2d1b4e 75%, #1a0b2e 100%);
  background-size: 400% 400%;
  animation: halloween-gradient 15s ease infinite;
  position: relative;
}

#app.halloween-theme::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 140, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

#app.halloween-theme > * {
  position: relative;
  z-index: 1;
}

@keyframes halloween-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
