let allUsers = [];

// Ma'lumotlarni yuklab olish (GitHub -> Muvaffaqiyatsiz bo'lsa Lokal)
async function fetchUsers() {
    const gridContainer = document.getElementById('cardGrid');
    
    // O'ZINGIZNING GITHUB RAW HAVOLANGIZNI SHU YERGA YOZING:
    const githubUrl = 'https://raw.githubusercontent.com/foydalanuvchi_nomi/repo_nomi/main/data.json';
    const localUrl = 'data.json';

    try {
        let response;
        try {
            // 1. Avval GitHub'dan olishga harakat qiladi
            response = await fetch(githubUrl);
            if (!response.ok) throw new Error("GitHub'dan olib bo'lmadi");
            console.log("Ma'lumot GitHub'dan olindi!");
        } catch (githubError) {
            console.warn("GitHub ishlamadi, lokal faylga o'tilmoqda...", githubError);
            // 2. Agar GitHub ishlamasa, lokal fayldan o'qiydi
            response = await fetch(localUrl);
            if (!response.ok) throw new Error("Lokal faylni ҳам o'qib bo'lmadi!");
            console.log("Ma'lumot lokal fayldan olindi!");
        }
        
        allUsers = await response.json();
        
        populateJobFilter(allUsers);
        displayUsers(allUsers);

    } catch (error) {
        gridContainer.innerHTML = `<div class="error"><i class="fa-solid fa-triangle-exclamation"></i> Xatolik: ${error.message}<br><small>Iltimos, internet aloqasini yoki fayl nomlarini tekshiring!</small></div>`;
    }
}

// Kasblar bo'yicha filter menyusini to'ldirish
function populateJobFilter(users) {
    const jobFilterSelect = document.getElementById('jobFilter');
    const uniqueJobs = [...new Set(users.map(user => user.job).filter(Boolean))];
    
    jobFilterSelect.innerHTML = '<option value="all">Barcha kasblar</option>';
    
    uniqueJobs.forEach(job => {
        jobFilterSelect.innerHTML += `<option value="${job}">${job}</option>`;
    });
}

// Foydalanuvchilarni ekranga chizish
function displayUsers(users) {
    const gridContainer = document.getElementById('cardGrid');
    
    if (users.length === 0) {
        gridContainer.innerHTML = `<div class="loading">Hech qanday ma'lumot topilmadi.</div>`;
        return;
    }

    gridContainer.innerHTML = "";

    users.forEach(user => {
        const nameStr = user.full_name || "User";
        const initials = nameStr.split(' ').map(n => n[0]).join('');

        gridContainer.innerHTML += `
            <div class="card">
                <!-- Minimal ko'rinish -->
                <div class="card-header">
                    <div class="avatar">${initials}</div>
                    <div class="user-info">
                        <h3>${user.full_name || 'Nomaʼlum'}</h3>
                        <span class="badge">${user.job || 'Mutaxassis'}</span>
                    </div>
                </div>

                <!-- Hover qilinganda ochiladigan barcha ma'lumotlar -->
                <div class="card-details">
                    <div class="info-item">
                        <i class="fa-solid fa-id-badge"></i>
                        <span><strong>ID:</strong> ${user.id}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-phone"></i>
                        <span><strong>Tel:</strong> ${user.phone_number || 'Kiritilmagan'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-envelope"></i>
                        <span><strong>Email:</strong> ${user.email || 'Kiritilmagan'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span><strong>Shahar:</strong> ${user.city || 'Kiritilmagan'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-briefcase"></i>
                        <span><strong>Staji:</strong> ${user.experience || 'Kiritilmagan'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-user-clock"></i>
                        <span><strong>Yoshi:</strong> ${user.age || 'Kiritilmagan'} yosh</span>
                    </div>
                </div>

                <!-- Xabar yozish tugmasi -->
                <button class="msg-btn" onclick="sendMessage('${user.full_name}')">
                    <i class="fa-solid fa-paper-plane"></i> Xabar yozish
                </button>
            </div>
        `;
    });
}

// Xabar yozish funksiyasi
function sendMessage(userName) {
    const message = prompt(`${userName}ga qanday xabar yubormoqchisiz?`);
    if (message) {
        alert(`Xabaringiz muvaffaqiyatli yuborildi!\n\nKimga: ${userName}\nXabar: "${message}"`);
    }
}

// Qidirish va Saralash funksiyasi
function filterUsers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const searchType = document.getElementById('searchType').value;
    const selectedJob = document.getElementById('jobFilter').value;

    const filtered = allUsers.filter(user => {
        const matchesJob = (selectedJob === 'all') || (user.job === selectedJob);

        let matchesSearch = true;
        if (searchText !== '') {
            if (searchType === 'all') {
                matchesSearch = Object.values(user).some(value => 
                    value !== null && value !== undefined && value.toString().toLowerCase().includes(searchText)
                );
            } else {
                const fieldValue = user[searchType] ? user[searchType].toString().toLowerCase() : '';
                matchesSearch = fieldValue.includes(searchText);
            }
        }

        return matchesJob && matchesSearch;
    });

    displayUsers(filtered);
}

// Sahifa yuklanganda ishga tushadi
window.onload = fetchUsers;