// src/firebase/config.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBSaCsZzjR7WMzVxAad2vmHW25XdigbGjQ",
  authDomain: "ornhub-48362.firebaseapp.com",
  projectId: "ornhub-48362",
  storageBucket: "ornhub-48362.firebasestorage.app",
  messagingSenderId: "908267460763",
  appId: "1:908267460763:web:ad3949905d4d76094b8e3e",
  measurementId: "G-N9L1QQWN7K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
