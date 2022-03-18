const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = `${BASE_URL}/api/v1/users`;
const nav = document.getElementById("main-nav");
const cardGroup = document.getElementById("card-group");
const pagination = document.getElementById("pagination");
const backToTopBtn = document.getElementById("back-to-top");

const FRIENDS_PER_PAGE = 12;
const favoriteUsers = [];


init();

cardGroup.addEventListener("click", function onCardClicked(event) {
  const id = event.target.dataset.id;
  if (!id) return;
  event.preventDefault();
  const cardModal = new bootstrap.Modal(document.getElementById("card-modal"), {
    keyboard: false
  })
  event.target.id !== "remove-from-favorite" ? cardModal.show(showModal(id)) : removeFromFavorite(+id);
});

window.addEventListener("scroll", handleScroll);

pagination.addEventListener("click", (event) => {
  renderByPage(+event.data.id);
});

function init() {
  backToTopBtn.style.display = "none";
  localStorage.getItem("favoriteList") === null ? favoriteUsers : favoriteUsers.push(...JSON.parse(localStorage.getItem("favoriteList")))
  renderUsers(favoriteUsers);
  renderPaginator(favoriteUsers.length);
}

function renderUsers(data) {
  let cardHTML = "";
  if (data.length === 0) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = `No one is in your favorite list yet :(`;
    errorMessage.classList.replace("d-none", "d-block");
  } else {
    data.forEach((item) => {
      cardHTML += `<div class="col">
      <div class="card h-100" data-id="${item.id}" style="cursor:pointer;">
        <img src="${item.avatar}" class="card-img-top" data-id="${item.id}" alt="avatar">
        <div class="card-body" data-id="${item.id}">
          <h5 class="card-title" data-id="${item.id}">${item.name} ${item.surname}</h5>
          <a href="#" class="btn btn-danger" id="remove-from-favorite" data-id=${item.id}>x</a>
        </div>
      </div>
    </div>
    `;
    })
  }
  cardGroup.innerHTML = cardHTML;
}

function renderPaginator(amount) {
  const pages = Math.ceil(amount / FRIENDS_PER_PAGE);
  let pagesHTML = ``;
  for (let i = 1; i <= pages; i++) {
    pagesHTML += `<li class="page-item" data-page="${i}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  pagination.insertAdjacentHTML("afterbegin", pagesHTML);
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

function removeFromFavorite(id) {

  function showRemoveAlert() {
    let alert = document.createElement("div");
    alert.setAttribute("role", "alert");
    alert.classList.add("alert", "alert-danger", "sticky-top");
    alert.textContent = " You have removed the user from favorites.";
    nav.insertAdjacentElement("afterend", alert);
    alert.insertAdjacentHTML("afterbegin", `<i class="fa-solid fa-triangle-exclamation"></i>`);

    setTimeout(() => { nav.parentElement.removeChild(document.querySelector(".alert")); }, 1000);
  }

  let deleteId = favoriteUsers.findIndex(user => user.id === id);
  favoriteUsers.splice(deleteId, 1);
  localStorage.setItem("favoriteList", JSON.stringify(favoriteUsers));
  renderUsers(favoriteUsers);
  showRemoveAlert();
}