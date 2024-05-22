<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import store from "@/stores";
// import playlists from "@/api/spotify/playlists";

const { VITE_NODE_EXPRESS_URI } = import.meta.env;
const name = ref("");
const description = ref("");
const playlistStore = store.usePlaylistStore();
const tokenStore = store.useTokenStore();

const clearForm = () => {
  name.value = "";
  description.value = "";
};
const selected = ref({ genre: "", travelPurpose: "", artists: "", era: "" });
const selects = ["genre", "travelPurpose", "era"];
const options = ref([
  [
    { text: "팝", value: "pop" },
    { text: "록", value: "rock" },
    { text: "힙합", value: "hip-hop" },
    { text: "클래식", value: "classical" },
    { text: "재즈", value: "jazz" },
    { text: "인디", value: "indie" },
  ],
  [
    { text: "휴양", value: "leisure" },
    { text: "관광", value: "sightseeing" },
    { text: "업무", value: "work" },
    { text: "액티비티", value: "activities" },
  ],
  [
    { text: "1980년대", value: "1980" },
    { text: " 2000년대 이전", value: "pre-2000s" },
    { text: "2000년 초", value: "early 2000s" },
    { text: "2020년대", value: "2020s" },
  ],
]);

// const validate = () => {
//   let valid = true;
//   if (!name.value) {
//     store.addNotification({
//       type: "error",
//       message: "You must give your playlist a name.",
//       duration: 3000,
//     });
//     return false;
//   }
//   return valid;
// };
const create = async () => {
  // if (validate()) {
  try {
    await playlistStore.createPlaylist(name.value, description.value, selected.value);
    await playlistStore.setHashTag(selected.value);
    await playlistStore.getPlaylist();
    clearForm();
  } catch (e) {
    console.log(e);
  }
  // }
};
onMounted(() => {});
</script>

<template>
  <div>
    <button
      size="md"
      id="btn-save"
      class="btn btn-outline-primary bg-light"
      data-bs-toggle="modal"
      data-bs-target="#creatPLModal"
      style="width: auto"
    >
      기깔난 플리 만들기
    </button>

    <template class="modal fade" id="creatPLModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-dark">
          <div class="modal-body">
            <span class="nav-link active" aria-current="page" href="#"
              >노래 추천이 필요하다면 해쉬 태그를 설정해 주세요</span
            >
            <div class="col">
              <!-- {{ selected }} -->
              <select
                class="form-select form-select-sm"
                aria-label=".form-select-sm "
                v-for="(select, index) in selects"
                v-model="selected[select]"
                :key="select"
              >
                <option v-for="option in options[index]" :value="option.value" :key="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <form class="form-floating mb-3">
              <input
                type="name"
                class="form-control"
                id="floatingInput"
                placeholder="playlist Name"
                v-model="name"
                required
              />
              <label for="playlistName">playlist name</label>
              <div class="form-floating">
                <textarea
                  class="form-control"
                  placeholder="Leave a comment here"
                  id="playlist Description"
                  v-model="description"
                ></textarea>
                <label for="playlistDescription">playlist description</label>
              </div>
            </form>
            <div class="modal-footer mt-3">
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-success me-2"
                  data-bs-dismiss="modal"
                  @click="create"
                  id="LOGIN"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style></style>
