// Ambil instance Firebase
const auth = window.firebaseApp.auth;
const db = window.firebaseApp.db;
const MANGA_REF = db.ref('manga');

// Fungsi utilitas
function isAdmin() {
  const user = auth.currentUser;
  return user && user.email === "nurokhim430@gmail.com"; // sesuaikan dengan email admin-mu
}

// =============== UTILS ===============
async function getAllManga() {
  const res = await fetch('data/manga.json');
  return await res.json();
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function saveBookmark(id) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  if (!bookmarks.includes(id)) {
    bookmarks.push(id);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    alert('Disimpan ke bookmark!');
  }
}

function getBookmarks() {
  return JSON.parse(localStorage.getItem('bookmarks') || '[]');
}

// =============== HOME ===============
async function showRandomManga() {
  const mangaList = await getAllManga();
  const random = shuffle(mangaList).slice(0, 6);
  const container = document.getElementById('recommendation');
  container.innerHTML = random.map(m => `
    <div class="manga-card" onclick="window.location='manga.html?id=${m.id}'">
      <img src="${m.cover}" alt="${m.title_romanji}" />
      <h3>${m.title_romanji}</h3>
    </div>
  `).join('');
}

// =============== BOOKMARK ===============
async function showBookmarks() {
  const allManga = await getAllManga();
  const bookmarkIds = getBookmarks();
  const bookmarks = allManga.filter(m => bookmarkIds.includes(m.id));

  const container = document.getElementById('bookmarks');
  const emptyMsg = document.getElementById('emptyMsg');

  if (bookmarks.length === 0) {
    emptyMsg.style.display = 'block';
    container.innerHTML = '';
  } else {
    emptyMsg.style.display = 'none';
    container.innerHTML = bookmarks.map(m => `
      <div class="manga-card" onclick="window.location='manga.html?id=${m.id}'">
        <img src="${m.cover}" alt="${m.title_romanji}" />
        <h3>${m.title_romanji}</h3>
      </div>
    `).join('');
  }
}

