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

// ✅ 避免重复初始化
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ 限制 Temple 邮箱
provider.setCustomParameters({
  hd: "temple.edu",
  prompt: "select_account"
});

// ✅ 登录逻辑：仅在点击时触发
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    // 如果已登录 → 执行登出
    if (user) {
      if (confirm("Sign out?")) {
        await signOut(auth);
        localStorage.clear(); // 清除点赞记录
        alert("You have signed out.");
      }
      return;
    }

    // 否则 → 执行登录
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith("@temple.edu") && !email.endsWith("@tuj.temple.edu")) {
        alert("❌ Only Temple University emails are allowed.");
        await signOut(auth);
        return;
      }

      alert(`✅ Welcome ${result.user.displayName || result.user.email}!`);
      // 不再刷新整页，让 mainPage.js 自动检测状态变化
    } catch (error) {
      console.error("Login failed:", error);
      alert("❌ " + error.message);
    }
  });
}

// ✅ 状态变化时，只更新按钮外观，不再自动登录
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  if (user) {
    loginBtn.textContent = `👤 ${user.email}`;
    loginBtn.style.background = "#16a34a";
    loginBtn.style.color = "white";
  } else {
    loginBtn.textContent = "👤 Login";
    loginBtn.style.background = "lightblue";
    loginBtn.style.color = "#333";
  }
});
