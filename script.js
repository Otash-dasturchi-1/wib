// GitHub'dagi raw havolangizni shu yerga 
const githubUrl = 'https://raw.githubusercontent.com/Otash-dasturchi-1/wib/main/data.json';

let allUsers = [];
let activeCategory = 'all';
let searchQuery = '';
let selectedUser = null;

const gridEl = document.getElementById('cards-grid');
const searchInput = document.getElementById('search-input');
const categoryContainer = document.getElementById('category-container');

const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const sendMessageBtn = document.getElementById('send-message-btn');
const userMessageInput = document.getElementById('user-message');

// Ma'lumotlarni yuklab olish (GitHub + Local Fallback)
function loadData() {
    fetch(githubUrl)
        .then(res => {
            if (!res.ok) throw new Error("GitHub yuklanmadi");
            return res.json();
        })
        .then(data => {
            allUsers = data;
            initApp();
        })
        .catch(err => {
            console.warn("GitHub ishlamadi, lokal data.json ishlatilmoqda...", err);
            fetch('data.json')
                .then(res => res.json())
                .then(data => {
                    allUsers = data;
                    initApp();
                })
                .catch(e => console.error("Ma'lumotlarni topib bo'lmadi:", e));
        });
}

function initApp() {
    generateCategories();
    renderUsers();
}

// Kategoriyalarni dinamik hosil qilish
function generateCategories() {
    const jobs = [...new Set(allUsers.map(user => user.job))];
    
    jobs.forEach(job => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-category', job);
        btn.textContent = job;
        categoryContainer.appendChild(btn);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeCategory = e.target.getAttribute('data-category');
            renderUsers();
        });
    });
}

// Foydalanuvchilarni ekranga chiqarish
function renderUsers() {
    gridEl.innerHTML = '';

    const filtered = allUsers.filter(user => {
        const matchesCategory = activeCategory === 'all' || user.job === activeCategory;
        const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              user.job.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        gridEl.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Hech qanday maʼlumot topilmadi.</p>';
        return;
    }

    filtered.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <h3>${user.full_name}</h3>
            <p><strong>Shahar:</strong> ${user.city}</p>
            <p><strong>Yosh:</strong> ${user.age} | <strong>Tajriba:</strong> ${user.experience}</p>
            <span class="job-badge">${user.job}</span>
        `;

        card.addEventListener('click', () => openModal(user));
        gridEl.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderUsers();
});

function openModal(user) {
    selectedUser = user;
    document.getElementById('modal-name').textContent = user.full_name;
    document.getElementById('modal-job').textContent = `Kasbi: ${user.job}`;
    document.getElementById('modal-city').textContent = `Shahar: ${user.city}`;
    document.getElementById('modal-phone').textContent = `Telefon: ${user.phone_number}`;
    document.getElementById('modal-email').textContent = `Email: ${user.email}`;
    userMessageInput.value = '';
    
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    modalOverlay.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

sendMessageBtn.addEventListener('click', () => {
    const messageText = userMessageInput.value.trim();
    if (!messageText) {
        alert('Iltimos, xabar matnini kiriting!');
        return;
    }
    alert(`Xabaringiz ${selectedUser.full_name} ga muvaffaqiyatli yuborildi!`);
    closeModal();
});

loadData();