// =============== DETAIL MANGA ===============
async function loadMangaDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    document.getElementById('mangaDetail').innerHTML = '<p>Manga tidak ditemukan.</p>';
    return;
  }

  const mangaList = await getAllManga();
  const manga = mangaList.find(m => m.id === id);

  if (!manga) {
    document.getElementById('mangaDetail').innerHTML = '<p>Manga tidak ditemukan.</p>';
    return;
  }

  document.getElementById('pageTitle').textContent = manga.title_romanji + ' - NuRE';
  document.getElementById('mangaTitle').textContent = manga.title_romanji;

  const statusText = manga.status === 'ongoing' ? 'Sedang Berjalan' : manga.status === 'end' ? 'Selesai' : 'Tidak Diketahui';

  document.getElementById('mangaDetail').innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <img src="${manga.cover}" class="manga-cover" alt="${manga.title_romanji}" />
      <div class="detail-info">
        <h1>${manga.title_romanji}</h1>
        <p><strong>Judul Asli:</strong> ${manga.title_original}</p>
        <p><strong>Penulis:</strong> ${manga.author}</p>
        <p><strong>Tahun Rilis:</strong> ${manga.year}</p>
        <p><strong>Status:</strong> ${statusText}</p>
        <p><strong>Sinopsis:</strong></p>
        <p>${manga.synopsis}</p>

        <div class="tags">
          ${manga.genres.map(g => `<span class="tag">${g}</span>`).join('')}
        </div>

        <button onclick="saveBookmark('${manga.id}')" style="margin-top: 16px; padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
          🔖 Simpan ke Bookmark
        </button>
      </div>
    </div>
  `;
}

// === ADMIN ===
const ADMIN_PASSWORD = "Nurokhim11Juli"; // Ganti dengan password rahasia kamu!

function showAdminLogin() {
  const pass = prompt("Masukkan password admin:");
  if (pass === ADMIN_PASSWORD) {
    localStorage.setItem('isAdmin', 'true');
    alert("Login admin berhasil!");
    window.location.href = 'admin.html';
  } else {
    alert("Password salah!");
  }
}

function checkAdminAccess() {
  if (!localStorage.getItem('isAdmin')) {
    alert("Akses ditolak! Harus login sebagai admin.");
    window.location.href = 'index.html';
  }
}

function logoutAdmin() {
  localStorage.removeItem('isAdmin');
  window.location.href = 'index.html';
}

// === ADMIN DATA MANAGEMENT ===
function getAdminManga() {
  return JSON.parse(localStorage.getItem('adminManga') || '[]');
}

function saveAdminManga(data) {
  localStorage.setItem('adminManga', JSON.stringify(data));
}

async function getAllManga() {
  // Gabungkan data dari file JSON + data admin (localStorage)
  const staticManga = await getAllManga();
  const adminManga = getAdminManga();
  return [...staticManga, ...adminManga];
}

function saveManga() {
  const id = document.getElementById('editId').value || Date.now().toString();
  const manga = {
    id,
    title_romanji: document.getElementById('titleRomanji').value.trim(),
    title_original: document.getElementById('titleOriginal').value.trim(),
    cover: document.getElementById('coverUrl').value.trim(),
    author: document.getElementById('author').value.trim(),
    year: parseInt(document.getElementById('year').value) || new Date().getFullYear(),
    status: document.getElementById('status').value,
    genres: document.getElementById('genres').value.split(',').map(g => g.trim()).filter(g => g),
    synopsis: document.getElementById('synopsis').value.trim()
  };

  if (!manga.title_romanji || !manga.cover) {
    alert("Judul dan cover wajib diisi!");
    return;
  }

  const allManga = getAdminManga();
  const index = allManga.findIndex(m => m.id === id);
  
  if (index >= 0) {
    allManga[index] = manga; // edit
  } else {
    allManga.push(manga); // tambah baru
  }

  saveAdminManga(allManga);
  alert("Manga berhasil disimpan!");
  loadAdminMangaList();
  resetForm();
}

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent = 'Tambah Manga Baru';
  ['titleRomanji', 'titleOriginal', 'coverUrl', 'author', 'year', 'genres', 'synopsis'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('status').value = 'ongoing';
}

function editManga(id) {
  const manga = getAdminManga().find(m => m.id === id);
  if (!manga) return;

  document.getElementById('editId').value = id;
  document.getElementById('formTitle').textContent = 'Edit Manga';
  document.getElementById('titleRomanji').value = manga.title_romanji;
  document.getElementById('titleOriginal').value = manga.title_original;
  document.getElementById('coverUrl').value = manga.cover;
  document.getElementById('author').value = manga.author;
  document.getElementById('year').value = manga.year;
  document.getElementById('status').value = manga.status;
  document.getElementById('genres').value = manga.genres.join(', ');
  document.getElementById('synopsis').value = manga.synopsis;
  
  window.scrollTo(0, 0);
}

function deleteManga(id) {
  if (!confirm("Hapus manga ini?")) return;
  const all = getAdminManga().filter(m => m.id !== id);
  saveAdminManga(all);
  loadAdminMangaList();
}

function loadAdminMangaList() {
  const mangaList = getAdminManga();
  const container = document.getElementById('mangaList');
  container.innerHTML = mangaList.length === 0 
    ? "<p>Belum ada manga yang ditambahkan oleh admin.</p>"
    : mangaList.map(m => `
        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 6px;">
          <strong>${m.title_romanji}</strong> (${m.year})
          <div style="margin-top: 8px;">
            <button onclick="editManga('${m.id}')" style="background:#3498db; color:white; border:none; padding:4px 8px; margin-right:6px;">✏️ Edit</button>
            <button onclick="deleteManga('${m.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px;">🗑️ Hapus</button>
          </div>
        </div>
      `).join('');
}

async function showRandomMangaFromAll() {
  const mangaList = await getAllManga(); // ← ini yang baru
  const random = shuffle(mangaList).slice(0, 6);
  const container = document.getElementById('recommendation');
  container.innerHTML = random.map(m => `
    <div class="manga-card" onclick="window.location='manga.html?id=${m.id}'">
      <img src="${m.cover}" alt="${m.title_romanji}" />
      <h3>${m.title_romanji}</h3>
    </div>
  `).join('');
}

function loginAdmin() {
  const email = prompt("Email admin:");
  const password = prompt("Password:");
  if (!email || !password) return;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      if (isAdmin()) {
        alert("Login admin berhasil!");
        window.location.href = 'admin.html';
      } else {
        alert("Akun ini bukan admin!");
        auth.signOut();
      }
    })
    .catch(err => {
      alert("Login gagal: " + err.message);
    });
}

function logoutAdmin() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}