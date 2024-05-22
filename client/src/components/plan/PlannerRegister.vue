<template>
  <div class="w-100" style="margin-right: 0; margin-left: 0; overflow-y: hidden">
    <div
      style="
        display: inline-flex;
        align-items: center;
        /* justify-content: space-around; */
        align-content: center;
        flex-wrap: nowrap;
      "
    >
      <SpotListSidebar
        class=""
        :places="places"
        @req-update-path="updatePath"
        @set-init-map="reqSetInitMap"
        ref="spotlistSidebar"
      />
      <div class="text-center" style="height: 40px; margin-left: 30px">
        <VSelect
          :selectOption="sidoList"
          :defaultValue="'검색 할 지역 선택'"
          :classGroup="classGroup"
          @on-key-select="selectSido"
        />
      </div>
      <div class="text-center" style="height: 40px; margin-left: 30px">
        <VSelect
          :selectOption="typeList"
          :defaultValue="'관광지 유형'"
          :classGroup="classGroup"
          @on-key-select="selectType"
        />
      </div>
      <div class="text-center d-flex" style="height: 40px; margin-left: 30px">
        <input
          id="search-keyword"
          class="form-control mr-3"
          type="search"
          name="search-keyword"
          placeholder="검색어"
          aria-label="검색어"
          v-model="searchItem.title"
        />
        <button
          class="btn btn-primary btn-sm"
          id="btn-search"
          style="white-space: nowrap; margin-left: 5%"
          @click="search"
        >
          검색
        </button>
      </div>
      <MusicSidebar class="col" />
    </div>
    <!-- kakao map -->
    <KakaoMap
      :places="places"
      ref="kakaomap"
      @add-path="addPath"
    />
    
    <!-- <div class="col-md-3 mb-3 text-center d-flex col">
    <input
    id="sendedPushMember"
    class="form-control mr-2"
    type="text"
    v-model="sendedPushMember"
    placeholder="초대할 멤버 ID 입력"
    aria-label="초대할 멤버 ID 입력"
    />
    <button
    class="btn btn-primary btn-sm"
    id="btn-invite"
    style="white-space: nowrap; margin-left: 5%"
    @click="inviteMember"
    >
    초대하기
  </button>
</div> -->
  </div>
</template>

<script setup>
import sal from "sal.js";

// import PlannerChat from "./PlannerChat.vue";
import { ref, reactive, onMounted, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { Axios } from "@/util/http-commons";
import {
  chatService,
  socket,
  handleSocketMessage,
  places,
  addedPlaces,
} from "@/services/ChatService.js";
// import KakaoMap from "@/components/plan/KakaoMap.vue";
import KakaoMap from "@/components/plan/item/KakaoMap.vue"
import VSelect from "@/components/common/VSelect.vue";
import MusicSidebar from "@/components/spotify/MusicSidebar.vue";
import store from "@/stores";

import { useMemberStore } from "@/stores/memberStore.js";
import { storeToRefs } from "pinia";
import SpotListSidebar from "@/components/plan/SpotListSidebar.vue";

const route = useRoute();
const http = Axios();

// 초대 수정 코드
const sendedPushMember = ref("");

// 끝
const courses = ref([]);
const loaded = ref(false);

const kakaomap = ref(null);
const spotlistSidebar = ref(null);

const memberStore = useMemberStore();
const { userInfo } = storeToRefs(memberStore);

function inviteMember() {
  const memberId = sessionStorage.getItem("memberId");
  socket.send(
    JSON.stringify({
      type: "invite",
      memberId: memberId,
      sendedPushMember: sendedPushMember.value,
    })
  );
}

socket.onmessage = (event) => {
  const eventData = JSON.parse(event.data);
  if (eventData.type === "invite") {
    console.log(eventData);
    handleSocketMessage(eventData);
  }
};
const sidoList = ref([]);
const searchItem = ref({});
const classGroup = "form-select mb-3";
const typeList = ref([
  { text: "관광지", value: "12" },
  { text: "문화시설", value: "14" },
  { text: "축제공연행사", value: "15" },
  { text: "여행코스", value: "25" },
  { text: "레포츠", value: "28" },
  { text: "숙박", value: "32" },
  { text: "쇼핑", value: "38" },
  { text: "음식점", value: "39" },
]);
const getSido = () => {
  http.get("attraction").then(({ data }) => {
    sidoList.value = data.data.map((item) => ({
      value: item.sidoCode,
      text: item.sidoName,
    }));
  });
};

const search = () => {
  http.post("attraction/search", searchItem.value).then(({ data }) => {
    if (data.data.length === 0) {
      alert("검색결과가 없습니다.");
    } else {
      places.value = data.data;
      // 검색 결과를 서버로 전송
      socket.send(
        JSON.stringify({
          type: "search",
          searchArea: {
            sidoCode: searchItem.value.sidoCode,
            contentTypeId: searchItem.value.contentTypeId,
            title: searchItem.value.title,
          },
          contents: data.data,
        })
      );
    }
  });
};

const selectSido = (option) => {
  searchItem.value.sidoCode = option;
};

const selectType = (option) => {
  searchItem.value.contentTypeId = option;
};

function reqSetInitMap(list) {
  kakaomap.value.setInitMap(list);
}

function onSearchLatLng(latlng) {
  spotlistSidebar.value.reqSearch(latlng);
}

function addPath(info) {
  console.log("info")
  console.log(info);
  spotlistSidebar.value.addPathtoSlider(info);
}

function removePath(info) {
  kakaomap.value.removePath(info.idx);
}
function updatePath(course) {
  console.log("막타")
  console.log(course);
  kakaomap.value.resetMarkers();
  if (course) {
    kakaomap.value.setMarkers(course);
  }
}


onMounted(() => {
  getSido();


});
</script>

<style scoped>
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

:deep(.b-sidebar-body) {
  overflow-y: hidden !important;
  overflow-x: hidden;
}
</style>