import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth }       from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            "AIzaSyBqpmsmyXxboeLQ9HJo4WSaUmypOv4z7Kk",
  authDomain:        "primeroute-ef511.firebaseapp.com",
  databaseURL:       "https://primeroute-ef511-default-rtdb.firebaseio.com",
  projectId:         "primeroute-ef511",
  storageBucket:     "primeroute-ef511.firebasestorage.app",
  messagingSenderId: "632638442126",
  appId:             "1:632638442126:web:bc5d6ac9f8257d342c97df",
  measurementId:     "G-VRRK7PCPG5"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
