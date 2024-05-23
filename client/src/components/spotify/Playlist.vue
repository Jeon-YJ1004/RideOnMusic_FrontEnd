<script setup>
import { watch } from "vue";
import { storeToRefs } from "pinia";
import draggable from "vuedraggable";
import TrackItem from "@/components/spotify/item/PlaylistTrackItem.vue";
import store from "@/stores";
const trackStore = store.useTrackStore();
const playlistStore = store.usePlaylistStore();
const { savedTracks } = storeToRefs(trackStore);

watch(
  () => playlistStore.playlist.track,
  () => {
    playlistStore.getPlaylist();
  }
);
</script>

<template>
  <div id="play-list-container" class="play-list-container d-flex flex-column">
    <div class="">
      <draggable
        class="dragArea list-group"
        :list="savedTracks"
        :group="{ name: 'tracks', put: true, pull: true }"
        item-key="id"
      >
        <template #item="{ element }">
          <TrackItem :key="element.id" :track="element" searchEl="true" />
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped></style>
