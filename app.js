
// ===============================
// SHAAM HOTEL MANAGEMENT SYSTEM
// ===============================

// USERS
let users = JSON.parse(localStorage.getItem("shaamUsers")) || [];

if (!users.some(user => user.username === "owner")) {
    users.push({
        username: "owner",
        password: "Owner123!",
        role: "superadmin"
    });
    localStorage.setItem("shaamUsers", JSON.stringify(users));
}

// ROOMS
let rooms = JSON.parse(localStorage.getItem("shaamRooms")) || [];

const roomTypes = [
    { type: "Single", price: 1600 },
    { type: "Double", price: 2000 },
    { type: "Family", price: 1800 },
    { type: "Deluxe", price: 3000 },
    { type: "Suite", price: 3500 }
];

if (rooms.length === 0) {
    for (let i = 301; i <= 321; i++) {
        let roomType = roomTypes[(i - 301) % roomTypes.length];

        rooms.push({
            number: i,
            type: roomType.type,
            price: roomType.price,
            status: "Available"
        });
    }

    localStorage.setItem("shaamRooms", JSON.stringify(rooms));
}

// BOOKINGS
let bookings = JSON.parse(localStorage.getItem("shaamBookings")) || [];

// PAYMENTS
let payments = JSON.parse(localStorage.getItem("shaamPayments")) || [];

// CURRENT USER
let currentUser = null;


// SAVE FUNCTIONS
function saveUsers() {
    localStorage.setItem("shaamUsers", JSON.stringify(users));
}

function saveRooms() {
    localStorage.setItem("shaamRooms", JSON.stringify(rooms));
}

function saveBookings() {
    localStorage.setItem("shaamBookings", JSON.stringify(bookings));
}

function savePayments() {
    localStorage.setItem("shaamPayments", JSON.stringify(payments));
}


// SAFE HTML TEXT
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// FORMAT MONEY
function money(amount) {
    return Number(amount).toLocaleString("en-US") + " Br";
}


// LOGIN
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value;

    let user = users.find(u =>
        u.username === username && u.password === password
    );

    if (user) {
        currentUser = user;

        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        document.getElementById("currentUser").textContent =
            user.username + " (" + user.role + ")";

        document.getElementById("loginMessage").textContent = "";

        setupPermissions();
        showPage("dashboard");
        renderAll();

    } else {
        document.getElementById("loginMessage").textContent =
            "Magaca isticmaalaha ama furaha sirta ah waa khalad.";

        document.getElementById("loginMessage").style.color = "red";
    }
});


// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function() {
    currentUser = null;

    document.getElementById("app").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");

    document.getElementById("loginForm").reset();
});


// PERMISSIONS
function setupPermissions() {
    let adminButton = document.querySelector('[data-view="admin"]');
    let userForm = document.getElementById("userForm");

    adminButton.classList.remove("hidden");

    // Super Admin kaliya ayaa maamuli kara isticmaalayaasha
    if (currentUser.role !== "superadmin") {
        userForm.classList.add("hidden");
    } else {
        userForm.classList.remove("hidden");
    }
}


// NAVIGATION
document.querySelectorAll(".sidebar nav button").forEach(button => {
    button.addEventListener("click", function() {
        showPage(this.dataset.view);
    });
});

function showPage(page) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.add("hidden");
    });

    let selectedPage = document.getElementById(page);

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    document.querySelectorAll(".sidebar nav button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === page
        );
    });

    let titles = {
        dashboard: "Guudmarka Hoteelka",
        rooms: "Maamulka Qolalka",
        bookings: "Boos-qabsiyada",
        customers: "Macaamiisha",
        payments: "Lacag-bixinta",
        reports: "Warbixinnada",
        admin: "Maamulka"
    };

    document.getElementById("pageTitle").textContent =
        titles[page] || "SHAAM HOTEL";
}


// DASHBOARD
function renderDashboard() {
    let available = rooms.filter(r => r.status === "Available").length;
    let occupied = rooms.filter(r => r.status === "Occupied").length;

    let income = payments.reduce((total, payment) => {
        return total + Number(payment.amount);
    }, 0);

    document.getElementById("totalRooms").textContent = rooms.length;
    document.getElementById("availableRooms").textContent = available;
    document.getElementById("occupiedRooms").textContent = occupied;

    document.getElementById("totalIncome").textContent = money(income);
    document.getElementById("reportIncome").textContent = money(income);
}


