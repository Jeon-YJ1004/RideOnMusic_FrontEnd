<!-- <template>
  <div
    id="attr-search-result-list-container"
    class="attr-search-result-list-container w-100 h-100 d-flex flex-column"
  >
    <div v-if="loaded">
      <b-card no-body>
        <b-tabs v-model="tabIndex" card ref="tabmenu">
          <draggable :animation="500" @change="onChange" v-model="course">
            <transition-group>
              <SpotListItem
                v-for="attr in dayCourse"
                :key="attr.order"
                :attr-prop="attr"
                :type="'plan'"
                @on-delete="onDelete"
                @set-marker="setMarker"
              />
            </transition-group>
          </draggable>
          <template #tabs-end>
            <b-nav-item @click.prevent="onAddDay">+</b-nav-item>
          </template>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template> -->

<template>
  <div id="area_sel">
    <VueDraggableNext
      v-if="course && course.length > 0"
      v-model="course"
      :options="{ handle: '.drag-handle' }"
      @end="OnPathUpdate"
    >
      <div v-for="(place, idx) in course" :key="place.addr" class="drag-handle draggable">
        <img :src="place.img" style="width: 50px; height: 50px" />
        <div>
          [{{ place.title }}]<br />
          지번 주소: {{ place.addr }}
        </div>
        <button @click="onDelete(idx)">삭제</button>
      </div>
    </VueDraggableNext>
    <div v-else>추가된 항목이 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, computed, defineExpose } from "vue";
import draggable from "vuedraggable";
import SpotListItem from "@/components/plan/item/SpotListItem.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { storeToRefs } from "pinia";
import store from "@/stores";
import { useMemberStore } from "@/stores/memberStore.js";
import { Axios } from "@/util/http-commons.js";
import { chatService, socket, handleSocketMessage } from "@/services/ChatService.js";

const http = Axios();
const playlistStore = store.usePlaylistStore();
const appKey = import.meta.env.VITE_KAKAO_APPKEY;
const apiurl = ref(import.meta.env.VITE_API_URL); //import 방식으로 고치기

const memberStore = useMemberStore();
const { userInfo } = storeToRefs(memberStore);

const props = defineProps(["addedPlaces", "form", "init-form"]);

const emit = defineEmits(["req-scroll-search", "on-update-courses", "on-update-path"]);

const course = ref([]);
const loaded = ref(false);
const resultList = ref([]);

const { proxy } = getCurrentInstance();

const resetList = () => {
  resultList.value = [];
};

const onDelete = (index) => {
  course.value.splice(index, 1); //인덱스로부터 1개 제거
  // resetOrders();
  onUpdatePath();
};

// const fetchPath = (course) => {
//   course.value = course.course;
//   resetOrders();
// };

const addPath = (position) => {
  course.value = course.value.concat(position);
  // resetOrders();
  // onUpdatePath();
};

const onNewResult = (result) => {
  resultList.value = result;
};
const onAddResult = (result) => {
  resultList.value = resultList.value.concat(result);
};

const OnPathUpdate = () => {
  // resetOrders();
  onUpdatePath();
};

// const resetOrders = () => {
//   for (let i = 0; i < course.value.length; i++) {
//     course.value[i].order = i + 1;
//   }
// };

//서버에 등록 요청
const handleFormSubmit = async () => {
  if (!course.value) {
    alert("추가된 장소가 없습니다.");
    return;
  }
  const formData = new FormData();
  formData.append("planTitle", props.form.value.planTitle);
  formData.append("startDate", props.form.value.startDate);
  formData.append("endDate", props.form.value.endDate);
  formData.append("transport", props.form.value.transport);
  formData.append("memberId", userInfo.value.memberId);
  const contentIds = course.value.map((place) => place.contentId);
  formData.append("selectedPlaces", contentIds);
  if (playlistStore.hasPlaylist) {
    console.log(playlistStore.planPlaylistId);
    formData.append("playlistId", playlistStore.planPlaylistId);
  }
  if (props.form.value.thumbnail) {
    formData.append("file", props.form.value.thumbnail);
  }
  displayFormData(formData);
  try {
    const response = await http.post(apiurl.value + "plan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    emit("init-form");
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

// const getCourseObject = () => {
//   const courses = [];
//   for (let i = 0; i < course.value.length; i++) {
//     const obj = {
//       contentId: course.value[i].contentId,
//       order: i+ 1,
//       };
//       courses.push(obj);
//   }
//   return courses;
// };

const onAddDay = () => {
  course.value.push([]);
};

const setMarker = (LatLngAndInfo) => {
  emit("set-marker", LatLngAndInfo);
};

//  sendPathUpdate to socket
const onUpdatePath = () => {
  console.log("course");
  console.log(course.value);
  socket.send(
    JSON.stringify({
      type: "path",
      contents: course.value,
    })
  );
  emit("on-update-path", course.value);
};

// const editCourses = computed({
//   get() {
//     return props.courses;
//   },
//   set(v) {
//     emit("on-update-courses", v);
//   },
// });

defineExpose({ addPath });
</script>

<style scoped>
/* Add your styles here */
</style>
