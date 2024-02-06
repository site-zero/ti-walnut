<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useSessionStore } from '../../'

const session = useSessionStore();

onBeforeMount(async () => {
  await session.reload()
})
</script>
<template>
  {{ session.ticket }}
  <hr>
  {{ session.me }}
</template>