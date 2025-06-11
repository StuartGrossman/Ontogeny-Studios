// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC-T2BEsVd8VvYTj3R2MIwLakfG63cgt4",
  authDomain: "ontogeny-labs.firebaseapp.com",
  projectId: "ontogeny-labs",
  storageBucket: "ontogeny-labs.firebasestorage.app",
  messagingSenderId: "501017479289",
  appId: "1:501017479289:web:e58905c7aa7388304f2ca8",
  measurementId: "G-D01VBZSBD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth }; 