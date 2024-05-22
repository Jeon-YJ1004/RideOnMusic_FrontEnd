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
                        <input v-model="form.planTitle" type="text" placeholder="플랜 이름" />
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
                      <!-- <button id="shortest-path-btn" class="btn btn-primary btn-ghost btn-open"
                                @click="sortPlacesByShortestPath()" type="button">최단경로로
                                변환하기
                            </button> -->
                      <!-- 최종 계획 정보를 PlannerRegister에게 넘긴다. -->
                      <button type="submit" class="btn btn-primary btn-ghost btn-open">저장</button>
                    </div>
                    <div id="area_sel"></div>

                    <!-- 드래그 구현중      -->
                    <!-- <div id="area_sel">
                        <div v-for="place in addedPlaces.value" :key="place.idx" style="display:flex">
                            <img :src="place.img" style="width: 50px; height: 50px;">
                            <div>
                                [{{ place.title }}]<br>
                                지번 주소: {{ place.addr }}
                            </div>
                            <button @click="removePlace(place.idx)">삭제</button>
                        </div>
                    </div> -->
                    <SpotList
                      :course="addedPlaces.value"
                      ref="planlist"
                      :form="form"
                      @init-form="setInitForm"
                      @on-update-path="reqUpdatePath"
                      
                    />
                    
                    <!-- <div
                      v-for="place in places.value"
                      :key="place.index"
                      class="drag-handle draggable"
                    >
                      <img :src="place.img" style="width: 50px; height: 50px" />
                      <div>
                        [{{ place.title }}]<br />
                        지번 주소: {{ place.addr }}
                      </div>
                      <button @click="removePlace(place.idx)">삭제</button>
                    </div> -->
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
import { onMounted, onUpdated, ref, watch,defineExpose } from "vue";
import { useRouter } from "vue-router";
import { chatService, socket, handleSocketMessage, addedPlaces } from "@/services/ChatService.js";
import { VueDraggableNext } from "vue-draggable-next";

import { storeToRefs } from "pinia";
import store from "@/stores";
import { useMemberStore } from "@/stores/memberStore.js";
import SpotList from "./SpotList.vue"
;

const router = useRouter();
const props = defineProps({
  keyword: String,
  places: Object,
});
const emit =defineEmits(["req-update-path","set-init-map"])
const markerImg = "/src/assets/img/marker7.png";
const preparingImg = "/src/assets/img/preparingimg.jpg";

const planlist=ref()
var markers = [];
var overlays = [];
var positions = [];
let map = null;
var polyline; // 선을 담는 변수
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


function addPathtoSlider(path) {
  planlist.value.addPath(path);
}

function setInitForm(){
  form.value=initialForm;
}
function reqUpdatePath(course){
  console.log(course);
  emit("req-update-path",course);
}

defineExpose({addPathtoSlider})
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