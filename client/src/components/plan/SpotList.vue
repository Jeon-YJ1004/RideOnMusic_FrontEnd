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
      @end="onUpdatePath"
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
/* Add your styles here */
</style>
