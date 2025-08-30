const API_URL = "http://43.205.210.146:3000/api"; // Your backend URL

// ----------------------------
// Render pets on index.html
// ----------------------------
const petList = document.getElementById("pets");
if (petList) {
  fetch(`${API_URL}/pets`)
    .then(res => res.json())
    .then(data => {
      data.forEach(pet => {
        const div = document.createElement("div");
        div.className = "pet-card"; // matches your CSS
        div.innerHTML = `
          <img src="${pet.image || 'https://via.placeholder.com/260x220'}" alt="${pet.name}" />
          <h3>${pet.name}</h3>
          <p><strong>Breed:</strong> ${pet.breed || '-'}</p>
          <p><strong>Species:</strong> ${pet.type || '-'}</p>
          <p><strong>Description:</strong> ${pet.description || '-'}</p>
        `;
        petList.appendChild(div);
      });
    })
    .catch(err => console.error("Error loading pets:", err));
}

// ----------------------------
// Login form (login.html)
// ----------------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("⚠ Please enter both username and password.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }) // backend uses email
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Login successful!");
        localStorage.setItem("token", data.token); // store JWT
        window.location.href = "index.html"; // redirect to home
      } else {
        alert("❌ " + (data.error || "Login failed"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Unable to connect to server");
    }
  });
}

// ----------------------------
// Registration form (register.html)
// ----------------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      password: registerForm.password.value
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("✅ Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        const errData = await res.json();
        alert("⚠ Registration failed: " + (errData.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Unable to connect to server");
    }
  });
}