// ROOMS
function renderRooms() {
    let table = document.getElementById("roomsTable");

    table.innerHTML = rooms.map(room => `
        <tr>
            <td>${room.number}</td>
            <td>${escapeHTML(room.type)}</td>
            <td>${money(room.price)}</td>
            <td>
                <span class="status ${room.status === "Available" ? "available" : "occupied"}">
                    ${room.status === "Available" ? "Bannaan" : "La degan yahay"}
                </span>
            </td>
            <td>
                ${currentUser && currentUser.role === "superadmin"
                    ? `<button class="action-btn" onclick="deleteRoom(${room.number})">Tirtir</button>`
                    : "—"}
            </td>
        </tr>
    `).join("");

    renderRoomOptions();
}


// ROOM OPTIONS
function renderRoomOptions() {
    let bookingSelect = document.getElementById("roomSelect");
    let priceSelect = document.getElementById("priceRoom");

    bookingSelect.innerHTML =
        '<option value="">Dooro qolka</option>';

    priceSelect.innerHTML =
        '<option value="">Dooro qolka</option>';

    rooms.forEach(room => {
        let priceOption = document.createElement("option");
        priceOption.value = room.number;
        priceOption.textContent =
            `Qolka ${room.number} - ${money(room.price)}`;

        priceSelect.appendChild(priceOption);

        if (room.status === "Available") {
            let bookingOption = document.createElement("option");

            bookingOption.value = room.number;
            bookingOption.textContent =
                `Qolka ${room.number} - ${room.type} (${money(room.price)})`;

            bookingSelect.appendChild(bookingOption);
        }
    });
}


// DELETE ROOM
function deleteRoom(roomNumber) {
    if (!currentUser || currentUser.role !== "superadmin") {
        alert("Kaliya Super Admin ayaa tirtiri kara qolalka.");
        return;
    }

    let room = rooms.find(r => r.number === roomNumber);

    if (!room || room.status !== "Available") {
        alert("Qol la degan yahay lama tirtiri karo.");
        return;
    }

    if (confirm("Ma hubtaa inaad tirtirayso qolka " + roomNumber + "?")) {
        rooms = rooms.filter(r => r.number !== roomNumber);
        saveRooms();
        renderAll();
    }
}


// CREATE BOOKING
document.getElementById("bookingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("customerName").value.trim();
    let phone = document.getElementById("customerPhone").value.trim();

    let roomNumber = Number(document.getElementById("roomSelect").value);

    let checkIn = document.getElementById("checkIn").value;
    let checkOut = document.getElementById("checkOut").value;

    let room = rooms.find(r => r.number === roomNumber);

    if (!room || room.status !== "Available") {
        alert("Qolkaas hadda ma bannaana.");
        return;
    }

    let start = new Date(checkIn + "T00:00:00");
    let end = new Date(checkOut + "T00:00:00");

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today || end <= start) {
        alert("Fadlan hubi taariikhaha aad gelisay.");
        return;
    }

    let nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    let total = nights * room.price;

    let booking = {
        id: Date.now(),
        customer: name,
        phone: phone,
        room: roomNumber,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        amount: total,
        paid: false
    };

    bookings.push(booking);

    room.status = "Occupied";

    saveBookings();
    saveRooms();

    this.reset();

    alert(
        "Boos-qabsiga waa la sameeyay!\n" +
        "Tirada habeenada: " + nights +
        "\nWadarta lacagta: " + money(total)
    );

    renderAll();
});


// RENDER BOOKINGS
function renderBookings() {
    let table = document.getElementById("bookingsTable");

    table.innerHTML = bookings.map(booking => `
        <tr>
            <td>${escapeHTML(booking.customer)}</td>
            <td>${booking.room}</td>
            <td>${booking.checkIn} ilaa ${booking.checkOut}</td>
            <td>${money(booking.amount)}</td>
            <td>
                ${
                    booking.paid
                    ? '<span class="status available">Waa la bixiyay</span>'
                    : `<button onclick="payBooking(${booking.id})">Bixi lacagta</button>`
                }

                <button class="action-btn"
                    onclick="cancelBooking(${booking.id})">
                    Jooji
                </button>
            </td>
        </tr>
    `).join("");
}


