<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router"
import { Axios } from "@/util/http-commons";
const route = useRoute();
const router = useRouter();
const http = Axios()

var member = ref({
  memberId: "",
  memberPwd: "",
})

// 추가 부분
import { storeToRefs } from "pinia"
import { useMemberStore } from "@/stores/memberStore.js"

const memberStore = useMemberStore()
const { isLogin, isLoginError } = storeToRefs(memberStore)
const { userLogin, getUserInfo , userLogout } = memberStore

const logout = async () => {
  userLogout();
}

const login = async () => {
  await userLogin(member.value)
  if (isLogin.value) {
    const token = sessionStorage.getItem("accessToken");
    getUserInfo(token);
    router.replace("/");
  } else {
    alert("일치하는 회원이 없습니다");
  }
}

onMounted(() => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    getUserInfo(token);
  }
  // else{
  //   userLogout();
  // }
});
</script>

<template>
  <div>
    <div id="header">
    <nav class="navbar navbar-expand-lg navbar-light  shadow fixed-top navbar-custom">
      <div class="container-fluid">
        <!-- 로고를 왼쪽에 위치시키기 위한 div -->
        <div class="navbar-brand-left">
          <router-link :to="{ name: 'home' }" class="navbar-brand fw-bold mr-auto">
            <img src="@/assets/img/banner.jpeg" width="200px" >
          </router-link>
        </div>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 네비게이션 링크 컨테이너 -->
        <div class="collapse navbar-collapse justify-content-center" id="navbarContent">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link :to="{ name: 'plan' }" class="nav-link">플랜 작성하기</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'plannerlist' }" class="nav-link">나의여행계획</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'board' }" class="nav-link">여행정보공유</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'qnaboard' }" class="nav-link">Q&A</router-link>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto">
            <template v-if="isLogin">
              <li class="nav-item">
                <router-link :to="{ name: 'membermypage' }" class="nav-link">마이페이지</router-link>
              </li>
              <li class="nav-item">
                <a class="nav-link" aria-current="page" @click="logout">로그아웃</a>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <router-link :to="{ name: 'memberjoin' }" class="nav-link">회원가입</router-link>
              </li>
              <li class="nav-item">
                <a class="nav-link" aria-current="page" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">로그인</a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </div>


            <!-- // 코드수정 -->

            <!-- <template v-for="menu in menuList" :key="menu.routeName">
            <template v-if="menu.show">
              <template v-if="menu.routeName === 'member-logout'">
                <li class="nav-item">
                  <router-link to="/" @click.prevent="logout" class="nav-link">{{
                    menu.name
                  }}</router-link>
                </li>
              </template>
              <template v-else>
                <li class="nav-item">
                  <router-link :to="{ name: menu.routeName }" class="nav-link">{{
                    menu.name
                  }}</router-link>
                </li>
              </template>
            </template>
          </template> -->
          <!-- // 코드수정 -->


    <!-- 로그인 모달 -->
    <div
      class="modal fade"
      id="loginModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="d-flex justify-content-center">
            <div>
              <h4>로그인</h4>
            </div>
          </div>

          <!-- 입력 폼 -->
          <div class="modal-body">
            <div class="mb-3">
              <label for="loginId">아이디 : </label> <input type="text" name="memberId" class="form-control" id="loginId"
                v-model="member.memberId" required />
              <div class="invalid-feedback">아이디를 입력해주세요.</div>
            </div>

            <div class="mb-3">
              <label for="loginPwd">비밀번호 : </label> <input type="password" name="memberPwd" class="form-control"
                id="loginPwd" v-model="member.memberPwd" required />
              <div class="invalid-feedback">비밀번호를 입력해주세요.</div>
            </div>

            <div class="modal-footer mt-3">
              <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-outline-success me-2" @click="login" data-bs-dismiss="modal">로그인</button>
                <button class="btn btn-outline-success" onclick="location.href='/member/updatePwd'">비밀번호 변경</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 로그인 모달 끝 -->
  </div>
</template>

<style scoped>
@import "/src/assets/css/common.css"
</style>