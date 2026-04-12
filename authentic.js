
// Firebase Authentication + Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5ApbauNZZnw6pOWoHajlj6TOHoRVJr_0",
  authDomain: "firebasics2705.firebaseapp.com",
  databaseURL: "https://firebasics2705-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "firebasics2705",
  storageBucket: "firebasics2705.firebasestorage.app",
  messagingSenderId: "939715509059",
  appId: "1:939715509059:web:487d7a2ae4d34154ebcdf6",
  measurementId: "G-T4WVGCGCX4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeAuth = document.getElementById("closeAuth");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const authUsername = document.getElementById("authUsername");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authRepeatPassword = document.getElementById("authRepeatPassword");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");

const addFavoriteBtn = document.getElementById("addFavoriteBtn");
const favoriteSelect = document.getElementById("favoriteSelect");

let isSignUp = false;
let favoriteCities = [];
let currCity = ""; 

loginBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
  isSignUp = false;
  authTitle.textContent = "Log In";
  authUsername.style.display = "none";
  authRepeatPassword.style.display = "none";
});

signupBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
  isSignUp = true;
  authTitle.textContent = "Sign Up";
  authUsername.style.display = "block";
  authRepeatPassword.style.display = "block";
});

closeAuth.addEventListener("click", () => authModal.style.display = "none");
window.addEventListener("click", (event) => {
  if (event.target === authModal) authModal.style.display = "none";
});

authSubmit.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (isSignUp) {
    const username = authUsername.value.trim();
    const repeatPassword = authRepeatPassword.value.trim();

    if (!username || !email || !password || !repeatPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== repeatPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        favoriteCities: [],
        loginTime: new Date().toISOString(),
        location: null
      });

      alert("🎉 Account created successfully!");
      authModal.style.display = "none";
    } catch (error) {
      alert(error.message);
    }
  } else {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateDoc(doc(db, "users", user.uid), {
        loginTime: new Date().toISOString()
      });

      authModal.style.display = "none";
      alert("✅ Logged in successfully!");
    } catch (error) {
      alert(error.message);
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    userInfo.classList.remove("hidden");

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      userName.textContent = data.username || user.email;

      favoriteCities = data.favoriteCities || [];
      updateFavoriteDropdown();
    } else {
      userName.textContent = user.email;
      favoriteCities = [];
    }
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    userInfo.classList.add("hidden");

    favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
    updateFavoriteDropdown();
  }
});

addFavoriteBtn.addEventListener("click", async () => {
  if (!currCity) return;

  if (!favoriteCities.includes(currCity)) {
    favoriteCities.push(currCity);
  } else {
    favoriteCities = favoriteCities.filter(c => c !== currCity);
  }

  localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));

  const user = auth.currentUser;
  if (user) {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        favoriteCities: favoriteCities
      });
    } catch (err) {
      console.error("Error updating favorites in Firestore:", err);
    }
  }

  updateFavoriteDropdown();
});

favoriteSelect.addEventListener("change", (e) => {
  if (e.target.value) {
    currCity = e.target.value;
    getWeather();
  }
});

function updateFavoriteDropdown() {
  favoriteSelect.innerHTML = `<option value="">⭐ Favorite Cities</option>`;
  favoriteCities.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    favoriteSelect.appendChild(option);
  });
}

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("👋 Logged out successfully!");
});