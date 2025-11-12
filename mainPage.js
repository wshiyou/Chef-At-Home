import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// === Firebase 配置 ===
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
const db = getFirestore(app);

// ===========================
// 1️⃣ 读取 Firestore 菜谱数据
// ===========================
async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, "recipes"));
  const recipes = [];
  querySnapshot.forEach((docSnap) => {
    recipes.push({ id: docSnap.id, ...docSnap.data() });
  });

  const recentGrid = document.getElementById("recent-grid");
  const likedGrid = document.getElementById("liked-grid");
  const recommendedGrid = document.getElementById("recommended-grid");

  if (!recentGrid || !likedGrid || !recommendedGrid) return;

  recentGrid.innerHTML = "";
  likedGrid.innerHTML = "";
  recommendedGrid.innerHTML = "";

  const sortedByLikes = [...recipes].sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
  const quickRecipes = recipes.filter((r) => (r.time || 999) <= 15);

  // Recent
  recipes.forEach((r) => recentGrid.appendChild(createRecipeCard(r, r.id)));

  // Most liked
  sortedByLikes.slice(0, 3).forEach((r) => likedGrid.appendChild(createRecipeCard(r, r.id)));

  // Recommended
  quickRecipes.slice(0, 3).forEach((r) => recommendedGrid.appendChild(createRecipeCard(r, r.id)));

  console.log(`✅ Loaded ${recipes.length} recipes`);
}

// ===========================
// ❤️ 加载当前用户点赞过的菜谱
// ===========================
async function loadLikedRecipes() {
  const likedByUserGrid = document.getElementById("liked-by-user-grid");
  likedByUserGrid.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "recipes"));
  const recipes = [];
  querySnapshot.forEach((docSnap) => {
    recipes.push({ id: docSnap.id, ...docSnap.data() });
  });

  const likedIds = Object.keys(localStorage)
    .filter((k) => k.startsWith("liked_") && localStorage.getItem(k) === "true")
    .map((k) => k.replace("liked_", ""));

  const likedRecipes = recipes.filter((r) => likedIds.includes(r.id));

  if (likedRecipes.length === 0) {
    likedByUserGrid.innerHTML = "<p style='color:#555;'>You haven’t liked any recipes yet ❤️</p>";
    return;
  }

  likedRecipes.forEach((r) => {
    likedByUserGrid.appendChild(createRecipeCard(r, r.id));
  });
}

// ===========================
// 2️⃣ 创建菜谱卡片（含点赞）
// ===========================
function createRecipeCard(recipe, id) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
    <img src="${recipe.imageURL || "https://via.placeholder.com/150"}"
         alt="${recipe.name || "Recipe"}"
         style="width:200px;height:150px;border-radius:8px;object-fit:cover;">
    <h3>${recipe.name || "Untitled"}</h3>
    <p>⏱ ${recipe.time || "?"} mins</p>
    <p class="like-section" style="cursor:pointer;">
      ❤️ <span class="like-count">${recipe.favorites || 0}</span>
    </p>
  `;

  const likeSection = card.querySelector(".like-section");
  const likeCount = card.querySelector(".like-count");
  const likedKey = `liked_${id}`;

  if (localStorage.getItem(likedKey)) likeSection.style.color = "red";

  likeSection.addEventListener("click", async (e) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to like recipes ❤️");
      return;
    }

    const alreadyLiked = localStorage.getItem(likedKey);
    try {
      const recipeRef = doc(db, "recipes", id);
      if (alreadyLiked) {
        await updateDoc(recipeRef, { favorites: increment(-1) });
        likeCount.textContent = Math.max(0, parseInt(likeCount.textContent) - 1);
        likeSection.style.color = "black";
        localStorage.removeItem(likedKey);
      } else {
        await updateDoc(recipeRef, { favorites: increment(1) });
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
        likeSection.style.color = "red";
        likeSection.style.transform = "scale(1.3)";
        setTimeout(() => (likeSection.style.transform = "scale(1)"), 200);
        localStorage.setItem(likedKey, "true");
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      alert("Failed to update likes.");
    }
  });

  return card;
}

// ===========================
// 3️⃣ 初始化下拉筛选
// ===========================
function initFilters() {
  const ingredients = ["Chicken", "Beef", "Tofu", "Pasta", "Egg", "Avocado", "Rice", "Garlic"];
  const kitchenware = ["Pan", "Pot", "Oven", "Wok", "Blender", "Grill"];
  const regions = ["Italian", "Japanese", "Chinese", "American", "Mexican", "French"];

  const fill = (id, list) => {
    const select = document.getElementById(id);
    if (!select) return;
    list.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.toLowerCase();
      opt.textContent = item;
      select.appendChild(opt);
    });
  };

  fill("filter-ingredient", ingredients);
  fill("filter-kitchenware", kitchenware);
  fill("filter-region", regions);
}

// ===========================
// 4️⃣ 搜索
// ===========================
function searchRecipes() {
  const keyword = document.getElementById("searchBar").value.toLowerCase();
  const cards = document.querySelectorAll(".recipe-card");
  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(keyword) ? "block" : "none";
  });
}

// ===========================
// 5️⃣ 初始化按钮
// ===========================
function setupButtons() {
  document.querySelector(".searchBtn")?.addEventListener("click", searchRecipes);
  document.getElementById("searchBar")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchRecipes();
  });
  document.querySelector(".addRecipeBtn")?.addEventListener("click", () => {
    window.location.href = "addRecipe.html";
  });
}

// ===========================
// 页面初始化
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  setupButtons();
  getRecipes();

  const likedByUserSection = document.getElementById("liked-by-user");
  const userBtn = document.querySelector(".userBtn");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ 登录后
      userBtn.textContent = `👤 ${user.displayName || user.email}`;
      userBtn.style.background = "#16a34a";
      userBtn.style.color = "white";
      likedByUserSection.style.display = "block";
      await loadLikedRecipes();

      userBtn.onclick = async () => {
        if (confirm("Do you want to sign out?")) {
          await signOut(auth);
          localStorage.clear(); // 🧹 清空上一个用户点赞记录
          alert("Signed out!");
        }
      };
    } else {
      // ❌ 未登录
      likedByUserSection.style.display = "none";
      userBtn.textContent = "👤 User";
      userBtn.style.background = "lightblue";
      userBtn.style.color = "#333";
    }
  });
});
