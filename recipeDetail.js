import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// === Firebase 配置（和 mainPage / googleLogin 保持一致） ===
const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6",
  storageBucket: "chef-at-home-59cd6.firebasestorage.app",
  messagingSenderId: "373814953137",
  appId: "1:373814953137:web:132d340f27d82ca1b5ce90",
  measurementId: "G-69BSP5NQX0"
};

// 避免重复初始化
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 解析 URL 获取 recipe id
const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

const detailCard = document.getElementById("detail-card");
const backBtnTop = document.getElementById("backBtn");

// 顶部 Back 按钮
if (backBtnTop){
  backBtnTop.addEventListener("click", () => {
    // 优先返回上一页，没有的话就去 mainPage
    if (window.history.length > 1){
      window.history.back();
    }else{
      window.location.href = "mainPage.html";
    }
  });
}

// 渲染详情内容
function renderRecipe(recipe){
  const {
    name = "Untitled Recipe",
    description = "",
    time,
    ingredients = [],
    kitchenware = [],
    region,
    imageURL,
    favorites = 0,
    author
  } = recipe;

  const safeImage =
    imageURL && imageURL.startsWith("http")
      ? imageURL
      : "https://via.placeholder.com/400x300?text=No+Image";

  const timeText = time ? `${time} mins` : "? mins";
  const regionText = region || "Unknown region";
  const authorText = author || "Anonymous";

  const ingList = ingredients.length
    ? ingredients.map((i) => `<li>${i}</li>`).join("")
    : "<li>No ingredients listed.</li>";

  const kitList = kitchenware.length
    ? kitchenware.map((k) => `<li>${k}</li>`).join("")
    : "<li>No kitchenware listed.</li>";

  detailCard.classList.remove("loading", "error");
  detailCard.innerHTML = `
    <div class="detail-image">
      <img src="${safeImage}" alt="${name}">
    </div>

    <div class="detail-info">
      <h1 class="detail-title">${name}</h1>
      <p class="detail-meta">⏱ ${timeText} · 🌍 ${regionText}</p>
      <p class="detail-author">Uploaded by: ${authorText}</p>

      <div class="detail-block">
        <h3>Description</h3>
        <p>${description || "No description provided."}</p>
      </div>

      <div class="detail-block">
        <h3>Ingredients</h3>
        <ul class="detail-list">
          ${ingList}
        </ul>
      </div>

      <div class="detail-block">
        <h3>Kitchenware</h3>
        <ul class="detail-list">
          ${kitList}
        </ul>
      </div>

      <div class="detail-actions">
        <button class="likeBtn" id="likeBtn">
          <span>❤️</span>
          <span id="likeCount">${favorites}</span>
        </button>
        <button class="backBtn-secondary" id="backBtnSecondary">← Back to Recipes</button>
      </div>
    </div>
  `;

  // 下方 Back 按钮
  const backBtnSecondary = document.getElementById("backBtnSecondary");
  if (backBtnSecondary){
    backBtnSecondary.addEventListener("click", () => {
      if (window.history.length > 1){
        window.history.back();
      }else{
        window.location.href = "mainPage.html";
      }
    });
  }

  // 点赞逻辑（跟 mainPage 一致：localStorage + Firestore increment）
  const likeBtn = document.getElementById("likeBtn");
  const likeCountEl = document.getElementById("likeCount");
  const likedKey = `liked_${recipeId}`;

  if (localStorage.getItem(likedKey) === "true"){
    likeBtn.classList.add("liked");
  }

  likeBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user){
      alert("Please log in to like recipes ❤️");
      return;
    }

    const alreadyLiked = localStorage.getItem(likedKey) === "true";
    const recipeRef = doc(db, "recipes", recipeId);

    try{
      if (alreadyLiked){
        await updateDoc(recipeRef, { favorites: increment(-1) });
        const newCount = Math.max(0, parseInt(likeCountEl.textContent) - 1);
        likeCountEl.textContent = newCount;
        likeBtn.classList.remove("liked");
        localStorage.removeItem(likedKey);
      }else{
        await updateDoc(recipeRef, { favorites: increment(1) });
        const newCount = parseInt(likeCountEl.textContent) + 1;
        likeCountEl.textContent = newCount;
        likeBtn.classList.add("liked");
        localStorage.setItem(likedKey, "true");
      }
    }catch (err){
      console.error("Failed to update likes:", err);
      alert("Failed to update likes.");
    }
  });
}

// 加载 recipe 数据
async function loadRecipe(){
  if (!recipeId){
    detailCard.classList.add("error");
    detailCard.innerHTML = "<p>❌ No recipe id provided.</p>";
    return;
  }

  try{
    const recipeRef = doc(db, "recipes", recipeId);
    const snap = await getDoc(recipeRef);

    if (!snap.exists()){
      detailCard.classList.add("error");
      detailCard.innerHTML = "<p>❌ Recipe not found.</p>";
      return;
    }

    renderRecipe(snap.data());
  }catch (err){
    console.error("Error loading recipe:", err);
    detailCard.classList.add("error");
    detailCard.innerHTML = "<p>❌ Failed to load recipe.</p>";
  }
}

// 监听登录状态（这里只是为了在需要时可以用到 auth.currentUser）
onAuthStateChanged(auth, () => {
  // 不需要做什么，googleLogin.js 会负责更新 loginBtn 的文案
});

// 初始化
document.addEventListener("DOMContentLoaded", loadRecipe);
