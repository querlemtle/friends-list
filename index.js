const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = `${BASE_URL}/api/v1/users`;
const nav = document.getElementById("main-nav");
const spinnerLoader = document.getElementById("spinner");
const cardGroup = document.getElementById("card-group");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const pagination = document.getElementById("pagination");
const backToTopBtn = document.getElementById("back-to-top");

const FRIENDS_PER_PAGE = 15;
const users = [];
let searchedResults = [];


init();

// 點擊卡片任意處手動開啟modal，點到按鈕則加收藏
cardGroup.addEventListener("click", function onCardClicked(event) {
  const id = event.target.dataset.id;
  if (!id) return;
  event.preventDefault();
  const cardModal = new bootstrap.Modal(document.getElementById("card-modal"), {
    keyboard: false
  })

  if (event.target.id !== "add-to-favorite") {
    cardModal.show(showModal(id));
  } else {
    addToFavorite(+id);
  }
});

// 監聽scroll事件，顯示或隱藏返回頂端按鈕
window.addEventListener("scroll", handleScroll);

// 點擊搜尋欄的"x"可以清除錯誤訊息並重新渲染頁面
searchInput.addEventListener("input", (event) => {
  if (event.target.value.length === 0) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.classList.replace("d-block", "d-none");
    renderPaginator(users.length);
    renderUsers(renderByPage(1));
  }
});

// 搜尋功能
searchBtn.addEventListener("click", (event) => {
  searchList(event);
  renderUsers(searchedResults);
  renderPaginator(searchedResults.length);
  if (searchedResults.length === 0) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = `No results found with keyword: "${searchInput.value}"`;
    errorMessage.classList.replace("d-none", "d-block");
  }
});

// 根據點擊分頁渲染對應資料
pagination.addEventListener("click", (event) => {
  renderUsers(renderByPage(+event.target.dataset.page));
});

function init() {
  backToTopBtn.style.display = "none";
  axios.get(INDEX_URL)
    .then((response) => {
      users.push(...response.data.results);
      removeSpinnerLoader();
      renderPaginator(users.length);
      renderUsers(renderByPage(1));
    })
    .catch((error) => console.log(error))
}

function removeSpinnerLoader() {
  document.body.removeChild(spinnerLoader);
}

function renderUsers(data) {
  let cardHTML = "";
  data.forEach((item) => {
    cardHTML += `<div class="col">
      <div class="card h-100" data-id="${item.id}" style="cursor:pointer;">
        <img src="${item.avatar}" class="card-img-top" data-id="${item.id}" alt="avatar">
        <div class="card-body" data-id="${item.id}">
          <h5 class="card-title" data-id="${item.id}">${item.name} ${item.surname}</h5>
          <a href="#" class="btn btn-primary" id="add-to-favorite" data-id=${item.id}>+</a>
        </div>
      </div>
    </div>
    `;
  })
  cardGroup.innerHTML = cardHTML;
}

function renderPaginator(amount) {
  const pages = Math.ceil(amount / FRIENDS_PER_PAGE);
  let pagesHTML = ``;
  for (let i = 1; i <= pages; i++) {
    pagesHTML += `<li class="page-item" data-page="${i}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  pagination.innerHTML = pagesHTML;
}

function renderByPage(page) {
  const startIndex = (page - 1) * FRIENDS_PER_PAGE;
  return users.slice(startIndex, startIndex + FRIENDS_PER_PAGE);
}

function handleScroll() {
  const root = document.documentElement;
  const scrollTotal = root.scrollHeight - root.clientHeight;
  ((root.scrollTop / scrollTotal) > 0.20) ? backToTopBtn.style.display = "block" : backToTopBtn.style.display = "none";
}

function showModal(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalImg = document.querySelector(".user-img");
  const modalList = document.querySelector(".list-group");
  modalTitle.textContent = "";
  modalImg.removeAttribute("src");
  modalList.innerHTML = "";

  axios.get(`${INDEX_URL}/${id}`)
    .then((response) => {
      modalTitle.textContent = `${response.data.name} ${response.data.surname}`;
      modalImg.setAttribute("src", `${response.data.avatar}`);
      const modalListHTML = `<li class="list-group-item">Email: ${response.data.email}</li>
      <li class="list-group-item">Gender: ${response.data.gender}</li>
      <li class="list-group-item">Age: ${response.data.age}</li>
      <li class="list-group-item">Region: ${response.data.region}</li>
      <li class="list-group-item">Birthday: ${response.data.birthday}</li>`;
      modalList.innerHTML = modalListHTML;
    })
    .catch((error) => console.log(error))
}

function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteList")) || [];
  if (favoriteList.some((user) => user.id === id)) {
    showAlert("duplicate");
  } else {
    const favorite = users.find((user) => user.id === id);
    favoriteList.push(favorite);
    localStorage.setItem("favoriteList", JSON.stringify(favoriteList));
    showAlert("success");
  }
}

function searchList(event) {
  event.preventDefault();
  const input = searchInput.value.trim().toLowerCase();
  if (!input) return;
  searchedResults = users.filter((user) => {
    return user.name.toLowerCase().includes(input) || user.surname.toLowerCase().includes(input);
  });
}

function showAlert(type) {
  let alert = document.createElement("div");
  alert.setAttribute("role", "alert");
  switch (type) {
    case "success":
      alert.classList.add("alert", "alert-success", "sticky-top");
      alert.textContent = " You have successfully added a user to favorites!";
      nav.insertAdjacentElement("afterend", alert);
      alert.insertAdjacentHTML("afterbegin", `<i class="fa-solid fa-circle-check"></i>`);
      break;
    case "duplicate":
      alert.classList.add("alert", "alert-warning", "sticky-top");
      alert.textContent = " This user is already in your favorites.";
      nav.insertAdjacentElement("afterend", alert);
      alert.insertAdjacentHTML("afterbegin", `<i class="fa-solid fa-triangle-exclamation"></i>`);
      break;
    case "remove":
      alert.classList.add("alert", "alert-danger", "sticky-top");
      alert.textContent = " You have removed the user from favorites.";
      nav.insertAdjacentElement("afterend", alert);
      alert.insertAdjacentHTML("afterbegin", `<i class="fa-solid fa-triangle-exclamation"></i>`);
      break;
  }
  setTimeout(() => { nav.parentElement.removeChild(document.querySelector(".alert")); }, 1000);
}