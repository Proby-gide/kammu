import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBJMpL_5IciFMCWovpSxkJXuaoXIfSe2gU",
  authDomain: "kammu-ai.firebaseapp.com",
  projectId: "kammu-ai",
  storageBucket: "kammu-ai.firebasestorage.app",
  messagingSenderId: "652507062152",
  appId: "1:652507062152:web:036637f3ebecab5ec6e43d",
  measurementId: "G-EH3TEF2KTK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