// PAY BOOKING
function payBooking(id) {
    let booking = bookings.find(b => b.id === id);

    if (!booking || booking.paid) {
        return;
    }

    if (confirm("Ma xaqiijinaysaa lacag-bixinta " + money(booking.amount) + "?")) {
        booking.paid = true;

        payments.push({
            id: Date.now(),
            customer: booking.customer,
            room: booking.room,
            amount: booking.amount,
            date: new Date().toLocaleDateString()
        });

        saveBookings();
        savePayments();

        renderAll();

        alert("Lacag-bixinta waa la diiwaangeliyay.");
    }
}


// CANCEL BOOKING
function cancelBooking(id) {
    let booking = bookings.find(b => b.id === id);

    if (!booking) return;

    if (booking.paid) {
        alert("Boos-qabsigan lacagtiisa waa la bixiyay. Fadlan marka hore xisaabi lacag-celinta.");
        return;
    }

    if (confirm("Ma hubtaa inaad joojinayso boos-qabsigan?")) {
        let room = rooms.find(r => r.number === booking.room);

        if (room) {
            room.status = "Available";
        }

        bookings = bookings.filter(b => b.id !== id);

        saveRooms();
        saveBookings();

        renderAll();
    }
}


// CUSTOMERS
function renderCustomers() {
    let table = document.getElementById("customersTable");

    table.innerHTML = bookings.map(booking => `
        <tr>
            <td>${escapeHTML(booking.customer)}</td>
            <td>${escapeHTML(booking.phone)}</td>
            <td>${booking.room}</td>
        </tr>
    `).join("");
}


// PAYMENTS
function renderPayments() {
    let table = document.getElementById("paymentsTable");

    table.innerHTML = payments.map(payment => `
        <tr>
            <td>${escapeHTML(payment.customer)}</td>
            <td>${payment.room}</td>
            <td>${money(payment.amount)}</td>
            <td>${payment.date}</td>
        </tr>
    `).join("");
}


// UPDATE ROOM PRICE
document.getElementById("priceForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let roomNumber = Number(document.getElementById("priceRoom").value);
    let newPrice = Number(document.getElementById("newPrice").value);

    let room = rooms.find(r => r.number === roomNumber);

    if (!room || newPrice <= 0) {
        alert("Fadlan geli qiime sax ah.");
        return;
    }

    room.price = newPrice;

    saveRooms();

    this.reset();

    document.getElementById("adminMessage").textContent =
        "Qiimaha qolka waa la cusboonaysiiyay.";

    document.getElementById("adminMessage").style.color = "green";

    renderAll();
});


// ADD ADMIN
document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!currentUser || currentUser.role !== "superadmin") {
        alert("Kaliya Super Admin ayaa maamule cusub samayn kara.");
        return;
    }

    let username = document.getElementById("newAdminUsername").value.trim();
    let password = document.getElementById("newAdminPassword").value;

    if (username.length < 3 || username.length > 20) {
        alert("Magaca isticmaaluhu waa inuu ka koobnaadaa 3 ilaa 20 xaraf.");
        return;
    }

    if (password.length < 6) {
        alert("Furaha sirta ahi waa inuu ka koobnaadaa ugu yaraan 6 xaraf.");
        return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Magacan hore ayaa loo isticmaalay.");
        return;
    }

    users.push({
        username: username,
        password: password,
        role: "admin"
    });

    saveUsers();

    this.reset();

    document.getElementById("adminMessage").textContent =
        "Maamulaha cusub si guul leh ayaa loo sameeyay.";

    document.getElementById("adminMessage").style.color = "green";
});


// RENDER EVERYTHING
function renderAll() {
    renderDashboard();
    renderRooms();
    renderBookings();
    renderCustomers();
    renderPayments();
}


// INITIAL SETUP
document.getElementById("checkIn").min =
    new Date().toISOString().split("T")[0];

renderAll();
