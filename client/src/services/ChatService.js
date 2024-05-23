import { ref, reactive } from "vue";
import router from "@/router";

class ChatService {
  constructor() {
    this.ws = null;
    this.callbacks = {};
    this.memberId=null;
  }
  connect() {
    const webSocketUrl = import.meta.env.VITE_WEB_SOCKET_URL;
    // const memberId = sessionStorage.getItem('memberId');
    this.memberId = sessionStorage.getItem('memberId');
    this.ws = new WebSocket(webSocketUrl + `?memberId=${this.memberId}`);

    this.ws.onmessage = (event) => {
      const message = event.data;
      this._notifyCallbacks(message);
    };

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message) {
    if (this.ws) {
      this.ws.send(message);
    }
  }

  registerCallback(callback) {
    const id = new Date().getTime();
    this.callbacks[id] = callback;
    return id;
  }

  unregisterCallback(id) {
    delete this.callbacks[id];
  }

  _notifyCallbacks(message) {
    Object.values(this.callbacks).forEach((callback) => callback(message));
  }
}

const chatService = new ChatService();
chatService.connect()

const addedPlaces = reactive([]);
const places = ref([]);

const handleSocketMessage = (eventData) => {
  const fullPath = router.currentRoute.value.path;
  const lastSegment = fullPath.substring(fullPath.lastIndexOf('/') + 1);
  if (lastSegment === 'joinPlan') {
    if (eventData.type === 'path') {
      console.log(eventData);
      addedPlaces.value = eventData.contents;
      addedPlaces.value
    } else if (eventData.type === 'search') {
      console.log(eventData)
      places.value = eventData.contents;
    } else if (eventData.type === 'plan') {
      console.log(eventData)
      router.push({ name: 'plannerlistJoin' , params:{memberId:eventData.memberId}});
    }
  }

  if (eventData.type === 'invite') {
    console.log(eventData);
    const inviteCheck = confirm(eventData.memberId + "(님) 의 초대 수락?");
    if (inviteCheck) {
      socket.send(JSON.stringify({
        type: 'inviteJoin',
        memberId: eventData.memberId,
        sendedPushMember: eventData.sendedPushMember,
      }));
    }
  }
  else if (eventData.type === 'push'){
    alert("초대 완료");
    router.push({ name: 'plannerRegisterJoin' });
    
   }else if (eventData.type === 'receiver') {
    alert("초대 완료");
    router.push({ name: 'plannerRegisterJoin' });
   }else if(eventData.type === 'inviteError'){
    alert(eventData.errorMsg);
  }
}

const socket = chatService.ws;

export { chatService, socket, handleSocketMessage, addedPlaces, places };
