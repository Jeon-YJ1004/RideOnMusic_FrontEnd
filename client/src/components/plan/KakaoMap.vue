<template>
  <div id="kakao-map-container" class="col-12 h-100 p-0" style="position: relative">
    <div
      v-if="loading"
      class="w-100 h-100"
      style="position: absolute; background-color: rgba(0, 0, 0, 0.5); z-index: 999999"
      id="overlay"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
    <div id="map" ref="map" class="w-100 h-100"></div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref, watch } from "vue";
import { Axios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { chatService, socket, handleSocketMessage, addedPlaces } from "@/services/ChatService.js";
import { VueDraggableNext } from "vue-draggable-next";

import { storeToRefs } from "pinia";
import store from "@/stores";
import { useMemberStore } from "@/stores/memberStore.js";
const memberStore = useMemberStore();
const { userInfo } = storeToRefs(memberStore);

const router = useRouter();
const props = defineProps({
  keyword: String,
  places: Object,
});

const playlistStore = store.usePlaylistStore();

const http = Axios();
const markerImg = "/src/assets/img/marker7.png";
const preparingImg = "/src/assets/img/preparingimg.jpg";
const appKey = import.meta.env.VITE_KAKAO_APPKEY;
const apiurl = ref(import.meta.env.VITE_API_URL); //import 방식으로 고치기

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

watch(
  () => props.places,
  (places) => {
    displayPlaces(places);
  }
);

// watch(addedPlaces, (newPlaces, oldPlaces) => {
//     if (newPlaces.length >= 2) {
//         drawLine();
//     } else {
//         removeDraw();
//     }
// }, { deep: true });

watch(
  () => addedPlaces.value,
  (newPlaces, oldPlaces) => {
    if (newPlaces.length >= 2) {
      drawLine();
    } else {
      removeDraw();
    }
  },
  { deep: true }
);

onMounted(() => {
  chatService.connect();
  chatService.ws.onmessage = (event) => {
    const eventData = JSON.parse(event.data);
    handleSocketMessage(eventData);
  };

  if (window.kakao && window.kakao.maps) {
    console.log("kakao maps loaded");
    initMap();
  } else {
    loadScript();
  }
});

const loadScript = () => {
  const script = document.createElement("script");
  script.onload = () => kakao.maps.load(initMap);
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}&libraries=services,clusterer,drawing`;
  document.head.appendChild(script);
};

const initMap = () => {
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(36.35559977190671, 127.29859991863871),
    level: 9,
  };
  map = new kakao.maps.Map(container, options);
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
  var mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
};

// function displayPlaces(places) {
//   var bounds = new kakao.maps.LatLngBounds();
//   removeMarker();
//   removeDraw();
//   for (var i = 0; i < places.length; i++) {
//     var placePosition = new kakao.maps.LatLng(places[i].latitude, places[i].longitude);
//     if (places[i].firstImg == "") {
//       places[i].firstImg = preparingImg;
//     }
//     positions.push({
//       contentId: places[i].contentId,
//       idx: i,
//       title: places[i].title,
//       addr: places[i].addr1,
//       img: places[i].firstImg,
//       //TODO: 이 부분도 컴포넌트로 뺄 수 있나..?
//       content:
//         '<div class="info">' +
//         '<div class="title">' +
//         places[i].title +
//         "</div>" +
//         '<div class="body">' +
//         '<div class="img">' +
//         '<img src="' +
//         places[i].firstImg +
//         '" width="80" height="70">' +
//         "</div>" +
//         "</div>" +
//         '<div class="desc">' +
//         '<div class="ellipsis">' +
//         places[i].addr1 +
//         "</div>" +
//         '<div class="jibun ellipsis">' +
//         places[i].addr2 +
//         "</div>" +
//         "</div>" +
//         "</div>",
//       latlng: placePosition,
//     });
//     addMarker(positions[i]);
//     bounds.extend(placePosition);
//   }
//   map.setBounds(bounds);
// }

// function addMarker(position) {
//   var imageSrc = markerImg,
//     imageSize = new kakao.maps.Size(80, 80),
//     imgOptions = {
//       spriteSize: new kakao.maps.Size(45),
//       spriteOrigin: new kakao.maps.Point(0, 0),
//       offset: new kakao.maps.Point(25, 25),
//     },
//     markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
//     marker = new kakao.maps.Marker({
//       position: position.latlng, // 위도(latitude), 경도(longitude) 순서로 전달
//       image: markerImage,
//     });

//   var infowindow = new kakao.maps.InfoWindow({
//     content: position.content, // 인포윈도우에 표시할 내용
//   });

//   kakao.maps.event.addListener(marker, "click", function () {
//     addPlace(position);
//   });

//   kakao.maps.event.addListener(marker, "mouseover", makeOverListener(map, marker, infowindow));
//   kakao.maps.event.addListener(marker, "mouseout", makeOutListener(infowindow));

//   marker.setMap(map);
//   markers.push(marker);
// }

// // 장소 추가 함수
// function addPlace(position) {
//   if (duplicateCheck(position)) {
//     addedPlaces.value.push({
//       contentId: position.contentId,
//       idx: position.idx,
//       title: position.title,
//       addr: position.addr,
//       img: position.img,
//       latitude: position.latlng.La,
//       longitude: position.latlng.Ma,
//     });
//     updateMap();
//   }
//   sendPathUpdate();
// }

// const sendPathUpdate = () => {
//   socket.send(
//     JSON.stringify({
//       type: "path",
//       contents: addedPlaces.value,
//     })
//   );
// };

// // 중복 검사 함수
// function duplicateCheck(position) {
//   return !addedPlaces.value.some((place) => place.contentId === position.contentId);
// }

// // 지도 업데이트 함수
// function updateMap() {
//   if (addedPlaces.value.length >= 2) {
//     drawLine();
//   } else {
//     removeDraw();
//   }
// }

// // 장소 제거 함수
// function removePlace(idx) {
//   const index = addedPlaces.value.findIndex((p) => p.idx === idx);
//   if (index !== -1) {
//     addedPlaces.value.splice(index, 1); //인덱스로부터 1개 제거
//     updateMap();
//   }
//   socket.send(
//     JSON.stringify({
//       type: "path",
//       contents: addedPlaces.value,
//     })
//   );
// }

// // 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// function makeOverListener(map, marker, infowindow) {
//   return function () {
//     infowindow.open(map, marker);
//   };
// }

// // 인포윈도우를 닫는 클로저를 호출
// function makeOutListener(infowindow) {
//   return function () {
//     infowindow.close();
//   };
// }

// // 지도 위에 표시되고 있는 마커,오버레이 모두 제거
// function removeMarker() {
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(null);
//   }

//   for (var i = 0; i < overlays.length; i++) {
//     overlays[i].setMap(null);
//   }

//   markers = [];
//   positions = [];
//   addedPlaces.value = [];
// }

// function drawLine() {
//   var linePath = addedPlaces.value.map((place) => {
//     return new kakao.maps.LatLng(place.longitude, place.latitude);
//   });

//   removeDraw(); // 기존 선을 제거
//   polyline = new kakao.maps.Polyline({
//     path: linePath,
//     strokeWeight: 4,
//     strokeColor: "#FF0000",
//     strokeOpacity: 0.8,
//     strokeStyle: "solid", //실선
//   });

//   polyline.setMap(map);
// }

// // 모든 선을 지도에서 제거
// function removeDraw() {
//   if (polyline) {
//     polyline.setMap(null);
//   }
// }

// //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// const resetMarkers = () => {
//   for (let i = 0; i < state.curCourseMarkers.length; i++) {
//     state.curCourseMarkers[i].marker.setMap(null);
//   }
//   if (state.curPolyLine != null) {
//     state.curPolyLine.setMap(null);
//   }
// };

// const setMarkers = (course) => {
//   for (let i = 0; i < course.length; i++) {
//     let marker = new proxy.$kakao.maps.Marker({
//       position: new proxy.$kakao.maps.LatLng(course[i].lat, course[i].lng),
//       map: state.map,
//     });
//     state.curCourseMarkers.push({
//       idx: course[i].idx,
//       marker: marker,
//     });
//   }
//   let path = [];
//   for (let i = 0; i < course.length; i++) {
//     path.push(new proxy.$kakao.maps.LatLng(course[i].lat, course[i].lng));
//   }
//   state.curPolyLine = new proxy.$kakao.maps.Polyline({
//     path: path,
//     strokeWeight: 5,
//     strokeColor: "#FF0000",
//     strokeOpacity: 1.0,
//     strokeStyle: "solid",
//   });
//   state.curPolyLine.setMap(state.map);
// };
// setMarkers(courseInfo) {
//       this.waitForCondition("kakaomapLoaded").then(() => {
//         let curPolyLinePath = [];
//         for (let i = 0; i < courseInfo.course[courseInfo.idx].length; i++) {
//           let pos = new window.kakao.maps.LatLng(
//             courseInfo.course[courseInfo.idx][i].attractionDto.latitude,
//             courseInfo.course[courseInfo.idx][i].attractionDto.longitude
//           );
//           curPolyLinePath.push(pos);

//           let content = `<div style="position:relative;"><svg style="filter: drop-shadow(0px 0px 5px rgb(0 0 0 / 0.6));" xmlns="http://www.w3.org/2000/svg" fill="#0395a5" width="50px" height="50px" viewBox="0 0 1920 1920">
//     <path d="M956.952 0c-362.4 0-657 294.6-657 656.88 0 180.6 80.28 347.88 245.4 511.56 239.76 237.96 351.6 457.68 351.6 691.56v60h120v-60c0-232.8 110.28-446.16 357.6-691.44 165.12-163.8 245.4-331.08 245.4-511.68 0-362.28-294.6-656.88-663-656.88" fill-rule="evenodd"/>

// </svg><span style="position:absolute; top:10%; left:50%;font-family:'NanumSquareNeo-ExtraBold';color:white;
//     transform: translate(-50%, 0);">${i + 1}</span></div>`;
//           let newMarker = new window.kakao.maps.CustomOverlay({
//             position: pos,
//             content: content,
//             yAnchor: 1,
//           });
//           // let newMarker = new window.kakao.maps.Marker({
//           // position: pos,
//           // });
//           newMarker.setMap(this.map);
//           this.curCourseMarkers.push(newMarker);
//         }

//         if (this.curPolyLine != null) this.curPolyLine.setMap(null);

//         this.curPolyLine = new window.kakao.maps.Polyline({
//           path: curPolyLinePath,

//           strokeWeight: 5, // 선의 두께 입니다
//           strokeColor: "#0395a5", // 선의 색깔입니다
//           strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
//           strokeStyle: "solid", // 선의 스타일입니다
//         });
//         this.curPolyLine.setMap(this.map);
//       });
//     },
//     setMarker(LatLngAndInfo) {
//       if (this.curWindow != null) this.curWindow.close();
//       let pos = new window.kakao.maps.LatLng(LatLngAndInfo.lat, LatLngAndInfo.lng);

//       this.map.setCenter(pos);

//       let infoContent = document.createElement("div");
//       infoContent.classList.add(
//         "p-2",
//         "d-inline-block",
//         "text-left",
//         "m-1",
//         "mb-2",
//         "info-container"
//       );
//       infoContent.setAttribute("id", "info-container");

//       let infoRowTop = document.createElement("div");
//       infoRowTop.classList.add(
//         "pl-3",
//         "pr-3",
//         "row",
//         "flex-row",
//         "flex-nowrap",
//         "justify-content-between",
//         "attr"
//       );

//       let infoRowBottom = document.createElement("div");
//       infoRowBottom.classList.add(
//         "pl-4",
//         "pr-4",
//         "mt-2",
//         "row",
//         "flex-row",
//         "flex-nowrap",
//         "justify-content-between"
//       );

//       let infoAddPathBtn = document.createElement("button");
//       infoAddPathBtn.classList.add("btn", "btn-outline-primary", "btn-rad");
//       infoAddPathBtn.innerHTML = "경로에 추가";
//       infoAddPathBtn.addEventListener("click", () => {
//         this.addPath(LatLngAndInfo.attr);
//       });
//       let infoCloseBtn = document.createElement("button");
//       infoCloseBtn.classList.add("btn", "btn-outline-secondary", "mr-2", "btn-rad");
//       infoCloseBtn.innerHTML = "닫기";
//       infoCloseBtn.addEventListener("click", () => {
//         this.closeInfo();
//       });

//       infoRowBottom.append(infoCloseBtn, infoAddPathBtn);

//       let infoLeft = document.createElement("div");

//       let infoLeftBottom = document.createElement("div");
//       let infoTitle = document.createElement("h5");
//       infoTitle.classList.add("attr-title");
//       infoTitle.innerHTML = LatLngAndInfo.attr.title;
//       let infoAddr = document.createElement("h6");
//       infoAddr.classList.add("small-font");
//       infoAddr.innerHTML = LatLngAndInfo.attr.addr1 + " " + LatLngAndInfo.attr.addr2;
//       let infoContentType = document.createElement("h6");
//       infoContentType.innerHTML = this.getContentType(LatLngAndInfo.attr.contentTypeId);
//       infoContentType.classList.add("small-font");
//       let infoReview = document.createElement("a");
//       infoReview.innerHTML = "리뷰 보기 >";
//       infoReview.classList.add("small-font", "none-deco", "text-right", "d-block", "pr-2");

//       let infoRight = document.createElement("div");
//       infoRight.classList.add("p-2");
//       let infoImg = document.createElement("img");
//       infoImg.src = LatLngAndInfo.attr.firstImage;
//       infoImg.width = 100;
//       infoImg.style = "aspect-ratio:1";

//       infoLeftBottom.append(infoContentType, infoAddr, infoReview);
//       infoLeft.append(infoTitle, infoLeftBottom);
//       infoLeft.classList.add(
//         "p-1",
//         "pl-3",
//         "pr-3",
//         "row",
//         "flex-column",
//         "flex-wrap",
//         "justify-content-between"
//       );

//       infoRight.append(infoImg);
//       infoRowTop.append(infoLeft, infoRight);
//       infoContent.append(infoRowTop, infoRowBottom);

//       this.curWindow = new window.kakao.maps.InfoWindow({
//         position: pos,
//         content: infoContent,
//       });

//       this.curWindow.open(this.map);
//     }
</script>

<style scoped lang="scss">
::v-deep {
  #info-container {
    margin-top: 1px;
  }
}

