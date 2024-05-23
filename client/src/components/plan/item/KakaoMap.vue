<script setup>
import { onMounted, watch, defineExpose } from "vue";
import { Axios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { chatService, socket, handleSocketMessage, addedPlaces } from "@/services/ChatService.js";
import { storeToRefs } from "pinia";
import store from "@/stores";

const planStore = store.usePlanStore();
const { course } = storeToRefs(planStore);

const props = defineProps({
  keyword: String,
  places: Object,
});

const markerImg = "/src/assets/img/marker7.png";
const preparingImg = "/src/assets/img/preparingimg.jpg";
const appKey = import.meta.env.VITE_KAKAO_APPKEY;

var markers = [];
var overlays = [];
var positions = [];
let map = null;
var polyline; // 선을 담는 변수

watch(
  () => props.places,
  (places) => {
    setMarkers(places);
  }
);

watch(
  () => course.value,
  (newPlaces, oldPlaces) => {
    console.log(course.value);
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

const setMarkers = (places) => {
  var bounds = new kakao.maps.LatLngBounds();
  resetMarkers();
  removeDraw();
  for (var i = 0; i < places.length; i++) {
    var placePosition = new kakao.maps.LatLng(places[i].latitude, places[i].longitude);
    if (places[i].firstImg == "") {
      places[i].firstImg = preparingImg;
    }
    positions.push({
      contentId: places[i].contentId,
      idx: i,
      title: places[i].title,
      addr: places[i].addr1,
      img: places[i].firstImg,
      //TODO: 이 부분도 컴포넌트로 뺄 수 있나..?
      content:
        '<div class="info">' +
        '<div class="title">' +
        places[i].title +
        "</div>" +
        '<div class="body">' +
        '<div class="img">' +
        '<img src="' +
        places[i].firstImg +
        '" width="80" height="70">' +
        "</div>" +
        "</div>" +
        '<div class="desc">' +
        '<div class="ellipsis">' +
        places[i].addr1 +
        "</div>" +
        '<div class="jibun ellipsis">' +
        places[i].addr2 +
        "</div>" +
        "</div>" +
        "</div>",
      latlng: placePosition,
    });
    addMarker(positions[i]);
    bounds.extend(placePosition);
  }
  map.setBounds(bounds);
};

const addMarker = (position) => {
  var imageSrc = markerImg,
    imageSize = new kakao.maps.Size(80, 80),
    imgOptions = {
      spriteSize: new kakao.maps.Size(45),
      spriteOrigin: new kakao.maps.Point(0, 0),
      offset: new kakao.maps.Point(25, 25),
    },
    markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
    marker = new kakao.maps.Marker({
      position: position.latlng, // 위도(latitude), 경도(longitude) 순서로 전달
      image: markerImage,
    });

  var infowindow = new kakao.maps.InfoWindow({
    content: position.content, // 인포윈도우에 표시할 내용
  });

  kakao.maps.event.addListener(marker, "click", function () {
    addPlace(position);
  });

  kakao.maps.event.addListener(marker, "mouseover", makeOverListener(map, marker, infowindow));
  kakao.maps.event.addListener(marker, "mouseout", makeOutListener(infowindow));

  marker.setMap(map);
  markers.push(marker);
};

// 장소 추가 함수
const addPlace = (position) => {
  console.log("position");
  console.log(position);
  if (duplicateCheck(position)) {
    addedPlaces.value.push({
      contentId: position.contentId,
      idx: position.idx,
      title: position.title,
      addr: position.addr,
      img: position.img,
      latitude: position.latlng.La,
      longitude: position.latlng.Ma,
    });

    updateMap();
    course.value.push({
      contentId: position.contentId,
      idx: position.idx,
      title: position.title,
      addr: position.addr,
      img: position.img,
      latitude: position.latlng.La,
      longitude: position.latlng.Ma,
    });
  }
  sendPathUpdate();
};

const sendPathUpdate = () => {
  socket.send(
    JSON.stringify({
      type: "path",
      contents: addedPlaces.value,
    })
  );
};

// 중복 검사 함수
const duplicateCheck = (position) => {
  return !course.value.some((place) => place.contentId === position.contentId);
};

// 지도 업데이트 함수
const updateMap = () => {
  console.log("updateMap");
  console.log(course.value);
  if (course.value.length >= 2) {
    drawLine();
  } else {
    removeDraw();
  }
};

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
const makeOverListener = (map, marker, infowindow) => {
  return function () {
    infowindow.open(map, marker);
  };
};

// 인포윈도우를 닫는 클로저를 호출
const makeOutListener = (infowindow) => {
  return function () {
    infowindow.close();
  };
};

// 지도 위에 표시되고 있는 마커,오버레이 모두 제거
const resetMarkers = () => {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }

  for (var i = 0; i < overlays.length; i++) {
    overlays[i].setMap(null);
  }

  markers = [];
  positions = [];
  addedPlaces.value = [];
};

const drawLine = () => {
  var linePath = course.value.map((place) => {
    return new kakao.maps.LatLng(place.longitude, place.latitude);
  });

  removeDraw(); // 기존 선을 제거
  polyline = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 4,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeStyle: "solid", //실선
  });

  polyline.setMap(map);
};
const setMarker = (LatLngAndInfo) => {
  kakaomap.value.setMarker(LatLngAndInfo);
};

// 모든 선을 지도에서 제거
const removeDraw = () => {
  if (polyline) {
    polyline.setMap(null);
  }
};

onMounted(() => {
  course.value = [];
});

defineExpose({ initMap, setMarker, setMarkers, resetMarkers, addPlace });
</script>

<template>
  <div id="map" style="height: 75vh; width: 90vw"></div>
</template>

<style scoped>
.ch {
  background-color: aqua;
}

.wrap * {
  padding: 0;
  margin: 0;
}

.info {
  width: 286px;
  height: 120px;
  border-radius: 5px;
  border-bottom: 2px solid #ccc;
  border-right: 1px solid #ccc;
  overflow: hidden;
  background: #fff;
}

.wrap .info:nth-child(1) {
  border: 0;
  box-shadow: 0px 1px 2px #888;
}

.info .title {
  padding: 5px 0 0 10px;
  height: 30px;
  background: #eee;
  border-bottom: 1px solid #ddd;
  font-size: 18px;
  font-weight: bold;
}

.info .close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #888;
  width: 17px;
  height: 17px;
  background: url("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png");
}

.info .close:hover {
  cursor: pointer;
}

.info .body {
  display: inline;
  position: relative;
  overflow: hidden;
}

.info .desc {
  position: relative;
  margin: 13px 0 0 90px;
  height: 75px;
}

.desc .ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc .jibun {
  font-size: 11px;
  color: #888;
  margin-top: -2px;
}

.info .img {
  position: absolute;
  top: 6px;
  left: 5px;
  width: 73px;
  height: 71px;
  border: 1px solid #ddd;
  color: #888;
  overflow: hidden;
}

.info:after {
  content: "";
  position: absolute;
  margin-left: -12px;
  left: 50%;
  bottom: 0;
  width: 22px;
  height: 12px;
  background: url("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png");
}

.info .link {
  color: #5085bb;
}

/* @import "/src/assets/css/tourist_spot.css" */

/* #map {
  flex: 1;
} */

/* 드래그 부분 */
.drag-handle {
  cursor: move; /* 드래그 가능한 커서 스타일 */
  padding: 10px;
  margin-bottom: 5px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.drag-handle img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.drag-handle button {
  margin-left: auto;
}
</style>
