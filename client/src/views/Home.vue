<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-12">
      <h1 class="text-secondary">Welcome to this socket.io demo</h1>
      <img src="../assets/abstract-communication.png" class="welcome-img" alt="Welcome image">

    </div>
    <div class="col-md-6" v-if="!this.$parent.user">
      <p>This page will demonstrate the message notification feature.
        Now you are browsing the website, and not in a direct messaging page with another user.<br>
        To start, please login down here. No password! WooHoo</p>
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text">Username</span>
            </div>
            <input @keyup.enter="login()" v-model="username" type="text" class="form-control">
          </div>
          <button @click="login()" class="btn btn-outline-primary">Login</button>
    </div>
    <div class="col-md-6" v-else>
      <p>🎉 You are logged in as <b>{{this.$parent.user.username}}</b>.<br>
      To test the notification feature, stay here and ask someone to send you a message from the <router-link to="/chat">Chat tab</router-link>.<br>
      To send a message to another user, please go to the <router-link to="/chat">Chat tab</router-link>.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      username: null,
    }
  },
  methods: {
    login: function () {
      if (!this.username || this.username.length < 2) return this.$alertify.error("😔✌️ username must be at least 3 characters")
      this.$parent.user = {
        username: this.username,
        id: Math.random().toString(36).substring(7) // random id
      }
      sessionStorage.user = JSON.stringify(this.$parent.user);
      
      // now the user is "logged in", we will join the messages notifications namespace.
      // go to App.vue to find this
      this.$parent.subscribeToNotifications();
    }
  },
}
</script>

<style scoped>
.welcome-img {
  max-width: 40%;
}
.input-group {
  margin: 0 auto;
  max-width: 500px;
}
</style>