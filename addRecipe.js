import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  // ❌ 不需要 storageBucket
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: "temple.edu", prompt: "select_account" });

const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");

// 登录按钮（与之前相同）
const loginBtn = document.createElement("button");
loginBtn.textContent = "👤 Login with Temple Account";
loginBtn.style.cssText = "width:100%;background:#4285F4;color:#fff;padding:10px;border:none;border-radius:10px;margin-top:1rem;cursor:pointer;";
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
    alert(`✅ Logged in as ${email}`);
    window.location.reload();
  } catch (e) { alert("❌ " + e.message); }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.textContent = `👤 ${user.email} (Sign out)`;
    loginBtn.style.background = "#16a34a";
    loginBtn.onclick = async () => {
      if (confirm("Sign out?")) { await signOut(auth); alert("Signed out!"); window.location.reload(); }
    };
  } else {
    loginBtn.textContent = "👤 Login with Temple Account";
  }
});

submitBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) { alert("Please log in before uploading!"); return; }

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const time = parseInt(document.getElementById("time").value);
  const ingredients = document.getElementById("ingredients").value.split(",").map(s => s.trim()).filter(Boolean);
  const kitchenware = document.getElementById("kitchenware").value.split(",").map(s => s.trim()).filter(Boolean);
  const region = document.getElementById("region").value.trim();
  const imageURL = document.getElementById("imageURL").value.trim();

  if (!name || !imageURL) {
    msg.style.color = "red";
    msg.textContent = "❌ Please fill in name and image URL.";
    return;
  }
  if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(imageURL)) {
    msg.style.color = "red";
    msg.textContent = "❌ Please enter a valid image URL (jpg/png/gif/webp).";
    return;
  }

  msg.style.color = "#333";
  msg.textContent = "⏳ Saving...";

  try {
    await addDoc(collection(db, "recipes"), {
      name, description, time: isNaN(time) ? null : time,
      ingredients, kitchenware, region,
      imageURL,
      favorites: 0,
      author: user.email,
      createdAt: serverTimestamp()
    });
    msg.style.color = "green";
    msg.textContent = "✅ Recipe added successfully!";
    setTimeout(() => (window.location.href = "mainPage.html"), 1200);
  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "❌ " + e.message;
  }
});
