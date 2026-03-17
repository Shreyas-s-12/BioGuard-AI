import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtud--Il1AHe4YunLbuQvtV2pIdJK5s3w",
  authDomain: "nutridetect-ai.firebaseapp.com",
  projectId: "nutridetect-ai",
  storageBucket: "nutridetect-ai.firebasestorage.app",
  messagingSenderId: "805117385406",
  appId: "1:805117385406:android:3beef4fca54d00ab7adcef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
