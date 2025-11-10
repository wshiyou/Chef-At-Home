import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  storageBucket: "chef-at-home-59cd6.firebasestorage.app",
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90"
};

// ✅ 避免重复初始化 Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ 限制 Temple 邮箱域名
provider.setCustomParameters({
  hd: "temple.edu",
  prompt: "select_account"
});

// 登录按钮事件
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith("@temple.edu") && !email.endsWith("@tuj.temple.edu")) {
        alert("❌ Only Temple University emails are allowed.");
        await signOut(auth);
        return;
      }

      alert(`✅ Welcome ${result.user.displayName || result.user.email}!`);
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      alert("❌ " + error.message);
    }
  });
}

// ✅ 监听登录状态变化（显示用户信息 + 登出）
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("loginBtn");
  if (user) {
    loginBtn.textContent = `👤 ${user.email}`;
    loginBtn.onclick = async () => {
      if (confirm("Sign out?")) {
        await signOut(auth);
        alert("You have signed out.");
        window.location.reload();
      }
    };
  } else {
    loginBtn.textContent = "👤 Login";
  }
});