// #map {
//   background-color: black;
//   margin: 0;
//   padding: 0;
// }
// .map-btn:hover,
// .map-btn button:hover,
// .map-btn button svg:hover {
//   color: rgba(0, 0, 0, 0.7);
// }
// .map-btn:focus,
// .map-btn button:focus,
// .map-btn button svg:focus {
//   color: rgba(0, 0, 0, 0.7);
// }

// .chatting-header {
//   width: 20%;
//   text-align: left;
//   border-top-left-radius: 10px;
//   border-top-right-radius: 10px;
//   border: 1px solid rgba(33, 33, 53, 0.4);
//   padding: 6px 10px;
//   background-color: white;
//   // border-bottom-left-radius: 10px;
//   // border-bottom-right-radius: 10px;
// }

// .moveable-control-box {
//   --moveable-color: transparent !important;
// }

// :deep(.attr-title) {
//   font-family: "NanumSquareNeo-ExtraBold" !important;
// }
// :deep(.attr) {
//   font-family: "NanumSquareNeo-Thin";
// }
// :deep(.small-font) {
//   font-size: smaller;
//   margin: 0px;
//   padding: 0px;
// }
// :deep(.none-deco, .none-deco:hover) {
//   text-decoration: none;
// }
// :deep(.moveable-control.moveable-origin, .moveable-control, .moveable-origin) {
//   border-color: transparent !important;
//   background: transparent !important;
// }
// :deep(.btn-rad) {
//   border-radius: 20px;
// }
//
</style>
