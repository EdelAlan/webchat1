'use strict';

var usernamePage = document.querySelector('#username-page');
var chatWindow = document.querySelector('#chat-window');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');

var stompClient = null;
var username = null;

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatWindow.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected);
    }
    event.preventDefault();
}


function onConnected() {
    stompClient.subscribe('/topic/chat', onMessageReceived);
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({sender: username, text: ''}))

}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            text: messageInput.value,
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if (message.text === '') {
        console.log(message.sender + " has joined!");

        var textElement = document.createElement('p');
        var messageSender = document.createTextNode(message.sender + " has joined!");
        textElement.appendChild(messageSender);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    } else {
        console.log(message.sender + " : " + message.text);

        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.sender + " : " + message.text);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
