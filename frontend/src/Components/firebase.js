// firebase.js

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyD_rIJNmpmoSZbHo1xUa-WCld_dkkz8tPQ",
  authDomain: "glowing-harmony-411318.firebaseapp.com",
  projectId: "glowing-harmony-411318",
  storageBucket: "glowing-harmony-411318.appspot.com",
  messagingSenderId: "125127943597",
  appId: "1:125127943597:web:0a2f9ca6da7e9623376d24",
  measurementId: "G-N9483XGEEG"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };