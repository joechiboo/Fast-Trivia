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
import { ref, onMounted } from 'vue'

const count = ref(3)

onMounted(() => {
  const interval = setInterval(() => {
    count.value--
    if (count.value === 0) {
      count.value = 'GO!'
      clearInterval(interval)
    }
  }, 1000)
})
</script>
