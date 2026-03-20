import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtmCipNxvvWNo5d9SPz36VdYK0lytlhDc",
  authDomain: "bioguard-ai-48e68.firebaseapp.com",
  projectId: "bioguard-ai-48e68",
  appId: "1:578375610460:web:2e226375e6ed87ec103699"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

export { auth, provider };
