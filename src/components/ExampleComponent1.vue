<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="data in datas" :key="data.id" @click="increment">
        {{ data.id }} - {{ data.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { People, Meta } from './models'

interface Props {
  title: string
  datas?: People[]
  meta: Meta
  active: boolean
}

const props = withDefaults(defineProps<Props>(), {
  datas: () => [],
})

const clickCount = ref(0)
function increment() {
  clickCount.value += 1
  return clickCount.value
}

const todoCount = computed(() => props.datas.length)
</script>
