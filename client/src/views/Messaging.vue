<template>
  <div class="messaging">
    <div class="inbox_msg">
      <div class="inbox_people">
        <div class="headind_srch">
          <div class="recent_heading">
            <h4>Online Users</h4>
          </div>
        </div>
        <div class="inbox_chat">
          <div @click="setActiveUser(user.id)" :class="`chat_list ${user.id == activeUserId ? 'active_chat':''}`" v-for="user of onlineUsers" v-bind:key="user.id">
            <div class="chat_people">
              <div class="chat_img">
                <img :src="`https://api.adorable.io/avatars/189/${user.username}`" :alt="user.username" />
              </div>
              <div class="chat_ib">
                <h5>
                  {{user.username}}
                  <!--span class="chat_date"></span-->
                </h5>
                <p>
                  user ID: [{{user.id}}]
                </p>
              </div>
            </div>
          </div>
            <h1 v-if="onlineUsers.length == 0">No online users 😔✌️</h1>
        </div>

      </div>
      <div class="mesgs"  v-if="activeUserId">
        <div class="msg_history">
          <template v-for="message of messagesHistory">
              <div class="incoming_msg" v-if="message.senderId==activeUserId" v-bind:key="message.createdAt">
                <div class="incoming_msg_img">
                  <img :src="`https://api.adorable.io/avatars/189/${onlineUsers.find(u=>u.id==activeUserId).username}`" />
                </div>
                <div class="received_msg">
                  <div class="received_withd_msg">
                    <p>
                      {{message.content}}
                    </p>
                    <span class="time_date">{{new Date(message.createdAt).toLocaleTimeString()}}</span>
                  </div>
                </div>
              </div>
              <div class="outgoing_msg" v-if="message.senderId==$parent.user.id" v-bind:key="message.createdAt">
                <div class="sent_msg">
                  <p>
                    {{message.content}}
                  </p>
                  <span class="time_date">{{new Date(message.createdAt).toLocaleTimeString()}}</span>
                </div>
              </div>
          </template>
          <h1 v-if="messagesHistory.length == 0">No messages 😔✌️</h1>
        </div>
        <div class="type_msg">
          <div class="input_msg_write">
            <input @keyup.enter="sendMessage()" v-model="inputValue" type="text" class="write_msg" placeholder="Type a message" />
            <button @click="sendMessage()" class="msg_send_btn" type="button">
              <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="mesgs" v-if="!activeUserId">
          <h1>Click on a user from the side bar</h1>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Messaging',
  data() {
    return {
      onlineUsers: [],
      activeUserId: null,
      messagesHistory: [],
      inputValue: '',
      chatNS: null,
    }
  },
  methods: {

    joinChatNameSpace: async function () {
      // connect to the chat NameSpace
      this.chatNS = await this.$socket(this.$BaseURL + '/chat');
      const identify = () => {
        this.chatNS.emit('IDENTIFY', this.$parent.user);
      }
      this.$parent.onNameSpaceCreate(this.chatNS, identify) // this will take care of reconnecting the ws, see App.vue
    },

    setActiveUser: function (userId) {
      this.activeUserId = userId;
      this.messagesHistory = [];
      this.inputValue = '';
      this.chatNS.emit('JOIN_ROOM', { roomId: this.getRoomId() }); // room id needs to be unique and consistent
      this.chatNS.on('INCOMING_MESSAGE', messageData => {
        this.messagesHistory.push(messageData)
      })
    },

    sendMessage: function () {
      this.chatNS.emit('NEW_MESSAGE', { 
        roomId: this.getRoomId(),
        senderId: this.$parent.user.id,
        receiverId: this.activeUserId, // this should never be here, just because I dont have a db on the server
        content: this.inputValue,
        createdAt: Date.now()
      });
      this.inputValue = '';
    },

    fetchOnlineUsers: function () {
      this.$axios
        .get(`${this.$BaseURL}/onlineusers`)
        .then((response) => this.onlineUsers = response.data.filter(u=>u.id!=this.$parent.user.id),
              (error)=> console.log(error)
        )
    },

    getRoomId: function () {
      return [this.$parent.user.id, this.activeUserId].sort().join('-') // this will generate same id even if users order was different
    },

  },

  mounted() {
    if (!this.$parent.user){
      this.$alertify.error('Please login first')
      this.$router.push('/')
      return
    } 
    this.joinChatNameSpace();

    setInterval(() => {
      this.fetchOnlineUsers();
    }, 1000); // just for testing

  },

  destroyed() {
    this.chatNS.disconnect() // VERY important! or user will not receive notifications from the last room they were in
  }

}
</script>


<style scoped>
.container {
  max-width: 1170px;
  margin: auto;
  height: 100%;
}
img {
  max-width: 100%;
  border-radius: 100%;
}
.inbox_people {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
  height: 100%;
}
.inbox_msg {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
  height: 100%;
}
.top_spac {
  margin: 20px 0 0;
}

.recent_heading {
  float: left;
  width: 40%;
}
.srch_bar {
  display: inline-block;
  text-align: right;
  width: 60%;
}
.headind_srch {
  padding: 10px 29px 10px 20px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}
.srch_bar input {
  border: 1px solid #cdcdcd;
  border-width: 0 0 1px 0;
  width: 80%;
  padding: 2px 0 4px 6px;
  background: none;
}
.srch_bar .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}
.srch_bar .input-group-addon {
  margin: 0 0 0 -27px;
}

.chat_ib h5 {
  font-size: 15px;
  color: #464646;
  margin: 0 0 8px 0;
}
.chat_ib h5 span {
  font-size: 13px;
  float: right;
}
.chat_ib p {
  font-size: 14px;
  color: #989898;
  margin: auto;
}
.chat_img {
  float: left;
  width: 11%;
}
.chat_ib {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.chat_people {
  overflow: hidden;
  clear: both;
}
.chat_list {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}
.inbox_chat {
  height: 100%;
  overflow-y: scroll;
}

.active_chat {
  background: #ebebeb;
}

.incoming_msg_img {
  display: inline-block;
  width: 6%;
}
.received_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
}
.received_withd_msg p {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.time_date {
  color: #747474;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}
.received_withd_msg {
  width: 57%;
}
.mesgs {
  float: left;
  padding: 30px 15px 0 25px;
  width: 60%;
  height: 80%;
}

.sent_msg p {
  background: #05728f none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0;
  color: #fff;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.outgoing_msg {
  overflow: hidden;
  margin: 26px 0 26px;
}
.sent_msg {
  float: right;
  width: 46%;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}

.type_msg {
  border-top: 1px solid #c4c4c4;
  position: relative;
}
.msg_send_btn {
  background: #05728f none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0;
  top: 11px;
  width: 33px;
}
.messaging {
  padding: 0 0 70px 0;
  height: 100%;
}
.msg_history {
  height: 100%;
  overflow-y: auto;
}
</style>