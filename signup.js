import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
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

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  // ✅ 限制邮箱后缀
  const allowedDomains = ["temple.edu", "tuj.temple.edu"];
  const domain = email.split("@")[1];
  if (!allowedDomains.includes(domain)) {
    msg.style.color = "red";
    msg.textContent = "❌ Only Temple University emails are allowed.";
    return;
  }

  // ✅ 密码长度限制
  if (password.length < 6) {
    msg.style.color = "red";
    msg.textContent = "❌ Password must be at least 6 characters.";
    return;
  }

  try {
    // ✅ 创建账户
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ 发送验证邮件
    await sendEmailVerification(user);

    msg.style.color = "green";
    msg.textContent = "✅ Verification email sent! Please check your inbox.";

    // ✅ 立即登出（防止未验证用户直接登录）
    await signOut(auth);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "❌ " + error.message;
  }
});
