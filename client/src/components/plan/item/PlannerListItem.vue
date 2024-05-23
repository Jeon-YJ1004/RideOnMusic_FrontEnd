<script setup>
import { ref, computed, defineProps } from "vue";
import "@/assets/css/plan_list.css";
import "@/assets/css/board.css";

const props = defineProps({ planners: Array });
const defaultImage = "/src/assets/img/bg6.jpg";
const fileUrl = import.meta.env.VITE_API_URL + "plan/img";

const getImageUrl = (thumbnailImgInfo) => {
  console.log(thumbnailImgInfo);
  if (thumbnailImgInfo && thumbnailImgInfo.saveFolder && thumbnailImgInfo.saveFile) {
    return fileUrl + `/${thumbnailImgInfo.saveFolder}/${thumbnailImgInfo.saveFile}`;
  }
  return defaultImage;
};
</script>

<template>
  <div class="container" id="list-container">
    <div class="row justify-content-center">
      <!-- <div class="col-lg-8 col-md-10 col-sm-12">
                <h2 class="my-3 py-3 shadow-sm bg-light text-center">
                    <mark class="sky">계획 목록</mark>
                </h2>
            </div> -->
      <div class="col-lg-6 col-md-8 col-sm-12">
        <div class="gallery">
          <router-link
            v-for="plan in planners"
            :key="plan.id"
            :to="{ name: 'plannerdetail', params: { planNo: plan.planNo } }"
            class="gallery-item"
          >
            <div>
              <div class="gallery-info" style="display: inline-block; margin-right: 10px">
                <div class="gallery-title">{{ plan.planTitle }}</div>
                <div>{{ plan.startDate }} ~ {{ plan.endDate }}</div>
              </div>
              <img :src="getImageUrl(plan.thumbnailImgInfo)" class="gallery-image" />
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  color: black;
}
</style>
