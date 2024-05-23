<script setup>
import { ref } from "vue";

const emit = defineEmits(["invite-member"]);
const friendId = ref("");
const inviteMember = () => {
  console.log(friendId.value);
  emit("inviteMember", friendId.value);
};
</script>

<template>
  <div>
    <div
      size="md"
      id="btn-invite"
      data-bs-toggle="modal"
      data-bs-target="#creatPLModal"
      style="width: auto"
    >
      <img src="@/assets/img/spotify.png" width="30px" class="sidebarBtn" />
    </div>

    <template class="modal fade" id="creatPLModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-dark" style="height: 200px">
          <div class="modal-body registration-form">
            <h4><img src="@/assets/img/headphone.png" style="width: 35px" /> 친구 초대하기</h4>

            <div id="planner_body" class="registration-form">
              <div class="form-group" style="width: 300px">
                <input
                  id="sendedPushMember"
                  type="text"
                  v-model="friendId"
                  placeholder="초대할 멤버 ID 입력"
                  aria-label="초대할 멤버 ID 입력"
                  class="form-control item"
                />
              </div>
            </div>
            <div class="modal-footer mt-3">
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary me-2"
                  data-bs-dismiss="modal"
                  @click="inviteMember"
                >
                  초대하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.registration-form .item {
  border-radius: 20px;
  margin-bottom: 10px;
  padding: 10px 10px;
  height: 40px;
}
.sidebarBtn:hover {
  transition: all 0.2s linear;
  transform: scale(1.3);
}
</style>
