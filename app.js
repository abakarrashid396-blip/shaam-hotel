// ==========================================
// SHAAM HOTEL MANAGEMENT SYSTEM
// ==========================================

// SUPER ADMIN LOGIN:
// Username: owner
// PIN: 1234

const SUPER_ADMIN = {
    username: "owner",
    pin: "1234",
    fullName: "Super Admin",
    role: "superadmin"
};

let users = JSON.parse(localStorage.getItem("shaamUsers")) || [];
let bookings = JSON.parse(localStorage.getItem("shaamBookings")) || [];
let payments = JSON.parse(localStorage.getItem("shaamPayments")) || [];

let currentUser = null;
let currentPage = "dashboard";

const rooms = [
    ...Array.from({ length: 5 }, (_, i) => ({
        number: 301 + i,
        type: "Single",
        price: 1600
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
        number: 306 + i,
        type: "Double",
        price: 2000
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        number: 311 + i,
        type: "Family",
        price: 1800
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        number: 315 + i,
        type: "Deluxe",
        price: 3000
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
        number: 319 + i,
        type: "Suite",
        price: 3500
    }))
];

const translations = {
    so: {
        dashboard: "Dashboard",
        bookings: "Dalabaadka",
        rooms: "Qolalka",
        customers: "Macaamiisha",
        payments: "Lacagaha",
        reports: "Warbixinnada",
        mybookings: "Dalabkayga",
        staff: "Shaqaalaha"
    },
    en: {
        dashboard: "Dashboard",
        bookings: "Bookings",
        rooms: "Rooms",
        customers: "Customers",
        payments: "Payments",
        reports: "Reports",
        mybookings: "My Bookings",
        staff: "Staff Management"
    }
};

function saveData() {
    localStorage.setItem("shaamUsers", JSON.stringify(users));
    localStorage.setItem("shaamBookings", JSON.stringify(bookings));
    localStorage.setItem("shaamPayments", JSON.stringify(payments));
}

// ==========================================
// AUTHENTICATION
// ==========================================

function showAuth(type) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");

    loginForm.classList.toggle("hidden", type !== "login");
    registerForm.classList.toggle("hidden", type !== "register");

    loginTab.classList.toggle("active", type === "login");
    registerTab.classList.toggle("active", type === "register");
}

document.getElementById("loginTab").addEventListener("click", () => {
    showAuth("login");
});

document.getElementById("registerTab").addEventListener("click", () => {
    showAuth("register");
});

// CUSTOMER REGISTRATION

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("newUsername").value.trim().toLowerCase();
    const pin = document.getElementById("newPin").value.trim();
    const confirmPin = document.getElementById("confirmPin").value.trim();
    const message = document.getElementById("registerMessage");

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        message.textContent = "PIN-ku waa inuu noqdaa 4 lambar.";
        return;
    }

    if (pin !== confirmPin) {
        message.textContent = "PIN-yadu isma laha.";
        return;
    }

    if (username === SUPER_ADMIN.username) {
        message.textContent = "Username-kan lama isticmaali karo.";
        return;
    }

    if (users.some(user => user.username === username)) {
        message.textContent = "Username-kan horay ayaa loo isticmaalay.";
        return;
    }

    users.push({
        id: Date.now(),
        fullName,
        username,
        pin,
        role: "customer",
        createdAt: new Date().toISOString()
    });

    saveData();

    message.style.color = "#29bd82";
    message.textContent = "Account-ka waa la sameeyay. Hadda gal.";

    this.reset();

    setTimeout(() => {
        message.style.color = "";
        message.textContent = "";
        showAuth("login");
    }, 1200);
});

// LOGIN

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const pin = document.getElementById("loginPin").value.trim();
    const message = document.getElementById("loginMessage");

    // SUPER ADMIN

    if (username === SUPER_ADMIN.username && pin === SUPER_ADMIN.pin) {
        currentUser = {
            ...SUPER_ADMIN,
            id: "superadmin"
        };

        enterSystem();
        return;
    }

    // OTHER USERS

    const user = users.find(u =>
        u.username === username && u.pin === pin
    );

    if (!user) {
        message.textContent = "Username ama PIN waa khaldan yahay.";
        return;
    }

    currentUser = user;
    enterSystem();
});

