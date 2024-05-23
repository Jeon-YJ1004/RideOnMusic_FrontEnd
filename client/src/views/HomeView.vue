<script>
import { defineComponent } from "vue";
import { Carousel, Pagination, Slide } from "vue3-carousel";
import home_1 from "@/assets/img/banner1.jpg";
import home_2 from "@/assets/img/banner2.jpg";
import home_3 from "@/assets/img/banner3.jpg";
import home_4 from "@/assets/img/banner4.jpg";

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
			slides: [home_1, home_2, home_3, home_4],
		};
	},
});
</script>

<template>
    <div class="banner">
        <!-- 배너 수정중 -->
        <div class="wrapper">
                <div class="lb-wrap">
                    <div class="lb-text">
                        <p class="banner-text">Ride On Music.</p>
                    </div>
                </div>
            <Carousel :autoplay="6000" :wrap-around="true">

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
</div>
</template>

<style scoped>
@import "/src/assets/css/common.css"
/* @import '/src/assets/css/member.css' */
</style>