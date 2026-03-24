import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwR3ASN0w2aAMXku94Mp6nzrzuN4hpRsA",
  authDomain: "neuroscan-ai-a8139.firebaseapp.com",
  projectId: "neuroscan-ai-a8139",
  storageBucket: "neuroscan-ai-a8139.firebasestorage.app",
  messagingSenderId: "73120908888",
  appId: "1:73120908888:web:896c6735eb3aa4703cec2d"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);