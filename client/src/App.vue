<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'Home',
  components: {
    NavBar
  },
  data() {
    return {
      user: /*sessionStorage.user? JSON.parse(sessionStorage.user) : */null,
    }
  },
  methods: {

    onNameSpaceCreate: function (NameSpace, connectCallback) {
      NameSpace.on('connect', () => {
        this.$connected = true
        console.log(`[WS${NameSpace.nsp}]: Connected`);
        if (connectCallback) connectCallback() // call the callback function after the NameSpace is connected
     })

      // this is used to re-establish the ws connection if it was lost
      NameSpace.on('disconnect', () => {
        this.$connected = false
        console.log(`[WS${NameSpace.nsp}]: Disconnected`)
        console.log(`[WS${NameSpace.nsp}]: Trying to reconnect!`)
        let recon = setInterval(() => {
          if(this.$connected) clearInterval(recon)
          NameSpace.connect();
        }, 200);
      })
    },

    subscribeToNotifications: async function () {
      // connect to the notifications NameSpace
      const notificationsNS = await this.$socket(this.$BaseURL + '/notifications');
      const subscribe = () => {
        notificationsNS.emit('IDENTIFY', this.user);
      }
      this.onNameSpaceCreate(notificationsNS, subscribe)
      
      notificationsNS.on('NEW_MESSAGE_NOTIFICATION', notificationData => {
        this.$alertify.success(`You have a new message from ${notificationData.senderName}`)
      })
    }

  },
}
</script>

<style>
#app, body, html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
