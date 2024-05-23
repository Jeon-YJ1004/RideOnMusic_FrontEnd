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
        <div class="modal-content text-dark" style="height: 430px">
          <div class="modal-body registration-form">
            <h4><img src="@/assets/img/headphone.png" style="width: 35px" /> 플리 만들기</h4>

            <form class="form-floating mb-3">
              <div id="planner_body" class="registration-form">
                <div class="form-group" style="width: 300px">
                  <input
                    v-model="name"
                    type="text"
                    placeholder="플레이리스트 이름"
                    id="playlistName"
                    required
                    class="form-control item"
                  />
                </div>
                <div class="form-group" style="width: 300px">
                  <input
                    v-model="description"
                    type="text"
                    placeholder="플레이리스트 설명"
                    id="playlistDescription"
                    required
                    class="form-control item"
                  />
                </div>
              </div>
              <hr />
              <span style="font-size: 0.8rem; font-style: italic; color: #a9a9a9"
                >노래 추천이 필요하다면 해쉬 태그를 설정해 주세요</span
              >
              <div>
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: space-evenly;
                    align-items: center;
                    width: 100%;
                  "
                >
                  <div>장르</div>
                  <div>여행 목적</div>
                  <div>시대</div>
                </div>
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <select
                    class="form-control"
                    aria-label=".form-select-sm "
                    v-for="(select, index) in selects"
                    v-model="selected[select]"
                    :key="select"
                    style="margin: 5px"
                  >
                    <option
                      v-for="option in options[index]"
                      :value="option.value"
                      :key="option.value"
                    >
                      {{ option.text }}
                    </option>
                  </select>
                </div>
              </div>
            </form>
            <div class="modal-footer mt-3">
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary me-2"
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

<style>
.registration-form form {
  background-color: #fff;
  max-width: 600px;
  margin: auto;
  padding: 30px 50px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.075);
}

.registration-form .item {
  border-radius: 20px;
  margin-bottom: 10px;
  padding: 10px 10px;
  height: 40px;
}

@media (max-width: 576px) {
  .registration-form form {
    padding: 50px 20px;
  }
}
input[type="date"]::before {
  content: attr(data-placeholder);
  width: 100%;
}

input[type="date"]:focus::before,
input[type="date"]:valid::before {
  display: none;
}

label.check {
  cursor: pointer;
}
label.check input {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
}
label.check span {
  padding: 7px 16px;
  border: 2px solid #ffff;
  display: inline-block;
  color: #0d6efd;
  border-radius: 3px;
  text-transform: uppercase;
}
label.check input:checked + span {
  border-color: #0d6efd;
}
label.check span {
  border-radius: 20px;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;  
  width: 100vw;
  height: 100vh;
  background-color: #000;
  max-width:100%;
}
</style>