// mainPage.js（精简版）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// === 你的 Firebase 配置（保持不变） ===
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
// 1. 保留你原来的 getRecipes
// ===========================
async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, "recipes"));
 async function getRecipes() {
  const querySnapshot = await getDocs(collection(db, "recipes"));

  // 找到页面上的“Recent Upload”部分（或任意 grid）
  const grid = document.getElementById("recent-grid");
  if (!grid) return;

  grid.innerHTML = ""; // 清空旧内容

  querySnapshot.forEach((doc) => {
    const recipe = doc.data();

    // 创建一个卡片元素
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

    grid.appendChild(card); // 添加到页面
  });
}

}

// ===========================
// 2. 初始化下拉选项（静态列表）
// ===========================
function initFilters() {
  const ingredientSelect = document.getElementById("filter-ingredient");
  const kitchenwareSelect = document.getElementById("filter-kitchenware");
  const regionSelect = document.getElementById("filter-region");

  if (!ingredientSelect || !kitchenwareSelect || !regionSelect) return;

  // 可以自己按需要改这些选项
  const ingredients = [
    "Chicken",
    "Beef",
    "Tofu",
    "Pasta",
    "Egg",
    "Avocado",
    "Rice",
    "Garlic"
  ];

  const kitchenware = [
    "Pan",
    "Pot",
    "Oven",
    "Wok",
    "Blender",
    "Grill"
  ];

  const regions = [
    "Italian",
    "Japanese",
    "Chinese",
    "American",
    "Mexican",
    "French"
  ];

  const fill = (select, list) => {
    list.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.toLowerCase();
      opt.textContent = item;
      select.appendChild(opt);
    });
  };

  fill(ingredientSelect, ingredients);
  fill(kitchenwareSelect, kitchenware);
  fill(regionSelect, regions);
}

// ===========================
// 3. 搜索功能（简单版）
// ===========================
function searchRecipes() {
  const input = document.getElementById("searchBar");
  const keyword = (input?.value || "").toLowerCase();

  // 如果你之后在 HTML 里加上 .recipe-card，这里会根据关键字隐藏/显示
  const cards = document.querySelectorAll(".recipe-card");

  if (!cards.length) {
    console.log("Search keyword:", keyword);
    return;
  }

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(keyword) ? "block" : "none";
  });
}

// ===========================
// 4. 绑定按钮事件
// ===========================
function setupButtons() {
  const searchBtn = document.querySelector(".searchBtn");
  const addRecipeBtn = document.querySelector(".addRecipeBtn");
  const userBtn = document.querySelector(".userBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      searchRecipes();
    });
  }

  const searchInput = document.getElementById("searchBar");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchRecipes();
      }
    });
  }

  if (addRecipeBtn) {
    addRecipeBtn.addEventListener("click", () => {
      alert("🧑‍🍳 Add Recipe clicked!");
    });
  }

  if (userBtn) {
    userBtn.addEventListener("click", () => {
      alert("👤 User clicked!");
    });
  }
}

// ===========================
// 页面初始化
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initFilters();   // 给三个下拉框填选项
  setupButtons();  // 绑定 search / add / user 按钮
  getRecipes();    // 从 Firestore 读数据并在控制台打印
});
