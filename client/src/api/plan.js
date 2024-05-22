import { Axios } from "@/util/http-commons.js";
const http = Axios();

function registPlanner(plan, success, fail) {
  http.get(`/plan`, { params: plan }).then(success).catch(fail);
}

async function getPlannerList(loginId, success, fail) {
  console.log("함수 실행");
  await http.get(`/plan/list/${loginId}`).then(success).catch(fail);
}

async function getPlanInfo(planNo, success, fail){
  await http.get(`/plan/info/${planNo}`).then(success).catch(fail);
}

async function getPlanMemo(memo, success, fail){
  await http.put(`/plan/memo/${memo.memberId}`, memo).then(success).catch(fail);
}


export{getPlannerList, getPlanInfo, getPlanMemo}