function enterSystem() {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").textContent = "";

    document.getElementById("userName").textContent = currentUser.fullName;
    document.getElementById("userRole").textContent = getRoleName(currentUser.role);
    document.getElementById("userAvatar").textContent =
        currentUser.fullName.charAt(0).toUpperCase();

    setupNavigation();
    renderPage("dashboard");
}

function getRoleName(role) {
    const names = {
        superadmin: "Super Admin",
        admin: "Administrator",
        customer: "Customer"
    };

    return names[role] || "User";
}

// LOGOUT

document.getElementById("logoutBtn").addEventListener("click", function() {
    currentUser = null;

    document.getElementById("app").classList.add("hidden");
    document.getElementById("authScreen").classList.remove("hidden");

    showAuth("login");
    showToast("Waad ka baxday system-ka.");
});

// ==========================================
// NAVIGATION & PERMISSIONS
// ==========================================

function setupNavigation() {
    const nav = document.getElementById("mainNav");
    const links = nav.querySelectorAll(".nav-link");

    links.forEach(link => {
        const page = link.dataset.page;

        if (currentUser.role === "customer") {
            link.style.display =
                ["dashboard", "rooms", "mybookings"].includes(page)
                    ? "flex"
                    : "none";
        } else {
            link.style.display = "flex";

            if (page === "mybookings") {
                link.style.display = "none";
            }
        }

        if (page === "staff") {
            link.style.display =
                currentUser.role === "superadmin" ? "flex" : "none";
        }
    });

    document.querySelector(".admin-menu-label").style.display =
        currentUser.role === "superadmin" ? "block" : "none";
}

document.getElementById("mainNav").addEventListener("click", function(e) {
    const link = e.target.closest(".nav-link");

    if (!link) return;

    const page = link.dataset.page;

    if (
        page === "staff" &&
        currentUser.role !== "superadmin"
    ) {
        showToast("Ma lihid oggolaansho.");
        return;
    }

    currentPage = page;

    document.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
    });

    link.classList.add("active");

    renderPage(page);

    document.getElementById("sidebar").classList.remove("open");
});

// MOBILE MENU

document.getElementById("mobileMenu").addEventListener("click", function() {
    document.getElementById("sidebar").classList.toggle("open");
});

// LANGUAGE

document.getElementById("languageSelect").addEventListener("change", function() {
    const language = this.value;
    const names = translations[language];

    document.querySelectorAll(".nav-link").forEach(link => {
        const page = link.dataset.page;
        const span = link.querySelector("span");

        if (names[page]) {
            span.textContent = names[page];
        }
    });

    showToast(language === "so" ? "Luqadda waa la beddelay." : "Language changed.");
});

// ==========================================
// PAGE RENDERING
// ==========================================

function renderPage(page) {
    currentPage = page;

    const titles = translations[document.getElementById("languageSelect").value];

    document.getElementById("pageTitle").textContent =
        titles[page] || "Shaam Hotel";

    document.getElementById("todayLabel").textContent =
        new Date().toLocaleDateString();

    const content = document.getElementById("pageContent");

    if (page === "dashboard") {
        renderDashboard(content);
    }

    else if (page === "bookings") {
        renderBookings(content);
    }

    else if (page === "rooms") {
        renderRooms(content);
    }

    else if (page === "customers") {
        renderCustomers(content);
    }

    else if (page === "payments") {
        renderPayments(content);
    }

    else if (page === "reports") {
        renderReports(content);
    }

    else if (page === "mybookings") {
        renderMyBookings(content);
    }

    else if (page === "staff") {
        if (currentUser.role !== "superadmin") {
            content.innerHTML = "<h2>Access Denied</h2>";
            return;
        }

        renderStaff(content);
    }
}

// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard(content) {
    const occupied = rooms.filter(room => isRoomOccupied(room.number)).length;
    const available = rooms.length - occupied;

    const revenue = payments
        .filter(p => p.status === "Paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const pending = bookings.filter(b => b.status === "Pending").length;

    const isCustomer = currentUser.role === "customer";

    if (isCustomer) {
        content.innerHTML = `
            <div class="customer-welcome">
                <h2>Ku soo dhowow Shaam Hotel</h2>
                <p>
                    Waxaan kuu diyaarinay adeeg hoteel oo tayo sare leh.
                    Waxaad ka dooran kartaa qolalka bannaan,
                    waxaadna samayn kartaa booking cusub.
                </p>
                <button class="btn btn-gold" onclick="renderPage('rooms')">
                    <i class="fa-solid fa-bed"></i> Eeg Qolalka
                </button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon icon-gold">
                        <i class="fa-solid fa-ticket"></i>
                    </div>
                    <h3>${bookings.filter(b => b.customerId === currentUser.id).length}</h3>
                    <p>Dalabyadayda</p>
                </div>

                <div class="stat-card">
                    <div class="stat-icon icon-green">
                        <i class="fa-solid fa-bed"></i>
                    </div>
                    <h3>${available}</h3>
                    <p>Qolal Bannaan</p>
                </div>
            </div>
        `;

        return;
    }

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Hotel Overview</h2>
                <p>Ku soo dhowow maamulka Shaam Hotel.</p>
            </div>

            <button class="btn btn-gold" onclick="openBookingModal()">
                <i class="fa-solid fa-plus"></i> Booking Cusub
            </button>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <div class="stat-top">
                    <span class="stat-icon icon-gold">
                        <i class="fa-solid fa-bed"></i>
                    </span>
                </div>
                <h3>${rooms.length}</h3>
                <p>Wadarta Qolalka</p>
            </div>

            <div class="stat-card">
                <div class="stat-top">
                    <span class="stat-icon icon-green">
                        <i class="fa-solid fa-door-open"></i>
                    </span>
                </div>
                <h3>${available}</h3>
                <p>Qolal Bannaan</p>
            </div>

            <div class="stat-card">
                <div class="stat-top">
                    <span class="stat-icon icon-blue">
                        <i class="fa-solid fa-calendar-check"></i>
                    </span>
                </div>
                <h3>${bookings.length}</h3>
                <p>Wadarta Bookings</p>
            </div>

            <div class="stat-card">
                <div class="stat-top">
                    <span class="stat-icon icon-red">
                        <i class="fa-solid fa-clock"></i>
                    </span>
                </div>
                <h3>${pending}</h3>
                <p>Bookings Sugaya</p>
            </div>

        </div>

        <div class="content-grid">

            <div class="panel">
                <div class="panel-header">
                    <h3>Bookings-kii Ugu Dambeeyay</h3>
                    <span>${bookings.length} Bookings</span>
                </div>

                ${bookingTable(bookings.slice(-5).reverse())}
            </div>

            <div class="panel">
                <div class="panel-header">
                    <h3>Hotel Revenue</h3>
                    <span>Birr</span>
                </div>

                <h2 style="color:var(--gold);font-size:30px;margin:20px 0">
                    ${revenue.toLocaleString()} Birr
                </h2>

                <p style="color:var(--muted);font-size:12px">
                    Lacagta laga diiwaangeliyay payments-ka la bixiyay.
                </p>

                <hr style="border:0;border-top:1px solid var(--border);margin:20px 0">

                <p style="font-size:12px;color:var(--muted)">
                    Macaamiisha: ${users.filter(u => u.role === "customer").length}
                </p>
            </div>

        </div>
    `;
}

// ==========================================
// ROOMS
// ==========================================

function isRoomOccupied(roomNumber) {
    const today = new Date().toISOString().split("T")[0];

    return bookings.some(b =>
        Number(b.roomNumber) === Number(roomNumber) &&
        b.status === "Confirmed" &&
        b.checkIn <= today &&
        b.checkOut > today
    );
}

function renderRooms(content) {
    const roomCards = rooms.map(room => {
        const occupied = isRoomOccupied(room.number);

        return `
            <div class="room-card">
                <div class="room-number">
                    Room ${room.number}
                </div>

                <div class="room-type">${room.type}</div>

                <span class="status ${occupied ? "occupied" : "available"}">
                    ${occupied ? "Occupied" : "Available"}
                </span>

                <div class="room-price">
                    ${room.price.toLocaleString()} Birr / Night
                </div>

                ${
                    currentUser.role === "customer" && !occupied
                    ? `<button class="btn btn-gold" onclick="openBookingModal(${room.number})">
                        Book Room
                       </button>`
                    : ""
                }
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Room Management</h2>
                <p>Maamul 21-ka qol ee Shaam Hotel.</p>
            </div>

            <span class="status available">${rooms.length} Rooms</span>
        </div>

        <div class="rooms-grid">
            ${roomCards}
        </div>
    `;
}

// ==========================================
// BOOKING SYSTEM
// ==========================================

function openBookingModal(selectedRoom = "") {
    const availableRooms = rooms.filter(room =>
        !isRoomOccupied(room.number)
    );

    if (!availableRooms.length) {
        showToast("Ma jiraan qolal bannaan.");
        return;
    }

    const roomOptions = availableRooms.map(room => `
        <option
            value="${room.number}"
            ${Number(selectedRoom) === room.number ? "selected" : ""}
        >
            Room ${room.number} - ${room.type} - ${room.price} Birr
        </option>
    `).join("");

    const customerOptions = users
        .filter(u => u.role === "customer")
        .map(u => `
            <option value="${u.id}">${escapeHTML(u.fullName)}</option>
        `).join("");

    const customerField = currentUser.role === "customer"
        ? ""
        : `
            <div class="field">
                <label>Customer</label>
                <select id="bookingCustomer" required>
                    <option value="">Dooro macmiil</option>
                    ${customerOptions}
                </select>
            </div>
        `;

    showModal(`
        <div class="modal-header">
            <h3>New Room Booking</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <form id="bookingForm">

            ${customerField}

            <div class="field">
                <label>Room Number</label>
                <select id="bookingRoom" required>
                    <option value="">Dooro qol</option>
                    ${roomOptions}
                </select>
            </div>

            <div class="form-grid">
                <div class="field">
                    <label>Check In</label>
                    <input type="date" id="checkIn" required>
                </div>

                <div class="field">
                    <label>Check Out</label>
                    <input type="date" id="checkOut" required>
                </div>
            </div>

            <div class="field">
                <label>Number of Guests</label>
                <input type="number" id="guestCount" min="1" value="1" required>
            </div>

            <div class="field">
                <label>Notes</label>
                <textarea id="bookingNotes" placeholder="Additional information"></textarea>
            </div>

            <button class="btn btn-gold" type="submit">
                Confirm Booking Request
            </button>

        </form>
    `);

    document.getElementById("bookingForm").addEventListener("submit", createBooking);
}

function createBooking(e) {
    e.preventDefault();

    const roomNumber = Number(document.getElementById("bookingRoom").value);
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const guestCount = Number(document.getElementById("guestCount").value);

    const room = rooms.find(r => r.number === roomNumber);

    if (!room) {
        showToast("Fadlan dooro qol sax ah.");
        return;
    }

    if (checkIn < new Date().toISOString().split("T")[0]) {
        showToast("Check-in-ku ma noqon karo maalin hore.");
        return;
    }

    if (checkOut <= checkIn) {
        showToast("Check-out-ku waa inuu ka dambeeyaa check-in.");
        return;
    }

    const overlap = bookings.some(b =>
        Number(b.roomNumber) === roomNumber &&
        ["Pending", "Confirmed"].includes(b.status) &&
        checkIn < b.checkOut &&
        checkOut > b.checkIn
    );

    if (overlap) {
        showToast("Qolkan waqtigaas waa la dalbaday.");
        return;
    }

    let customer;

    if (currentUser.role === "customer") {
        customer = currentUser;
    } else {
        const customerId = Number(document.getElementById("bookingCustomer").value);
        customer = users.find(u => u.id === customerId);
    }

    if (!customer) {
        showToast("Fadlan dooro macmiil.");
        return;
    }

    const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / 86400000
    );

    const total = nights * room.price;

    bookings.push({
        id: Date.now(),
        customerId: customer.id,
        customerName: customer.fullName,
        roomNumber,
        roomType: room.type,
        checkIn,
        checkOut,
        guestCount,
        notes: document.getElementById("bookingNotes").value,
        nights,
        total,
        status: "Pending",
        createdAt: new Date().toISOString()
    });

    saveData();
    closeModal();

    showToast("Booking request waa la diiwaangeliyay.");

    renderPage(currentPage);
}

// ==========================================
// BOOKING TABLE
// ==========================================

function bookingTable(data) {
    if (!data.length) {
        return `<div class="empty-state">Weli booking lama diiwaangelin.</div>`;
    }

    return `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Room</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${data.map(b => `
                        <tr>
                            <td>${escapeHTML(b.customerName)}</td>
                            <td>${b.roomNumber}</td>
                            <td>${b.checkIn}</td>
                            <td>${b.checkOut}</td>
                            <td>${b.total.toLocaleString()} Birr</td>
                            <td>
                                <span class="status ${b.status.toLowerCase()}">
                                    ${b.status}
                                </span>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderBookings(content) {
    if (currentUser.role === "customer") {
        content.innerHTML = "<h2>Access Denied</h2>";
        return;
    }

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Booking Management</h2>
                <p>Maamul dhammaan dalabaadka hoteelka.</p>
            </div>

            <button class="btn btn-gold" onclick="openBookingModal()">
                <i class="fa-solid fa-plus"></i> New Booking
            </button>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>All Bookings</h3>
                <span>${bookings.length} Records</span>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Room</th>
                            <th>Dates</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${bookings.length ? bookings.map(b => `
                            <tr>
                                <td>${escapeHTML(b.customerName)}</td>
                                <td>${b.roomNumber}</td>
                                <td>${b.checkIn} → ${b.checkOut}</td>
                                <td>${b.total.toLocaleString()} Birr</td>
                                <td>
                                    <span class="status ${b.status.toLowerCase()}">
                                        ${b.status}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        ${
                                            b.status === "Pending"
                                            ? `<button class="btn-success" onclick="updateBooking(${b.id}, 'Confirmed')">Approve</button>`
                                            : ""
                                        }

                                        ${
                                            b.status !== "Cancelled"
                                            ? `<button class="btn-danger" onclick="updateBooking(${b.id}, 'Cancelled')">Cancel</button>`
                                            : ""
                                        }
                                    </div>
                                </td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="6" class="empty-state">
                                    No bookings found.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function updateBooking(id, status) {
    const booking = bookings.find(b => b.id === id);

    if (!booking) return;

    booking.status = status;
    saveData();

    showToast("Booking status waa la beddelay.");
    renderPage(currentPage);
}

// ==========================================
// CUSTOMERS
// ==========================================

function renderCustomers(content) {
    const customers = users.filter(u => u.role === "customer");

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Customer Management</h2>
                <p>Liiska macaamiisha Shaam Hotel.</p>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Registered Customers</h3>
                <span>${customers.length} Customers</span>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Bookings</th>
                            <th>Registration</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${customers.length ? customers.map(c => `
                            <tr>
                                <td>${escapeHTML(c.fullName)}</td>
                                <td>${escapeHTML(c.username)}</td>
                                <td>${bookings.filter(b => b.customerId === c.id).length}</td>
                                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4" class="empty-state">
                                    No customers registered.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==========================================
// PAYMENTS
// ==========================================

function renderPayments(content) {
    if (currentUser.role === "customer") {
        content.innerHTML = "<h2>Access Denied</h2>";
        return;
    }

    const unpaid = bookings.filter(b =>
        b.status === "Confirmed" &&
        !payments.some(p => p.bookingId === b.id && p.status === "Paid")
    );

    const totalPaid = payments
        .filter(p => p.status === "Paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Payment Management</h2>
                <p>Maamulka lacagaha iyo rasiidhada.</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon icon-green">
                    <i class="fa-solid fa-money-bill"></i>
                </div>
                <h3>${totalPaid.toLocaleString()}</h3>
                <p>Total Paid (Birr)</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon icon-gold">
                    <i class="fa-solid fa-hourglass-half"></i>
                </div>
                <h3>${unpaid.length}</h3>
                <p>Unpaid Bookings</p>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Unpaid Confirmed Bookings</h3>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Room</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${unpaid.length ? unpaid.map(b => `
                            <tr>
                                <td>${escapeHTML(b.customerName)}</td>
                                <td>${b.roomNumber}</td>
                                <td>${b.total.toLocaleString()} Birr</td>
                                <td>
                                    <button class="btn btn-gold"
                                        onclick="markPayment(${b.id})">
                                        Mark as Paid
                                    </button>
                                </td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4" class="empty-state">
                                    Ma jiraan lacag-bixin sugaysa.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="panel" style="margin-top:20px">
            <div class="panel-header">
                <h3>Payment History</h3>
            </div>

            ${payments.length ? `
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${escapeHTML(p.customerName)}</td>
                                    <td>${p.amount.toLocaleString()} Birr</td>
                                    <td>${new Date(p.date).toLocaleDateString()}</td>
                                    <td><span class="status paid">Paid</span></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="empty-state">Weli lacag lama diiwaangelin.</div>`}
        </div>
    `;
}

function markPayment(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) return;

    const alreadyPaid = payments.some(p =>
        p.bookingId === bookingId && p.status === "Paid"
    );

    if (alreadyPaid) {
        showToast("Booking-kan hore ayaa loo bixiyay.");
        return;
    }

    payments.push({
        id: Date.now(),
        bookingId,
        customerName: booking.customerName,
        amount: booking.total,
        status: "Paid",
        date: new Date().toISOString()
    });

    saveData();
    showToast("Payment waa la diiwaangeliyay.");
    renderPage("payments");
}

// ==========================================
// REPORTS
// ==========================================

function renderReports(content) {
    if (currentUser.role === "customer") {
        content.innerHTML = "<h2>Access Denied</h2>";
        return;
    }

    const revenue = payments
        .filter(p => p.status === "Paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const confirmed = bookings.filter(b => b.status === "Confirmed").length;
    const cancelled = bookings.filter(b => b.status === "Cancelled").length;
    const pending = bookings.filter(b => b.status === "Pending").length;

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Hotel Reports</h2>
                <p>Warbixinta guud ee Shaam Hotel.</p>
            </div>

            <button class="btn btn-gold" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Print Report
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon icon-green">
                    <i class="fa-solid fa-money-bill-wave"></i>
                </div>
                <h3>${revenue.toLocaleString()}</h3>
                <p>Total Revenue (Birr)</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon icon-blue">
                    <i class="fa-solid fa-check-circle"></i>
                </div>
                <h3>${confirmed}</h3>
                <p>Confirmed Bookings</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon icon-gold">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <h3>${pending}</h3>
                <p>Pending Bookings</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon icon-red">
                    <i class="fa-solid fa-ban"></i>
                </div>
                <h3>${cancelled}</h3>
                <p>Cancelled Bookings</p>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Booking Summary</h3>
            </div>

            <div class="chart-bars">
                <div class="chart-bar" style="height:${Math.max(confirmed * 15, 5)}px">
                    <span>Confirmed</span>
                </div>

                <div class="chart-bar" style="height:${Math.max(pending * 15, 5)}px">
                    <span>Pending</span>
                </div>

                <div class="chart-bar" style="height:${Math.max(cancelled * 15, 5)}px">
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// CUSTOMER BOOKINGS
// ==========================================

function renderMyBookings(content) {
    const myBookings = bookings.filter(b =>
        b.customerId === currentUser.id
    );

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>My Bookings</h2>
                <p>La soco xaaladda dalabaadkaaga.</p>
            </div>

            <button class="btn btn-gold" onclick="renderPage('rooms')">
                <i class="fa-solid fa-plus"></i> Book a Room
            </button>
        </div>

        <div class="panel">
            ${bookingTable(myBookings)}
        </div>
    `;
}

// ==========================================
// STAFF MANAGEMENT
// SUPER ADMIN ONLY
// ==========================================

function renderStaff(content) {
    if (currentUser.role !== "superadmin") {
        content.innerHTML = "<h2>Access Denied</h2>";
        return;
    }

    const admins = users.filter(u => u.role === "admin");

    content.innerHTML = `
        <div class="page-heading">
            <div>
                <h2>Staff Management</h2>
                <p>Super Admin oo keliya ayaa abuuri kara Admin cusub.</p>
            </div>

            <button class="btn btn-gold" onclick="openAdminModal()">
                <i class="fa-solid fa-user-plus"></i> Create Admin
            </button>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Hotel Administrators</h3>
                <span>${admins.length} Admins</span>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${admins.length ? admins.map(admin => `
                            <tr>
                                <td>${escapeHTML(admin.fullName)}</td>
                                <td>${escapeHTML(admin.username)}</td>
                                <td><span class="status confirmed">Admin</span></td>
                                <td>
                                    <button class="btn btn-danger"
                                        onclick="deleteAdmin(${admin.id})">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4" class="empty-state">
                                    Weli Admin lama abuurin.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openAdminModal() {
    if (currentUser.role !== "superadmin") {
        showToast("Kaliya Super Admin ayaa samayn kara Admin.");
        return;
    }

    showModal(`
        <div class="modal-header">
            <h3>Create New Administrator</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <form id="adminForm">

            <div class="field">
                <label>Full Name</label>
                <input type="text" id="adminName" required>
            </div>

            <div class="field">
                <label>Username</label>
                <input type="text" id="adminUsername" required>
            </div>

            <div class="field">
                <label>4-Digit PIN</label>
                <input type="password" id="adminPin" maxlength="4"
                    inputmode="numeric" required>
            </div>

            <button type="submit" class="btn btn-gold">
                Create Administrator
            </button>
        </form>
    `);

    document.getElementById("adminForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("adminName").value.trim();
        const username = document.getElementById("adminUsername").value.trim().toLowerCase();
        const pin = document.getElementById("adminPin").value.trim();

        if (!/^\d{4}$/.test(pin)) {
            showToast("PIN-ku waa inuu noqdaa 4 lambar.");
            return;
        }

        if (
            username === SUPER_ADMIN.username ||
            users.some(u => u.username === username)
        ) {
            showToast("Username-kan horay ayaa loo isticmaalay.");
            return;
        }

        users.push({
            id: Date.now(),
            fullName: name,
            username,
            pin,
            role: "admin",
            createdAt: new Date().toISOString()
        });

        saveData();
        closeModal();

        showToast("Admin cusub waa la abuuray.");
        renderPage("staff");
    });
}

function deleteAdmin(id) {
    if (currentUser.role !== "superadmin") return;

    if (!confirm("Ma hubtaa inaad tirtirayso Admin-kan?")) return;

    users = users.filter(u => u.id !== id);

    saveData();
    showToast("Admin waa la tirtiray.");
    renderPage("staff");
}

// ==========================================
// MODAL
// ==========================================

function showModal(html) {
    const root = document.getElementById("modalRoot");

    root.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-box">
                ${html}
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById("modalRoot").innerHTML = "";
}

// ==========================================
// TOAST
// ==========================================

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================
// SECURITY HELPER FOR DISPLAY TEXT
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}