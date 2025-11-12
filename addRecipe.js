import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// ✅ 初始化 Firebase（防止重复初始化）
const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  storageBucket: "chef-at-home-59cd6.firebasestorage.app",
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Temple 邮箱限制
provider.setCustomParameters({
  hd: "temple.edu",
  prompt: "select_account"
});

const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");

// ===============================
// 🧑‍💻 登录状态检测 + 登录按钮
// ===============================
const loginBtn = document.createElement("button");
loginBtn.textContent = "👤 Login with Temple Account";
loginBtn.style.width = "100%";
loginBtn.style.background = "#4285F4";
loginBtn.style.color = "white";
loginBtn.style.padding = "10px";
loginBtn.style.border = "none";
loginBtn.style.borderRadius = "10px";
loginBtn.style.marginTop = "1rem";
loginBtn.style.cursor = "pointer";
document.querySelector(".form-container").appendChild(loginBtn);

loginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    if (!email.endsWith("@temple.edu") && !email.endsWith("@tuj.temple.edu")) {
      alert("❌ Only Temple University emails are allowed.");
      await signOut(auth);
      return;
    }

    alert(`✅ Logged in as ${result.user.email}`);
    window.location.reload();
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ✅ 登录状态变化监听
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.textContent = `👤 ${user.email} (Sign out)`;
    loginBtn.style.background = "#16a34a";
    loginBtn.onclick = async () => {
      if (confirm("Sign out?")) {
        await signOut(auth);
        alert("Signed out!");
        window.location.reload();
      }
    };
  } else {
    loginBtn.textContent = "👤 Login with Temple Account";
  }
});

// ===============================
// 🧾 上传新菜谱
// ===============================
submitBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in before uploading!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const time = parseInt(document.getElementById("time").value);
  const ingredients = document.getElementById("ingredients").value.split(",").map(i => i.trim());
  const kitchenware = document.getElementById("kitchenware").value.split(",").map(k => k.trim());
  const region = document.getElementById("region").value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!name || !imageFile) {
    msg.style.color = "red";
    msg.textContent = "❌ Please fill in name and select an image.";
    return;
  }

  msg.style.color = "#333";
  msg.textContent = "⏳ Uploading...";

  try {
    // 📸 上传图片
    const imageRef = ref(storage, `recipes/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageURL = await getDownloadURL(imageRef);

    // 🧾 保存 Firestore
    await addDoc(collection(db, "recipes"), {
      name,
      description,
      time,
      ingredients,
      kitchenware,
      region,
      imageURL,
      favorites: 0,
      author: user.email,
      createdAt: serverTimestamp()
    });

    msg.style.color = "green";
    msg.textContent = "✅ Recipe added successfully!";
    setTimeout(() => (window.location.href = "mainPage.html"), 1500);
  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "❌ " + error.message;
  }
});
