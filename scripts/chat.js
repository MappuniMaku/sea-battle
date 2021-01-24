import Vue from 'vue/dist/vue.esm';

// const wsAddress = 'wss://slider-constructor.herokuapp.com/chat';
const wsAddress = 'ws://localhost:3000/chat';

new Vue({
    el: '#chat',
    data: {
        chatMessage: '',
        messages: [],
        userName: '',
        isLoggedIn: false,
        usersCount: 0,
        ws: null,
        connectedUsers: [],
    },
    computed: {
        connectedUsersNames() {
            return this.connectedUsers.join(', ');
        },
    },
    methods: {
        sendMessage(e) {
            e.preventDefault();
            const payload = {
                userName: this.userName,
                message: this.chatMessage,
            };
            this.ws.send(JSON.stringify(payload));
            this.chatMessage = '';
        },

        setWsEventsHandlers() {
            this.ws.onmessage = (message) => {
                const parsedResponse = JSON.parse(message.data);
                console.log(parsedResponse);

                if (parsedResponse.message) {
                    this.messages.push(parsedResponse);
                }

                if (parsedResponse.usersCount) {
                    this.usersCount = parsedResponse.usersCount;
                }

                if (parsedResponse.connectedUsers) {
                    this.connectedUsers = parsedResponse.connectedUsers;
                }

                if (parsedResponse.requireUpdate) {
                    const payload = {
                        userName: this.userName,
                        isUpdating: true,
                    };
                    this.ws.send(JSON.stringify(payload));
                }
            };
        },

        enterChat(e) {
            e.preventDefault();
            this.ws = new WebSocket(wsAddress);
            this.ws.onopen = () => {
                this.setWsEventsHandlers();
                this.isLoggedIn = true;
                const payload = {
                    userName: this.userName,
                    isNewUser: true,
                };
                this.ws.send(JSON.stringify(payload));
            };
        },

        exitChat() {
            this.ws.close();
            this.ws = null;
            this.chatMessage = '';
            this.messages = [];
            this.userName = '';
            this.isLoggedIn = false;
            this.usersCount = 0;
        },
    },
});
