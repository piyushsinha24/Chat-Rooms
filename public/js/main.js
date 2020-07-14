const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

// Get Username & Room from the URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

//Join Chat Room
socket.emit('joinRoom', {username, room});

//Get Room and Users
socket.on('roomUsers',({room, users}) => {
    OutputRoomName(room);
    OutputUsersList(users);
});

//Message from server
socket.on('message', message => {
    console.log(message);
    OutputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    //Get msg text
    const msg = e.target.elements.msg.value;

    //Emit msg to server
    socket.emit('chatMessage', msg);

    //Clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});
 
//Output message to DOM
function OutputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    let author = '';
    username.localeCompare(msg['username']) == 0 ? author = 'You': author = msg['username'];
    author != 'Chat Bot'?
     div.innerHTML = `<p class="meta">${author} <span>${msg['time']}</span></p>
    <p class="text">
    ${msg['text']}
    </p>`
    : div.innerHTML = `<p class="text" style="text-align:center;color: grey"><i class="far fa-bell"> ${msg['text']} </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Output room name to DOM
function OutputRoomName(room) {
    roomName.innerHTML = room;
}

//Output users list to DOM 
function OutputUsersList(users) {
    usersList.innerHTML = `${users.map(user => `<li><i class="fas fa-circle" style="color: green"></i>   ${user.username}</li>`).join('')}`;
}