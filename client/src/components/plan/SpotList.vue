<template>
  <div id="area_sel">
    <VueDraggableNext
      v-if="course && course.length > 0"
      v-model="course"
      :options="{ handle: '.drag-handle' }"
      @end="onUpdatePath"
    >
      <div
        v-for="(place, idx) in course"
        :key="place.addr"
        id="result-item-container"
        class="drag-handle draggable"
      >
        <div class="d-flex align-items-center" style="cursor: pointer">
          <img :src="place.img" class="col" style="width: 50px; height: 50px" />
          <div class="ml-3 col-8 textClass">
            {{ place.title }}
            <div class="text-muted textClass">{{ place.addr }}</div>
          </div>
          <div class="track-addition" style="width: 30px">
            <i class="bi bi-trash3-fill" style="font-size: 1.5rem" @click="onDelete(idx)"></i>
          </div>
        </div>
      </div>
    </VueDraggableNext>
    <div v-else>추가된 항목이 없습니다.</div>
  </div>
</template>

<script setup>
import SpotListItem from "@/components/plan/item/SpotListItem.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { storeToRefs } from "pinia";
import store from "@/stores";
import { useMemberStore } from "@/stores/memberStore.js";
import { socket } from "@/services/ChatService.js";
const planStore = store.usePlanStore();
const { course } = storeToRefs(planStore);

const onDelete = (index) => {
  course.value.splice(index, 1); //인덱스로부터 1개 제거
  // resetOrders();
  onUpdatePath();
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
};
</script>

<style scoped>
#result-item-container {
  height: 80px;
  padding: 15px;
  border: 1px solid rgba(33, 33, 53, 0.125);
  background-color: #fff;
  border-radius: 20px;
  margin: 5px;
  margin-left: 0px;
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
#result-item-container:hover {
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
  background-color: rgba(0, 0, 0, 0.085);
  transform-origin: center !important;
  transform: scale(1.02);
  margin-top: 10px;
  margin-bottom: 10px;
}
.rad {
  border-radius: 100%;
}
.btn-primary-standard-n {
  border: none;
  color: rgba(3, 149, 165, 1) !important;
  background-color: transparent;
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
.btn-primary-standard-n:hover {
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
  color: rgba(2, 87, 140, 1) !important;
  transform: scale(1.1);
}
.btn-gray {
  border: none;
  color: rgb(90, 90, 90) !important;
  background-color: transparent;
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
.btn-gray:hover {
  color: rgb(50, 50, 50) !important;
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  -ms-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
  transform: scale(1.1);
}
.bold-border-gray {
  stroke: rgba(90, 90, 90, 1) !important;
  stroke-width: 0.15px;
}
.bold-border-gray:hover {
  stroke: rgba(50, 50, 50, 1) !important;
}
.bold-border {
  stroke: rgba(3, 149, 165, 1) !important;
  stroke-width: 0.15px;
}
.bold-border:hover {
  stroke: rgba(2, 87, 140, 1) !important;
}
:deep(.card-body) {
  width: 100%;
  padding: 0px;
}

.textClass {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  margin-left: 5px;
}
</style>
