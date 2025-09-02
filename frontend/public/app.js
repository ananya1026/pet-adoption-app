const API_URL = "/api"; // Use Nginx proxy to backend (10.0.21.31:3000)

// Navigation update function
function updateNav() {
  const token = localStorage.getItem("token");
  const adminLink = document.querySelector(".admin-link");
  if (token) {
    try {
      const decoded = jwt_decode(token);
      if (decoded.isAdmin) {
        adminLink.style.display = "inline";
      } else {
        adminLink.style.display = "none";
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      adminLink.style.display = "none";
    }
  } else {
    adminLink.style.display = "none";
  }
}

// Render pets on index.html or pets.html
const petList = document.getElementById("pets") || document.getElementById("pet-list");
if (petList) {
  async function loadPets() {
    try {
      const res = await fetch(`${API_URL}/pets`);
      const pets = await res.json();
      petList.innerHTML = "";
      if (!pets.length) {
        petList.innerHTML = "<p style='text-align:center; font-family: Roboto, sans-serif; color: #1a237e; font-size: 1.1rem;'>No pets available right now.</p>";
        return;
      }
      pets.forEach(pet => {
        const div = document.createElement("div");
        div.className = "pet-card";
        div.setAttribute("data-id", pet._id);
        div.innerHTML = `
          <img src="${pet.image || 'https://via.placeholder.com/260x220?text=Pet'}" alt="${pet.name}" />
          <h3>${pet.name}</h3>
          <p><strong>Breed:</strong> ${pet.breed || "N/A"}</p>
          <p class="species"><strong>Species:</strong> ${pet.species || pet.type || "N/A"}</p>
          <p><strong>Age:</strong> ${pet.age ? (pet.age < 1 ? Math.round(pet.age * 12) + " months" : pet.age + " years") : "Unknown"}</p>
          <p><strong>Behavior:</strong> ${pet.behavior || "Friendly"}</p>
          <button class="adopt-btn" data-id="${pet._id}" ${pet.status === "adopted" ? "disabled" : ""}>${pet.status === "adopted" ? "Adopted" : "Adopt"}</button>
        `;
        petList.appendChild(div);
      });

      // Adopt button logic
      document.querySelectorAll(".adopt-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const petId = btn.getAttribute("data-id");
          const token = localStorage.getItem("token");
          if (!token) {
            alert("⚠ Please login to adopt.");
            window.location.href = "login.html";
            return;
          }
          try {
            const res = await fetch(`${API_URL}/pets/${petId}/adopt`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              alert("✅ Adoption successful!");
              loadPets();
            } 
            else {
              alert(`❌ ${data.error || "Failed to adopt."}`);
            }
          } catch (err) {
            console.error("Adoption error:", err);
            alert("❌ Something went wrong. Check if you're logged in.");
          }
        });
      });
    } catch (err) {
      console.error("Error loading pets:", err);
      petList.innerHTML = "<p style='text-align:center; font-family: Roboto, sans-serif; color: #e63939; font-size: 1.1rem;'>Failed to load pets. Please try again later.</p>";
    }
  }
  loadPets();

  // Search and filter
  const searchInput = document.getElementById("search");
  const filterSelect = document.getElementById("filterType");
  const refreshBtn = document.getElementById("refresh");

  if (searchInput && filterSelect && refreshBtn) {
    function filterPets() {
      const searchText = searchInput.value.toLowerCase();
      const filterType = filterSelect.value.toLowerCase();
      const cards = document.querySelectorAll(".pet-card");
      cards.forEach(card => {
        const name = card.querySelector("h3").textContent.toLowerCase();
        const species = card.querySelector(".species").textContent.toLowerCase();
        const matchSearch =
          name.includes(searchText) ||
          species.includes(searchText) ||
          card.textContent.toLowerCase().includes(searchText);
        const matchType = !filterType || species.includes(filterType);
        card.style.display = matchSearch && matchType ? "block" : "none";
      });
    }

    searchInput.addEventListener("input", filterPets);
    filterSelect.addEventListener("change", filterPets);
    refreshBtn.addEventListener("click", () => {
      searchInput.value = "";
      filterSelect.value = "";
      document.querySelectorAll(".pet-card").forEach(card => (card.style.display = "block"));
    });
  }
}

// Login form (login.html)
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
      alert("⚠ Please enter both email and password.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Login successful!");
        localStorage.setItem("token", data.token);
        updateNav(); // Update navigation after login
        window.location.href = "pets.html";
      } else {
        alert(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Unable to connect to server");
    }
  });
}

// Registration form (register.html)
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      name: registerForm.name.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value.trim(),
    };
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("✅ Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        const errData = await res.json();
        alert(`⚠ Registration failed: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Unable to connect to server");
    }
  });
}

// Call updateNav on page load
window.addEventListener("load", updateNav);