<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
// import VolumeBar from './VolumeBar.vue';
import CurrentTrack from './CurrentTrack.vue';
import PlayerControls from './PlayerControls.vue';
import PlayerPlayback from './PlayerPlayback.vue';
// import DevicePicker from './DevicePicker.vue';

const playerStore = usePlayerStore();
const playback = computed(() => playerStore.getPlayback);


</script>

<template>
  <div class="player">
    <div v-if="playback" class="player__inner">
      <CurrentTrack class="player__left" />
      <div class="player__center">
        <PlayerControls />
        <PlayerPlayback />
      </div>
      <div class="player__right">
        <!-- <DevicePicker /> -->
        <!-- <VolumeBar /> -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
  .player
    position: fixed
    bottom: 0
    width: 100%
    height: 90px
    z-index: 2
    background: $c-shark

    &__inner
      display: flex
      align-items: center
      height: 100%

    &__left
      width: 30%
      min-width: 180px

    &__right
      display: flex
      width: 30%
      min-width: 180px

      .device-picker
        margin: 2px 5px 0 auto

      .volume-bar
        margin: 0 15px 0 5px

    &__center
      width: 60%
</style>
