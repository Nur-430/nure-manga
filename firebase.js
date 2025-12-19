// firebase.js

// TODO: Ganti dengan config Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyCGupUutqoXXxjz3hUIaaeyFW5jh6yvj0Y",
  authDomain: "nure-manga.firebaseapp.com",
  projectId: "nure-manga",
  storageBucket: "nure-manga.firebasestorage.app",
  messagingSenderId: "131677791840",
  appId: "1:131677791840:web:ae91bc25a163740a968505",
  measurementId: "G-1TL2MPNSMW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Export agar bisa dipakai di script.js
window.firebaseApp = {
  auth: auth,
  db: database
};

