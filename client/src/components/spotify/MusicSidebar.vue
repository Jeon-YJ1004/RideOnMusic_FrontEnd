<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import draggable from "vuedraggable";
import store from "@/stores";
import Playlist from "@/components/spotify/Playlist.vue";
import Login from "@/components/spotify/Login.vue";
import PlaylistCreateModal from "@/components/spotify/modal/PlaylistCreateModal.vue";
import SearchModal from "@/components/spotify/modal/SearchModal.vue";
const tokenStore = store.useTokenStore();
const playlistStore = store.usePlaylistStore();
const { accessToken, code } = storeToRefs(tokenStore);
const { playlist, hasPlaylist } = storeToRefs(playlistStore);
const search = ref("");
const savePlayList = () => {
  playlistStore.savePlaylist();
  // console.log(response);
  alert("저장되었습니다. 잊지 말고 플랜 저장을 해주세요!");
  // else alert("저장에 실패했습니다.");
};
const removeableList = ref([{ id: 1 }]);
const log = () => {
  console.log(removeableList.value);
  removeableList.value = [{ id: 1 }];
};
onMounted(() => {
  let codeParam = new URLSearchParams(window.location.search).get("code");
  if (!accessToken.value && codeParam) {
    code.value = codeParam;
    tokenStore.login();
  }
});
</script>

<template>
  <div id="playlist-list-sidebar-container" class="map-btn d-none d-lg-flex">
    <div
      class="m-4"
      title="spotify sidebar"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#sidebar-playlist"
      aria-controls="sidebar-playlist"
      aria-label="Toggle navigation"
    >
      <img src="@/assets/img/spotify.png" width="30px" class="sidebarBtn" />
    </div>
    <draggable
      :group="{ name: 'tracks', put: true, pull: false, removeCloneOnHide: true }"
      :list="removeableList"
      class="willremove"
      item-key="id"
      ghost-class="willremove"
      lass="my-8 mx-12"
      @change="log"
    >
      <template #item="{ element }">
        <div
          class="offcanvas offcanvas-end"
          tabindex="-1"
          id="sidebar-playlist"
          aria-labelledby="sidebar-playlistLabel"
        >
          <div class="offcanvas-header">
            <img src="@/assets/img/road-trip.png" alt="logo" width="50" height="50" />
            <h4 class="offcanvas-title" id="sidebar-playlistLabel">우리 노래 들으며 갈까요?</h4>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div class="offcanvas-body">
            <template v-if="accessToken">
              <!-- //TODO - playlist에 해당하는 플리가 있을 경우 -->
              <template v-if="hasPlaylist">
                <div style="height: 60%">
                  <SearchModal />
                  <Playlist />
                  <button
                    size="md"
                    id="btn-save"
                    class="btn btn-outline-primary bg-light"
                    @click="savePlayList"
                  >
                    저장
                  </button>
                </div>
              </template>
              <template v-else>
                <div style="display: flex; justify-content: center">
                  <PlaylistCreateModal />
                </div>
              </template>
            </template>
            <template v-else>
              <Login />
            </template>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped lang="scss">
.map-btn:hover,
.map-btn button:hover,
.map-btn button svg:hover {
  color: rgba(0, 0, 0, 0.7);
}
.map-btn:focus,
.map-btn button:focus,
.map-btn button svg:focus {
  color: rgba(0, 0, 0, 0.7);
}
.side-header {
  letter-spacing: -2.5px;
  text-align: left;
}
:deep(.b-sidebar-body) {
  overflow-y: hidden !important;
  overflow-x: hidden;
}
:deep(.nav-tabs) {
  flex-wrap: nowrap;
  overflow-x: scroll;
}
:deep(ul.nav-tabs li a.nav-link) {
  white-space: nowrap;
}
body {
  overscroll-behavior: contain;
}
.sidebarBtn:hover {
  transition: all 0.2s linear;
  transform: scale(1.3);
}
</style>
