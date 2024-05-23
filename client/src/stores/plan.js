import { ref } from "vue";
import { defineStore } from "pinia";

export const usePlanStore = defineStore(
  "plan",
  () => {
    const course = ref([]);
    return { course };
  },
  {
    persist: true,
  }
);
