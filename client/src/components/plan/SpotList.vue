<!-- <template>
  <div
    id="attr-search-result-list-container"
    class="attr-search-result-list-container w-100 h-100 d-flex flex-column"
  >
    <div v-if="loaded">
      <b-card no-body>
        <b-tabs v-model="tabIndex" card ref="tabmenu">
          <draggable :animation="500" @change="onChange" v-model="curCourse">
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
    <draggable :animation="500" @change="onChange" v-model="curCourse[index]">
      <transition-group>
        <attr-search-result-item
          v-for="attr in dayCourse"
          :key="attr.order"
          :attr-prop="attr"
          :type="'plan'"
          @on-delete="onDelete"
          @set-marker="setMarker"
        />
      </transition-group>
    </draggable>
    <div v-else>추가된 항목이 없습니다.</div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import draggable from "vuedraggable";
import SpotListItem from "@/components/plan/item/SpotListItem.vue";

const props = defineProps({
  type: {
    type: String,
    default: "plan",
  },
  courses: {
    type: Array,
  },
  maxDay: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "chat-req-change-tab",
  "req-scroll-search",
  "set-marker",
  "on-update-path",
  "on-update-courses",
  "set-init-map",
]);

const curCourse = ref([]);
const loaded = ref(false);
const resultList = ref([]);

const { proxy } = getCurrentInstance();

const resetList = () => {
  resultList.value = [];
};

const onDelete = (orderAndDay) => {
  curCourse.value[orderAndDay.day - 1].splice(orderAndDay.order - 1, 1);
  resetOrders();
  onUpdatePath();
};

const fetchPath = (course) => {
  curCourse.value = course.course;
  resetOrders();
};

const addPath = (info) => {
  const newObj = {
    contentId: info.contentId,
    planId: proxy.$route.params.planid,
    order: 99999,
    attractionDto: info,
  };
  curCourse.value = curCourse.value.concat(newObj);
  resetOrders();
  onUpdatePath();
};

const onNewResult = (result) => {
  resultList.value = result;
};

const onAddResult = (result) => {
  resultList.value = resultList.value.concat(result);
};

const onChange = () => {
  resetOrders();
  onUpdatePath(tabIndex);
};

const resetOrders = () => {
  for (let i = 0; i < curCourse.length; i++) {
    for (let j = 0; j < curCourse[i].length; j++) {
      curCourse[i][j].order = j + 1;
    }
  }
};

const saveCourse = (title, start, end) => {
  const planid = proxy.$route.params.planid;
  const params = {
    title: title,
    startDate: start,
    endDate: end,
    planId: Number(planid),
    courses: getCourseObject(),
  };

  modifyPlan(
    params,
    () => {
      alert("저장했습니다.");
    },
    () => {}
  );
  onUpdatePath(tabIndex);
};

const getCourseObject = () => {
  const courses = [];
  for (let i = 0; i < curCourse.value.length; i++) {
    for (let j = 0; j < curCourse.value[i].length; j++) {
      const obj = {
        contentId: curCours.valuee[i][j].contentId,
        order: j + 1,
        day: i + 1,
      };
      courses.push(obj);
    }
  }
  return courses;
};

const onAddDay = () => {
  curCourse.value.push([]);
};

const setMarker = (LatLngAndInfo) => {
  emit("set-marker", LatLngAndInfo);
};

const onUpdatePath = (idx = 0, send = true) => {
  const params = {
    course: curCourse,
    send: send,
    idx: Number(idx),
  };
  emit("on-update-path", params);
};

const planid = proxy.$route.params.planid;
if (planid != undefined) {
  getPlanInfo(
    planid,
    (res) => {
      const plan = res.data;

      const initMapLatLngList = [];
      for (let i = 0; i < plan.courses.length; i++) {
        const order = plan.courses[i].order - 1;
        const day = plan.courses[i].day - 1;
        if (curCourse[day] == undefined) curCourse[day] = new Array();
        curCourse[day][order] = plan.courses[i];
        if (day == 0) {
          initMapLatLngList.push({
            lat: plan.courses[i].attractionDto.latitude,
            lng: plan.courses[i].attractionDto.longitude,
          });
        }
      }
      if (plan.courses.length == 0) onAddDay();
      loaded = true;
      onUpdatePath(tabIndex, false);

      emit("set-init-map", initMapLatLngList);
    },
    () => {}
  );
}

const editCourses = computed({
  get() {
    return props.courses;
  },
  set(v) {
    emit("on-update-courses", v);
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
