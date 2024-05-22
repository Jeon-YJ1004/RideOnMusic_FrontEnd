<script>
import { defineComponent } from "vue";
import { Carousel, Pagination, Slide } from "vue3-carousel";
import home_1 from "@/assets/img/banner1.jpg";
import home_2 from "@/assets/img/banner2.jpg";
import home_3 from "@/assets/img/banner3.jpg";

import "vue3-carousel/dist/carousel.css";

export default defineComponent({
	name: "AutoPlay",
	components: {
		Carousel,
		Slide,
		Pagination,
	},
	data() {
		return {
			slides: [home_1, home_2, home_3],
		};
	},
});
</script>

<template>
    <div class="banner">
        <!-- 배너 수정중 -->
        <div class="wrapper">
            <Carousel :autoplay="3000" :wrap-around="true">
                <Slide v-for="slide in slides" :key="slide">
                    <div class="carousel__item">
                        <img class="slideImg" :src="slide" />
                    </div>
                </Slide>

                <template #addons>
                    <Pagination class="custom-pagination"/>
                </template>
            </Carousel>
        </div>
        <!-- 수정끝 -->

        <!-- 배경 색상과 불투명도를 가진 섹션 -->
        <div class="background-color-section">

            <!--배너 부분 끝-->
            <div class="container mt-5">
                <div class="container mt-5">
                    <div class="row g-4">
                        <!-- 이미지 반복 시작 -->
                        <div class="col-3">
                            <div class="square-image">
                                <img src="/src/assets/img/bg4.jpg" class="img-fluid" alt="Image">
                            </div>
                        </div>
                        <!-- 이미지 9개에 대해 위의 div를 반복 -->
                        <div class="col-3">
                            <div class="square-image">                        
                                <img src="/src/assets/img/bg4.jpg" class="img-fluid" alt="Image">
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="square-image">
                                <img src="/src/assets/img/bg4.jpg" class="img-fluid" alt="Image">
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="square-image">                        
                                <img src="/src/assets/img/bg4.jpg" class="img-fluid" alt="Image">
                            </div>
                        </div>


                        <!-- 더 많은 이미지 컬럼 추가 -->
                    </div>
                </div>

            <div class="text-center">
                <button class="btn btn-primary">핫플 이동하기</button>
            </div>
        </div>
    </div>

</div>
</template>

<style scoped>
@import "/src/assets/css/common.css"
/* @import '/src/assets/css/member.css' */
</style>