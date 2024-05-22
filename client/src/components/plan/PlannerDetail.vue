<script setup>
import "@/assets/css/board.css";
import "@/assets/css/plan_list.css";
import { ref, onMounted, computed , watch } from "vue";
import { useRoute } from "vue-router";
import { useMemberStore } from "@/stores/memberStore.js";
import { storeToRefs } from "pinia"
import { getPlanInfo, getPlanMemo } from "@/api/plan.js";

const appKey = import.meta.env.VITE_KAKAO_APPKEY;

const router = useRoute();
const planner = ref({});
const planNo = router.params.planNo;
const memoText = ref('')
const memberStore = useMemberStore();
const { userInfo} = storeToRefs(memberStore);


// const planner = props.planner;
// console.log(planner.planNo);
// console.log(planner.memberId);

const addedPlaces = ref([]);
var markers = [];
var overlays = [];
var positions = [];
let map = null;
var polyline; // 선을 담는 변수

const loadScript = () => {
  const script = document.createElement("script");
  /* global kakao */
  script.onload = () => kakao.maps.load(initMap);
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}&libraries=services,clusterer,drawing`;
  document.head.appendChild(script);
};

const initMap = () => {
  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(37.566535, 126.9779692),
    level: 7
  };

  map = new kakao.maps.Map(mapContainer, mapOption);

  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
};

const createMarkers = (trips) => {
  const bounds = new kakao.maps.LatLngBounds();
  removeMarker();
  removeDraw();

  trips.forEach((trip) => {
    const placePosition = new kakao.maps.LatLng(trip.latitude, trip.longitude);
    if (trip.firstImg == "") {
      trip.firstImg = "/src/assets/img/preparingimg.jpg";
    }
    const position = {
      contentId: trip.contentId,
      title: trip.title,
      addr: trip.addr1,
      img: trip.firstImg,
      content: '<div class="info"><div class="title">' + trip.title + "</div></div>",
      latlng: placePosition
    };
    addMarker(position);
    bounds.extend(placePosition);
  });
  map.setBounds(bounds);
};

const addMarker = (position) => {
    console.log(1);
    var imageSrc = "/src/assets/img/marker7.png",
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
        content: position.content // 인포윈도우에 표시할 내용
    });

    console.log(2);
  addedPlaces.value.push({
    contentId: position.contentId,
    title: position.title,
    addr: position.addr,
    img: position.img,
    latitude: position.latlng.La,
    longitude: position.latlng.Ma
  });
  viewPlanAndDraw();

  kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
  kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
  kakao.maps.event.addListener(marker, 'click', () => scrollToTimeline(position.contentId));

  marker.setMap(map);
  markers.push(marker);
  console.log(position);
};


const scrollToTimeline = (contentId) => {
  const timelineElement = document.getElementById(`trip-${contentId}`);
  if (timelineElement) {
    timelineElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const viewPlanAndDraw = () => {
  if (addedPlaces.value.length >= 2) {
    drawLine();
  } else {
    removeDraw();
  }
};

const makeOverListener = (map, marker, infowindow) => {
  return function () {
    infowindow.open(map, marker);
  };
};

const makeOutListener = (infowindow) => {
  return function () {
    infowindow.close();
  };
};

const removeMarker = () => {
  markers.forEach(marker => marker.setMap(null));
  markers.length = 0;
  addedPlaces.value.length = 0;
};

const removeDraw = () => {
  if (polyline) {
    polyline.setMap(null);
  }
};

const drawLine = () => {
  const linePath = addedPlaces.value.map(place => new kakao.maps.LatLng(place.latitude, place.longitude));
  removeDraw();

  polyline = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 4,
    strokeColor: '#808000',
    strokeOpacity: 1,
    strokeStyle: 'solid'
  });

  polyline.setMap(map);
};

const adjustTimelineHeight = () => {
  const timeline = document.querySelector('.main-timeline');
  const timelineHeight = timeline.scrollHeight;
  const styleId = 'dynamic-timeline-style';
  let existingStyle = document.getElementById(styleId);

  if (!existingStyle) {
    existingStyle = document.createElement('style');
    existingStyle.id = styleId;
    document.head.appendChild(existingStyle);
  }

  existingStyle.textContent = '.main-timeline::after {height:' + timelineHeight + 'px;}';
};

const editMemo = (contentId) => {
  const displayDiv = document.getElementById('memo-text-' + contentId);
  const editDiv = document.getElementById('memo-edit-' + contentId);
  displayDiv.style.display = 'none';
  editDiv.style.display = 'block';
};

const saveMemo = (planNo, contentId) => {
  const memoInput = document.getElementById('memo-input-' + contentId).value;
  const memo = {
        planNo : planNo,
        contentId : contentId,
        memoText : memoInput,
        memberId : userInfo.value.memberId,
    }

    getPlanMemo(memo, ({data}) => {
        alert("메모가 등록되었습니다");
        const tripIndex = planner.value.trips.findIndex(trip => trip.contentId === contentId);
        if (tripIndex !== -1) {
          // Vue 반응성을 활용하여 값 업데이트
          planner.value.trips[tripIndex].memoText = memoInput;
        }
        }, (error) => console.log(error))

};

onMounted( async() => {
    await getPlanInfo(planNo, ({data}) => {
        planner.value = data.data;
    }, (error) => console.log(error));

    if (window.kakao && window.kakao.maps) {
        initMap();
        createMarkers(planner.value.trips);
        adjustTimelineHeight();
    } else {
        loadScript();
    }

});





</script>

<template>
<div class="container" id="list-container">
      <div class="row justify-content-center gx-5">
        <div class="row three justify-content-between align-items-center" style="margin-bottom: 30px">
          <div class="col-md-6">
          </div>
          <div class="col-md-6 text-end">
            <p v-if="planner.transport === 'public'">이동 수단: 대중교통</p>
            <p v-else>이동 수단: 자가용</p>
            <p>여행 일정: {{ planner.startDate }} ~ {{ planner.endDate }}</p>
          </div>
        </div>
        <div class="content col-md-6">
          <div id="map" style="height: 100%; overflow-y: auto;"></div> <!-- 지도 영역 -->
        </div>
        <div class="content col-md-6"> <!-- 타임라인 영역 -->
          <div class="main-timeline" style="height: 100%; overflow-y: auto;">
            <div v-for="(trip, index) in planner.trips" :key="trip.contentId" :class="['timeline', index % 2 === 0 ? 'left' : 'right']" :id="'trip-' + trip.contentId">
              <div class="card">
                <div class="card-body">
                  <div class="img-area">
                    <div class="inner-area">
                      <img :src="trip.firstImg ? trip.firstImg : '/img/preparingimg.jpg'" />
                    </div>
                    <div id="memo-title">{{ trip.title }}</div>
                    <div :id="'memo-text-' + trip.contentId" class="memo-text scrollbar">
                      <div class="scrollbar">{{ trip.memoText }}</div>
                    </div>
                    <div :id="'memo-edit-' + trip.contentId" class="memo-edit scrollbar" style="display: none;">
                        <textarea class="overview scrollbar" :id="'memo-input-' + trip.contentId" v-model="trip.memoText"></textarea>
                    </div>
                    <div class="button-container">
                      <img src="/src/assets/img/edit.png" class="btn-icon" @click="editMemo(trip.contentId)" alt="Edit">
                      <img src="/src/assets/img/save.png" class="btn-icon" @click="saveMemo(planner.planNo, trip.contentId)" alt="Save">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.three h1 {
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1.5em;
    padding-bottom: 15px;
    position: relative;
}

.three h1:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 5px;
    width: 55px;
    background-color: #111;
}

.three h1:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 2px;
    height: 1px;
    width: 95%;
    max-width: 255px;
    background-color: #333;
}

.container {
    margin-top: 150px; /* 상단 마진 설정 */
    margin-bottom: 300px; /* 하단 마진 설정 */
    padding: 20px; /* 내부 컨텐츠와의 공간을 위해 패딩 설정 가능 */
}

@media ( max-width: 600px) {
    .container {
        margin-top: 20px; /* 모바일 화면에서의 상단 마진 설정 */
        margin-bottom: 20px; /* 모바일 화면에서의 하단 마진 설정 */
        padding: 10px;
    }
}

/* 전체 조회 컨테이너 */
#list-container {
    margin-top: 150px; /* 상단 마진 설정 */
    margin-bottom: 100px; /* 하단 마진 설정 */
    padding: 20px; /* 내부 컨텐츠와의 공간을 위해 패딩 설정 가능 */
}

.content {
    height: 500px; /* 고정 높이 설정 */
    /*overflow: hidden; !* 외부로 넘치는 내용 숨김 *!*/
    overflow-y: auto; /* 세로 스크롤 허용 */
}

#map {
    height: 100%; /* 부모 컨테이너의 높이와 일치 */
    overflow-y: auto; /* 세로 스크롤만 허용 */
}

.main-timeline {
    height: 100%; /* 부모 컨테이너의 높이와 일치 */
    overflow-y: auto; /* 세로 스크롤만 허용 */
    padding: 10px; /* 내부 패딩 조정 */
    position: relative; /* 상대적 위치 */
}

html {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

html::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
}

.map-container {
    position: sticky;
    top: 0;
    height: 300px; /* 원하는 높이로 조절 */
}

.tripList {
    display: grid;
    margin-left: 22%;
    transform: translateX(-13%);
}

.tripList > div:nth-child(even) {
    justify-self: end;

}

.overview {
    width: 100%;
    height: 100px;
    overflow: auto;
    background: #f6f6f6;
    border: none;
}

#memo-title {
    padding-top: 10px;
    padding-left: 5px;
}

.memo-text, .memo-edit {
    position: relative;
    height: 120px;
    margin-bottom: 5px;
    /*border: 1px solid #ccc;*/
    padding: 5px;
    background: #f6f6f6;
    overflow-y: scroll;
    overflow-x: auto;
}

.memo-text::-webkit-scrollbar, .memo-edit::-webkit-scrollbar {
    display: none;
}

.scrollbar {
    /*width: 250px;*/
    /*height: 250px;*/
    overflow-y: scroll; /*  */
    overflow-x: hidden; /*  */

}

.button-container {
    text-align: right;
    padding: 5px;
}

.btn-icon {
    cursor: pointer;
    width: 24px;
    height: 24px;
    margin-left: 10px;
}


/* 여행 계획쪽 스크롤 */
.scrollbar::-webkit-scrollbar {
    display: none;
}

.main-timeline::-webkit-scrollbar {
    display: none;
}

/*.scrollbar::-webkit-scrollbar-thumb {*/
/*    background: rgba(154, 157, 72); !* 스크롤바 색상 *!*/
/*    border-radius: 10px; !* 스크롤바 둥근 테두리 *!*/
/*}*/

/*.scrollbar::-webkit-scrollbar-track {*/
/*    background: rgba(154, 157, 72, .1); !*스크롤바 뒷 배경 색상*!*/
/*}*/


/* .wrapper,
.wrapper .img-area,
.buttons button{
  background: #ecf0f3;
  box-shadow: -3px -3px 7px #ffffff,
               3px 3px 5px #ceced1;
}
 */
.wrapper {
    position: relative;
    width: 350px;
    padding: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 30px;
}


.wrapper .img-area {
    height: 150px;
    width: 150px;
    border-radius: 30%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.img-area .inner-area {
    height: calc(100% - 25px);
    width: calc(100% - 25px);
    border-radius: 3%;
}

.inner-area img {
    height: 100%;
    width: 100%;
    border-radius: 3%;
    object-fit: cover;
}

.wrapper .name {
    font-size: 23px;
    font-weight: 500;
    color: #31344b;
    margin: 10px
}

.planHeader h1 {
    text-align: center;
    font-size: 50px;
    text-transform: uppercase;
    color: #222;
    letter-spacing: 1px;
    font-family: "Playfair Display", serif;
    font-weight: 400;
}

.planHeader h1 span {
    /*margin-top: 5px;*/
    font-size: 15px;
    color: #444;
    word-spacing: 1px;
    font-weight: normal;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: "Raleway", sans-serif;
    font-weight: 500;

    display: grid;
    grid-template-columns: 1fr max-content 1fr;
    grid-template-rows: 27px 0;
    grid-gap: 20px;
    align-items: center;
}

.planHeader h1 span:after, .planHeader h1 span:before {
    content: " ";
    display: block;
    border-bottom: 1px solid #ccc;
    border-top: 1px solid #ccc;
    height: 5px;
    /*   background-color:#f8f8f8; */
}


/* The actual timeline (the vertical ruler) */
.main-timeline {
    position: relative;
    padding: 10px; /* 내부 패딩 조정 */
}

/* The actual timeline (the vertical ruler) */
/* 타임라인 막대기 동적 결정 */
.main-timeline::after {
    content: "";
    position: absolute;
    width: 6px;
    background-color: #939597;
    top: 0;
    bottom: 0;
    left: 50%;
    margin-left: -3px;
}

/* Container around content */
.timeline {
    position: relative;
    /*   background-color: inherit; */
    width: 50%;
}

/* The circles on the timeline */
.timeline::after {
    content: "";
    position: absolute;
    width: 25px;
    height: 25px;
    right: -13px;
    background-color: #939597;
    border: 5px solid #f5df4d;
    top: 15px;
    border-radius: 50%;
    z-index: 1;
}

/* Place the container to the left */
.left {
    padding: 0px 40px 20px 0px;
    left: 0;
}

/* Place the container to the right */
.right {
    padding: 0px 0px 20px 40px;
    left: 50%;
}

/* Add arrows to the left container (pointing right) */
.left::before {
    content: " ";
    position: absolute;
    top: 18px;
    z-index: 1;
    right: 30px;
    border: medium solid white;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent white;
}

/* Add arrows to the right container (pointing left) */
.right::before {
    content: " ";
    position: absolute;
    top: 18px;
    z-index: 1;
    left: 30px;
    border: medium solid white;
    border-width: 10px 10px 10px 0;
    border-color: transparent white transparent transparent;
}

/* Fix the circle for containers on the right side */
.right::after {
    left: -12px;
}

/* Media queries - Responsive timeline on screens less than 600px wide */
@media screen and (max-width: 600px) {
    /* Place the timelime to the left */
    .main-timeline::after {
        left: 31px;
    }

    /* Full-width containers */
    .timeline {
        width: 100%;
        padding-left: 70px;
        padding-right: 25px;
    }

    /* Make sure that all arrows are pointing leftwards */
    .timeline::before {
        left: 60px;
        border: medium solid white;
        border-width: 10px 10px 10px 0;
        border-color: transparent white transparent transparent;
    }

    /* Make sure all circles are at the same spot */
    .left::after,
    .right::after {
        left: 18px;
    }

    .left::before {
        right: auto;
    }

    /* Make all right containers behave like the left ones */
    .right {
        left: 0%;
    }
}

</style>