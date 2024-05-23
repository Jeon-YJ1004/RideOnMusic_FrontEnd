<template>
  <div
    data-sal="slide-up"
    data-sal-duration="300"
    data-sal-delay="50"
    data-sal-easing="ease-in-out"
    id="search-sidebar-container"
    class="map-btn d-lg-flex"
  >
    <button
      title="여행지 리스트"
      style="
        background-color: white;
        border-radius: 100%;
        aspect-ratio: 1/1;
        width: 30px;
        height: 30px;
      "
      id="btn-search-sidebar"
      data-bs-toggle="offcanvas"
      data-bs-target="#sidebar-plan"
      aria-controls="sidebar-plan"
      aria-label="Toggle navigation"
    >
      <i class="bi bi-layout-sidebar-inset w-100"></i>
    </button>
    <div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="sidebar-plan"
      aria-labelledby="sidebar-planLabel"
      no-header
      shadow
    >
      <div class="px-3 py-3 h-100 d-flex flex-column offcanvas-header">
        <h2 class="">
          <img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Compass.png"
            alt="Compass"
            width="50"
            height="50"
          />
          여행 코스
        </h2>
        <hr style="width: 100%; margin-bottom: 0" />
        <!-- body 시작 -->
        <div class="offcanvas-body col">
          <div class="row justify-content-center gx-5">
            <div class="col-md-3 map_wrap">
              <form @submit.prevent="handleFormSubmit" enctype="multipart/form-data">
                <div id="menu_wrap" class="bg_white">
                  <div id="planner_body">
                    <ul>
                      <li>
                        <div class="label">플랜이름:</div>
                        <input
                          v-model="form.planTitle"
                          type="text"
                          placeholder="플랜 이름"
                          required
                        />
                      </li>
                      <li>
                        <div class="label">일정 :</div>
                        <input v-model="form.startDate" type="date" value="2024-04-05" /> -
                        <input v-model="form.endDate" type="date" value="2024-04-07" />
                      </li>
                      <li id="transport">
                        <div class="label">교통수단 :</div>
                        <div class="content ib">
                          <select v-model="form.transport">
                            <option value="public" selected>대중교통</option>
                            <option value="ownCar">자차</option>
                          </select>
                        </div>
                      </li>
                      <li>
                        <div class="label">썸네일 :</div>
                        <input
                          @change="addFile($event)"
                          ref="file"
                          type="file"
                          id="file"
                          name="file"
                        />
                      </li>
                    </ul>
                    <br />

                    <div id="buttons">
                      <button type="submit" class="btn btn-primary btn-ghost btn-open">저장</button>
                    </div>
                    <div id="area_sel"></div>
                    <SpotList ref="planlist" :form="form" @init-form="setInitForm" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref, watch, defineExpose } from "vue";
import { useRouter } from "vue-router";
import { socket } from "@/services/ChatService.js";
import { storeToRefs } from "pinia";

import { Axios } from "@/util/http-commons.js";
import store from "@/stores";
import SpotList from "./SpotList.vue";
const http = Axios();
const apiurl = ref(import.meta.env.VITE_API_URL); //import 방식으로 고치기

const planStore = store.usePlanStore();
const { course } = storeToRefs(planStore);
const memberStore = store.useMemberStore();
const { userInfo } = storeToRefs(memberStore);
const playlistStore = store.usePlaylistStore();

const router = useRouter();
const props = defineProps({
  keyword: String,
  places: Object,
});

const planlist = ref();

const file = ref();
const initialForm = {
  planTitle: "",
  startDate: "2024-04-05",
  endDate: "2024-04-07",
  transport: "public",
  thumbnail: null,
};
const form = ref(initialForm);

const addFile = async () => {
  form.value.thumbnail = file.value.files[0];
};

function setInitForm() {
  form.value = initialForm;
}
//서버에 등록 요청
const handleFormSubmit = async () => {
  console.log("FormSubmit");
  if (!course.value) {
    alert("추가된 장소가 없습니다.");
    return;
  }
  const formData = new FormData();
  formData.append("planTitle", form.value.planTitle);
  formData.append("startDate", form.value.startDate);
  formData.append("endDate", form.value.endDate);
  formData.append("transport", form.value.transport);
  formData.append("memberId", userInfo.value.memberId);
  const contentIds = course.value.map((place) => place.contentId);
  formData.append("selectedPlaces", contentIds);
  if (playlistStore.hasPlaylist) {
    console.log(playlistStore.planPlaylistId);
    formData.append("playlistId", playlistStore.planPlaylistId);
  }
  if (form.value.thumbnail) {
    formData.append("file", form.value.thumbnail);
  }
  displayFormData(formData);
  try {
    const response = await http.post(apiurl.value + "plan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    form.value = initialForm;
    course.value = [];
    router.push();
    socket.send(
      JSON.stringify({
        type: "plan",
      })
    );
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
//디버깅
const displayFormData = (formData) => {
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
};
</script>

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
  font-family: "NanumSquareNeo-ExtraBold";
  letter-spacing: -2.5px;
  text-align: left;
}

::v-deep {
  .b-sidebar-body {
    overflow-y: hidden !important;
    overflow-x: hidden;
  }
}
</style>
