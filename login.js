import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification
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
  const allowedDomains = ["temple.edu", "tuj.temple.edu"];
  const emailDomain = email.split("@")[1];
  if (!allowedDomains.includes(emailDomain)) {
    msg.style.color = "red";
    msg.textContent = "❌ Only Temple University emails are allowed.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ 检查邮箱是否验证
    if (!user.emailVerified) {
      msg.style.color = "orange";
      msg.innerHTML = `
        ⚠️ Please verify your email before logging in.<br>
        <button id="resendBtn" style="margin-top:6px;padding:4px 8px;">Resend verification email</button>
      `;

      // ⚙️ 添加“重新发送验证邮件”功能
      document.getElementById("resendBtn").addEventListener("click", async () => {
        await sendEmailVerification(user);
        msg.style.color = "green";
        msg.textContent = "📩 Verification email resent! Please check your inbox.";
      });

      return; // 阻止未验证邮箱继续登录
    }

    // ✅ 邮箱验证通过，允许登录
    msg.style.color = "green";
    msg.textContent = "✅ Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "mainPage.html";
    }, 1500);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "❌ Login failed: " + error.message;
  }
});
