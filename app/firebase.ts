import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBK6MUMKROtH5_DrVLP63s1LH7FLylmtFA",
  authDomain: "rutas-de-autobuses.firebaseapp.com",
  projectId: "rutas-de-autobuses",
  storageBucket: "rutas-de-autobuses.firebasestorage.app",
  messagingSenderId: "1045712715452",
  appId: "1:1045712715452:web:00125ca248683ae4ab1ab9",
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);