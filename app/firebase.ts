import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBK6MUMKR0tH5_DrVLP63s1LHZfLyImtFA",
  authDomain: "rutas-de-autobuses.firebaseapp.com",
  projectId: "rutas-de-autobuses",
  storageBucket: "rutas-de-autobuses.firebasestorage.app",
  messagingSenderId: "1045712715452",
  appId: "1:1045712715452:web:00125ca248683ae4ab1ab9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);