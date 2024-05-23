<script setup>
import "@/assets/css/board.css";
import "@/assets/css/plan_list.css";
import { ref, onMounted, watch } from "vue";
import PlannerListItem from "@/components/plan/item/PlannerListItem.vue";
import { useMemberStore } from "@/stores/memberStore.js";
import { storeToRefs } from "pinia"
import { getPlannerList } from "@/api/plan.js";
import { useRoute } from "vue-router";
const router = useRoute();

// 추가 코드
const memberStore = useMemberStore();
const { userInfo} = storeToRefs(memberStore);
//
const joinPlan = router.params.memberId;
const loaded = ref(false);
const planners = ref([]);

onMounted(() => {
    if(joinPlan != null){
        PlannerList(joinPlan);
    }else{
        PlannerList(userInfo.value.memberId);
    }
})

const PlannerList = async (val) => {
    getPlannerList(val, ({data}) => {
        planners.value = data.data;
    }, (error) => console.log(error));
}

watch(planners, (newValue, oldValue) => {
    if (newValue.length > 0) {
        loaded.value = true;
    }
})

</script>

<template>
        <!-- <div class="planTitle" id="list-container">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-md-10 col-sm-12">
                        <h2 class="my-3 py-3 shadow-sm bg-light text-center">
                            <mark class="sky">계획 목록</mark>
                        </h2>
                </div>
            </div>
        </div> -->

        <div v-if="loaded" stlye="margin">
            <PlannerListItem :planners="planners" />
        </div>
</template>

<style scoped>
</style>