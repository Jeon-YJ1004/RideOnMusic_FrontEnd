<template>
  <div
    data-sal="slide-up"
    data-sal-duration="300"
    data-sal-delay="50"
    data-sal-easing="ease-in-out"
    id="search-sidebar-container"
    class="map-btn d-lg-flex"
  >
    <div
      title="여행지 리스트"
      id="btn-search-sidebar"
      data-bs-toggle="offcanvas"
      data-bs-target="#sidebar-plan"
      aria-controls="sidebar-plan"
      aria-label="Toggle navigation"
      class="sidebarBtn"
    >
      <img src="@/assets/img/compass.png" width="30px" class="sidebarBtn" />
    </div>
    <div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="sidebar-plan"
      aria-labelledby="sidebar-planLabel"
      no-header
      shadow
    >
      <div class="offcanvas-header" style="display: flex; flex-direction: column">
        <h4 class="offcanvas-title">
          <img src="@/assets/img/baggage.png" alt="Compass" width="50" height="50" />
          여행 코스
        </h4>
        <hr style="width: 100%; margin-bottom: 0" />
      </div>
      <div class="offcanvas-body">
        <form @submit.prevent="handleFormSubmit" enctype="multipart/form-data">
          <div id="menu_wrap" class="bg_white">
            <div id="planner_body" class="registration-form">
              <div class="form-group" style="width: 200px">
                <input
                  v-model="form.planTitle"
                  type="text"
                  placeholder="플랜 이름"
                  required
                  class="form-control item"
                />
              </div>
              <div style="width: 350px; display: flex" class="form-group">
                <div class="form-group" style="margin-right: 10px">
                  <label for="">시작 날짜 :</label>
                  <input
                    aria-label="시작날짜"
                    v-model="form.startDate"
                    type="date"
                    required
                    aria-required="true"
                    class="form-control item"
                  />
                </div>
                <div class="form-group">
                  <label for="">종료 날짜 :</label>
                  <input
                    v-model="form.endDate"
                    type="date"
                    required
                    aria-required="true"
                    class="form-control item"
                  />
                </div>
              </div>
              <div id="transport" class="form-group" style="margin-bottom: 10px">
                <div class="label">교통수단 :</div>
                <div>
                  <label class="check">
                    <input
                      v-model="form.transport"
                      value="public"
                      style="width: 100px"
                      type="radio"
                    />
                    <span>대중 교통</span>
                  </label>
                  <label class="check">
                    <input
                      v-model="form.transport"
                      value="ownCar"
                      class="form-control item"
                      style="width: 100px"
                      type="radio"
                    />
                    <span>자차</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <div class="label">썸네일 :</div>
                <input
                  @change="addFile($event)"
                  ref="file"
                  type="file"
                  id="file"
                  name="file"
                  class="form-control item"
                />
              </div>
              <div class="form-group">
                <label for="">여행지 :</label>
                <br />
                <div>
                  <SpotList ref="planlist" :form="form" @init-form="setInitForm" />
                </div>
              </div>
              <div id="buttons">
                <button type="submit" class="btn btn-outline-primary bg-light">저장</button>
              </div>
            </div>
          </div>
        </form>
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
  startDate: "",
  endDate: "",
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
    socket.send(
      JSON.stringify({
        type: "plan",
        memberId: userInfo.value.memberId
      })
    );
    router.push({ name: 'plannerlist' });
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
.label {
  width: 100px;
}
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
  // background-color: #0d6efd;
  // color: #fff;
}
label.check span {
  border-radius: 20px;
}

.sidebarBtn:hover {
  transition: all 0.2s linear;
  transform: scale(1.3);
}
</style>
