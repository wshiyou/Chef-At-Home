import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkNCN-607l7rB15Y335rODriPw1HqSB8E",
  authDomain: "chef-at-home-59cd6.firebaseapp.com",
  projectId: "chef-at-home-59cd6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 抓 URL 里的 id
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// DOM
const detailDiv = document.getElementById("recipeDetail");

async function loadRecipe(){
  const docRef = doc(db, "recipes", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    detailDiv.innerHTML = "<h2>Recipe not found.</h2>";
    return;
  }

  const r = snap.data();

  detailDiv.innerHTML = `
    <h1>${r.name}</h1>
    <img src="${r.imageURL}" style="width:300px;border-radius:10px;">
    <p><strong>Time:</strong> ${r.time} mins</p>
    <p><strong>Description:</strong> ${r.description}</p>
    <p><strong>Ingredients:</strong> ${r.ingredients.join(", ")}</p>
    <p><strong>Kitchenware:</strong> ${r.kitchenware.join(", ")}</p>
    <p><strong>Region:</strong> ${r.region}</p>
  `;
}

loadRecipe();
