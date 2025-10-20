<template>
  <div id="app" :class="{ 'halloween-theme': isHalloween }">
    <div v-if="isHalloween" class="halloween-decorations">
      <div class="pumpkin pumpkin-1">🎃</div>
      <div class="pumpkin pumpkin-2">🎃</div>
      <div class="pumpkin pumpkin-3">🎃</div>
      <div class="ghost ghost-1">👻</div>
      <div class="ghost ghost-2">👻</div>
      <div class="bat bat-1">🦇</div>
      <div class="bat bat-2">🦇</div>
      <div class="bat bat-3">🦇</div>
      <div class="candy candy-1">🍬</div>
      <div class="candy candy-2">🍬</div>
      <div class="candy candy-3">🍬</div>
      <div class="candy candy-4">🍬</div>
    </div>
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

/* 萬聖節裝飾元素 */
.halloween-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.pumpkin, .ghost, .bat, .candy {
  position: absolute;
  font-size: 2rem;
  opacity: 0.7;
}

/* 南瓜掉落動畫 */
.pumpkin {
  animation: fall-rotate 8s linear infinite;
}

.pumpkin-1 {
  left: 10%;
  animation-delay: 0s;
  animation-duration: 10s;
}

.pumpkin-2 {
  left: 50%;
  animation-delay: 3s;
  animation-duration: 12s;
}

.pumpkin-3 {
  left: 80%;
  animation-delay: 6s;
  animation-duration: 11s;
}

/* 幽靈飄動動畫 */
.ghost {
  animation: float-wave 6s ease-in-out infinite;
}

.ghost-1 {
  left: 20%;
  animation-delay: 0s;
}

.ghost-2 {
  left: 70%;
  animation-delay: 3s;
}

/* 蝙蝠飛行動畫 */
.bat {
  animation: bat-fly 8s ease-in-out infinite;
  font-size: 1.5rem;
}

.bat-1 {
  top: 20%;
  animation-delay: 0s;
}

.bat-2 {
  top: 40%;
  animation-delay: 2s;
}

.bat-3 {
  top: 60%;
  animation-delay: 4s;
}

/* 糖果掉落動畫 */
.candy {
  animation: fall-spin 7s linear infinite;
  font-size: 1.2rem;
}

.candy-1 {
  left: 15%;
  animation-delay: 1s;
}

.candy-2 {
  left: 35%;
  animation-delay: 3s;
}

.candy-3 {
  left: 65%;
  animation-delay: 5s;
}

.candy-4 {
  left: 85%;
  animation-delay: 7s;
}

/* 掉落旋轉動畫 */
@keyframes fall-rotate {
  0% {
    top: -10%;
    transform: rotate(0deg);
  }
  100% {
    top: 110%;
    transform: rotate(360deg);
  }
}

/* 掉落自旋動畫 */
@keyframes fall-spin {
  0% {
    top: -10%;
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    top: 110%;
    transform: rotate(360deg) scale(1);
  }
}

/* 飄動波浪動畫 */
@keyframes float-wave {
  0% {
    top: -10%;
    transform: translateX(0);
  }
  25% {
    transform: translateX(20px);
  }
  50% {
    top: 50%;
    transform: translateX(0);
  }
  75% {
    transform: translateX(-20px);
  }
  100% {
    top: 110%;
    transform: translateX(0);
  }
}

/* 蝙蝠飛行動畫 */
@keyframes bat-fly {
  0% {
    left: -10%;
    transform: translateY(0) scaleX(1);
  }
  25% {
    transform: translateY(-30px) scaleX(1);
  }
  50% {
    left: 110%;
    transform: translateY(0) scaleX(-1);
  }
  75% {
    transform: translateY(30px) scaleX(-1);
  }
  100% {
    left: -10%;
    transform: translateY(0) scaleX(1);
  }
}
</style>
