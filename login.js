import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } 
  from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  storageBucket: "chef-at-home-59cd6.firebasestorage.app",
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Temple 登录提供者
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: "temple.edu" });

document.getElementById("googleLogin").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  msg.style.color = "#333";
  msg.textContent = "🔄 Redirecting to Temple login...";

  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // ✅ 检查是否是 Temple 邮箱
    if (!email.endsWith("@temple.edu") && !email.endsWith("@tuj.temple.edu")) {
      msg.style.color = "red";
      msg.textContent = "❌ Only Temple University accounts allowed.";
      await signOut(auth);
      return;
    }

    msg.style.color = "green";
    msg.textContent = `✅ Welcome ${email}! Redirecting...`;
    setTimeout(() => window.location.href = "mainPage.html", 1200);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "❌ Login failed: " + error.message;
  }
});
