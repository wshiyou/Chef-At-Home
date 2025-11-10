import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  storageBucket: "chef-at-home-59cd6.firebasestorage.app",
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90",
  measurementId: "G-69BSP5NQX0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  // ✅ 限制邮箱后缀
  const allowedDomains = ["temple.edu", "tuj.temple.edu"]; // 可自定义多个
  const emailDomain = email.split("@")[1];

  if (!allowedDomains.includes(emailDomain)) {
    msg.textContent = "❌ Only Temple University emails are allowed.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    msg.style.color = "green";
    msg.textContent = "✅ Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "mainPage.html";
    }, 1500);
  } catch (error) {
    console.error(error);
    msg.textContent = "❌ Login failed: " + error.message;
  }
});
