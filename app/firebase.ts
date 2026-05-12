import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "rutas-de-autobuses.firebaseapp.com",
  projectId: "rutas-de-autobuses",
  storageBucket: "rutas-de-autobuses.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);