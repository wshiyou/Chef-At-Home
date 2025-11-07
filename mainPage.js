import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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
const db = getFirestore(app);

// ===========================
// 1. 读取 Firestore 数据
// ===========================
async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, "recipes"));
  const grid = document.getElementById("recent-grid");
  if (!grid) return;

  grid.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const recipe = doc.data();

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${recipe.imageURL || "https://via.placeholder.com/150"}"
           alt="${recipe.name}"
           style="width:200px;height:150px;border-radius:8px;object-fit:cover;">
      <h3>${recipe.name}</h3>
      <p>⏱ ${recipe.time || "?"} mins</p>
      <p>❤️ ${recipe.favorites || 0}</p>
    `;
    grid.appendChild(card);
  });

  console.log("✅ Loaded recipes:", querySnapshot.size);
}

// ===========================
// 2. 初始化下拉选项
// ===========================
function initFilters() {
  const ingredients = ["Chicken", "Beef", "Tofu", "Pasta", "Egg", "Avocado", "Rice", "Garlic"];
  const kitchenware = ["Pan", "Pot", "Oven", "Wok", "Blender", "Grill"];
  const regions = ["Italian", "Japanese", "Chinese", "American", "Mexican", "French"];

  const fill = (id, list) => {
    const select = document.getElementById(id);
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
// 3. 搜索功能
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
// 4. 绑定按钮事件
// ===========================
function setupButtons() {
  document.querySelector(".searchBtn")?.addEventListener("click", searchRecipes);
  document.getElementById("searchBar")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchRecipes();
  });
  document.querySelector(".addRecipeBtn")?.addEventListener("click", () => alert("🧑‍🍳 Add Recipe clicked!"));
  document.querySelector(".userBtn")?.addEventListener("click", () => alert("👤 User clicked!"));
}

// ===========================
// 页面初始化
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  setupButtons();
  getRecipes();
});
