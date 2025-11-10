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
// 1. 从 Firestore 读取数据
// ===========================
async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, "recipes"));

  // === 转为数组并附加 id ===
  const recipes = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    recipes.push({ ...data, id: docSnap.id }); // ✅ 把 Firestore 文档 ID 存进去
  });

  // === 按点赞数排序 ===
  const sortedByLikes = [...recipes].sort((a, b) => (b.favorites || 0) - (a.favorites || 0));

  // === 获取页面元素 ===
  const recentGrid = document.getElementById("recent-grid");
  const likedGrid = document.getElementById("liked-grid");
  const recommendedGrid = document.getElementById("recommended-grid");
  if (!recentGrid || !likedGrid || !recommendedGrid) return;

  // === 清空旧内容 ===
  recentGrid.innerHTML = "";
  likedGrid.innerHTML = "";
  recommendedGrid.innerHTML = "";

  // === Recent Upload ===
  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe, recipe.id);
    recentGrid.appendChild(card);
  });

  // === Most Liked（前 3 名）===
  sortedByLikes.slice(0, 3).forEach((recipe) => {
    const card = createRecipeCard(recipe, recipe.id);
    likedGrid.appendChild(card);
  });

  // === Recommended（烹饪时间 ≤15 分钟）===
  const quickRecipes = recipes.filter((r) => (r.time || 999) <= 15);
  quickRecipes.slice(0, 3).forEach((recipe) => {
    const card = createRecipeCard(recipe, recipe.id);
    recommendedGrid.appendChild(card);
  });

  console.log(`✅ Loaded recipes: ${recipes.length}, Top liked: ${sortedByLikes[0]?.favorites || 0}`);
}

// ===========================
// 2. 创建卡片（含点赞功能）
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

  // === 点赞元素 ===
  const likeSection = card.querySelector(".like-section");
  const likeCount = card.querySelector(".like-count");
  const likedKey = `liked_${id}`;

  // === 如果已点赞过，显示为红色 ===
  if (localStorage.getItem(likedKey)) {
    likeSection.style.color = "red";
  }

  // === 点击事件 ===
  likeSection.addEventListener("click", async (e) => {
    e.stopPropagation();

    const alreadyLiked = localStorage.getItem(likedKey);

    try {
      const recipeRef = doc(db, "recipes", id);

      if (alreadyLiked) {
        // ❤️ 取消点赞
        await updateDoc(recipeRef, { favorites: increment(-1) });
        const newCount = Math.max(0, parseInt(likeCount.textContent) - 1);
        likeCount.textContent = newCount;
        likeSection.style.color = "black";
        localStorage.removeItem(likedKey);
      } else {
        // ❤️ 点赞 +1
        await updateDoc(recipeRef, { favorites: increment(1) });
        const newCount = parseInt(likeCount.textContent) + 1;
        likeCount.textContent = newCount;
        likeSection.style.color = "red";
        likeSection.style.transform = "scale(1.3)";
        setTimeout(() => {
          likeSection.style.transform = "scale(1)";
        }, 200);
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
// 3. 初始化筛选下拉框
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
// 4. 搜索功能
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
// 5. 绑定按钮事件
// ===========================
function setupButtons() {
  document.querySelector(".searchBtn")?.addEventListener("click", searchRecipes);
  document.getElementById("searchBar")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchRecipes();
  });
  document.querySelector(".addRecipeBtn")?.addEventListener("click", () =>
    alert("🧑‍🍳 Add Recipe clicked!")
  );
  document.querySelector(".userBtn")?.addEventListener("click", () =>
    alert("👤 User clicked!")
  );
}

// ===========================
// 页面初始化
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  setupButtons();

  // ✅ 检查登录状态
  onAuthStateChanged(auth, (user) => {
    const userBtn = document.querySelector(".userBtn");

    if (user) {
      // 已登录用户
      console.log("✅ Logged in as:", user.email);
      userBtn.textContent = `👤 ${user.email}`;
      userBtn.onclick = async () => {
        if (confirm("Do you want to sign out?")) {
          await signOut(auth);
          alert("Signed out!");
          window.location.reload();
        }
      };

      // 登录后才加载食谱
      getRecipes();
    } else {
      // 未登录用户
      console.log("🚫 Not logged in");
      userBtn.textContent = "👤 Login";
      userBtn.onclick = () => {
        window.location.href = "login.html";
      };
    }
  });
});

