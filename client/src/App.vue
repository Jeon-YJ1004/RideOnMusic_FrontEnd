<script setup>
import { RouterLink, RouterView } from "vue-router";
import VHeader from "./components/common/VHeader.vue";
</script>

<template>
  <div style="overflow: hidden;">
    <VHeader />
    <div>
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
@import "/src/assets/css/common.css";
</style>
