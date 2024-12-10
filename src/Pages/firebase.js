// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // For Firestore
import { getAnalytics } from 'firebase/analytics'; // Optional, for Analytics

// Your Firebase configuration for palanialab2
const firebaseConfig = {
  apiKey: "AIzaSyATbtcjHRjr1pDjdKk3gU1E536vrgNT7qk",
  authDomain: "palanialab2-e61e7.firebaseapp.com",
  projectId: "palanialab2-e61e7",
  storageBucket: "palanialab2-e61e7.firebasestorage.app",
  messagingSenderId: "333583213434",
  appId: "1:333583213434:web:261755d0b3febe64d0ecc3",
  measurementId: "G-RTCVVBS23J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Optional: Initialize Firebase Analytics

export { db, analytics };
