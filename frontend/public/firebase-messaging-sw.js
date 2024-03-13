importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyD_rIJNmpmoSZbHo1xUa-WCld_dkkz8tPQ",
    authDomain: "glowing-harmony-411318.firebaseapp.com",
    projectId: "glowing-harmony-411318",
    storageBucket: "glowing-harmony-411318.appspot.com",
    messagingSenderId: "125127943597",
    appId: "1:125127943597:web:0a2f9ca6da7e9623376d24",
    measurementId: "G-N9483XGEEG"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});