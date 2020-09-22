# socket-io real-time chat + notifications demo

# usage
front-end
```
cd client
npm install
npm run serve
```
back-end
```
cd server
npm install
npm start
```
---
For the front-end I used vue.js

if you are not familiar with it, all you need to look at is
```
/src
----main.js
----App.vue
----/views
```

# Note
since the front-end and the server are running on diffrent ports, you might run into some CORS problems, to solve that please use a browser extention like [this](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino/)