const app = require("express")();

const server = app.listen(3000, () => {
  console.log("Your app is listening on port " + 3000);
});


/*=======================================*\
*                Socket.io               *
\*=======================================*/
var io = require('socket.io')(server);


// I will use this array to keep track of online users,
// to send them notifications.
// in the real application, we can simply use redis
const onlineUser = []


/*=======================================*\
*    PART 1: notifications               *
\*=======================================*/

// here I am creating the notifications NameSpace
const notificationsNS = io.of('/notifications');

// when a new socket (client) connects to the namespace
notificationsNS.on('connect', (socket) => {
  console.log("new user connected to the notifications NameSpace")
  socket.on('disconnect', () => {
    console.log('user disconnected from the notifications NameSpace');
  });

  // now we will link the notifications socket.id to the user's id, because we will need it to send notifications
  socket.on('IDENTIFY', (user) => {
    user.notificationsSocketId = socket.id
    console.log(`${user.username} subscribed to notifications.`)
    if (!onlineUser.find(u=>u.id==user.id)) onlineUser.push(user)
    else onlineUser.find(u=>u.id==user.id).notificationsSocketId = socket.id
    socket.on('disconnect', () => {
      onlineUser.splice(onlineUser.findIndex(u=>u.id==user.id),1)
    });
  });

})


/*=======================================*\
*    PART 2: chat                        *
\*=======================================*/

// creating the messaging namespace.
const chatNS = io.of('/chat');


chatNS.on('connect', (socket) => {
  console.log("new user connected to the chat NameSpace")
  socket.on('disconnect', () => {
    console.log('user disconnected from the chat NameSpace');
    for (let room in socket.rooms) {
      socket.leave(room)
    }
  });

  socket.on('IDENTIFY', (data) => {
    data.chatSocketId = socket.id
    if (!onlineUser.find(u=>u.id==data.id)) onlineUser.push(data)
    else onlineUser.find(u=>u.id==data.id).chatSocketId = socket.id
  })

  socket.on('JOIN_ROOM', (data) => {
    // leave any other rooms
    for (let room in socket.rooms) {
      socket.leave(room)
    }
    socket.join(data.roomId)
  });

  socket.on('NEW_MESSAGE', (data) => {
    // don't allow them to send to other rooms except the one they are in
    if (!socket.rooms[data.roomId]) return

    // send message to the chat room
    chatNS.to(data.roomId).emit('INCOMING_MESSAGE', data)

    // send notification if user online and not in the same room
    let receiver = onlineUser.find(u=>u.id==data.receiverId)

    if ( receiver && (!chatNS.sockets[receiver.chatSocketId] || !chatNS.sockets[receiver.chatSocketId].rooms[data.roomId])) {
      notificationsNS.to(onlineUser.find(u=>u.id==data.receiverId).notificationsSocketId).emit('NEW_MESSAGE_NOTIFICATION', {
        senderName: onlineUser.find(u=>u.id==data.senderId).username
      })
    }

  })
})








// you don't need this part, it's just to make the demo app functional
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/", (req, res) => {
  response.send('Hi! it works');
});

app.get("/onlineusers", (req, res) => {
  res.json(onlineUser);
});
