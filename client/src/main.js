import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueAlertify from 'vue-alertify';
import axios from 'axios'
// impotring socket.io client library
import io from 'socket.io-client'


Vue.prototype.$axios = axios
Vue.prototype.$BaseURL = 'http://localhost:3000'
Vue.use(VueAlertify);

// this is just so I can use it globaly
Vue.prototype.$socket = io

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
