const url = new URL('https://dtw.azurewebsites.net/api');

let addModal = new bootstrap.Modal(document.getElementById('modalCard'), {});

let currentPage = 1;
let isScroll = false;

const urlLinks = url + '/links';

function getCard(perPage = 12, page = 1) {

  isScroll = false;

  const urlRequete = urlLinks + '?perPage=' + perPage + '&page=' + page;

  fetch(urlRequete)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      else {
        alert('Erreur réponse : ', response.status); 
      }
    })
    .then((data) => {
      let htmlCard = "";
      data.forEach((elem) => {
        htmlCard += htmlGetCard(elem.title, elem.description, elem.link, elem.author.surName, elem.author.foreName, elem.idLink);
      })
      document.getElementById('displayCard').innerHTML += htmlCard;
    })
    .catch(error => alert(error));
};

function scrollPageCard() {
  currentPage++
  getCard(12, currentPage)
};

document.addEventListener('DOMContentLoaded', function() {
  getCard(12, 1)

  window.addEventListener('scroll', function() {
    if (!isScroll) {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight) {
        scrollPageCard()
      }
    }
  })
});

function htmlGetCard(title, description, link, surName, foreName, idLink) {
  htmlCard = `
    <div class="card-padding p-2" id="delete-card-remove${idLink}">
      <div class="card h-100">
        <img src="https://picsum.photos/200" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${description}</p>
          <a href="${link}" class="btn btn-primary">
            Go..
          </a>
        </div>
        <div class="card-footer">
          <small class="text-muted">${surName} ${foreName}</small>
          <button type="button" class="btn btn-danger float-end" onclick="deleteCard(${idLink})">
            <i class="bi bi-trash3"></i>
          </button>
          <button type="button" class="btn btn-info float-end me-2" onclick="editCard(${idLink})">
            <i class="bi bi-pencil-square"></i>
          </button>
        </div>
      </div>
    </div>
    `;
    return htmlCard;
};

function searchCard() {

  const search = document.getElementById('searchInput').value;

  if (search == "" || search == undefined) {
    getCard(12, currentPage)
    document.getElementById('displayCard').innerHTML = "";
  } else {

    isScroll = true;

    const urlrequete = urlLinks + '/search?search=' + search;

    fetch(urlrequete)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('Erreur réponse : ', response.status);
        }
      })
      .then((dataSearch) => {
        let htmlSearch = "";
        dataSearch.forEach((elem) => {
          console.log(elem)
          htmlSearch += htmlGetCard(elem.title, elem.description, elem.link, elem.author.surName, elem.author.foreName, elem.idLink);
        })
        if (htmlSearch != "") {
          document.getElementById('displayCard').innerHTML = htmlSearch;
        } else {
          document.getElementById('displayCard').innerHTML = '<p class=text-danger mt-5>Aucun élémént ne correspond à votre recherche</p>';
        }
      })
      .catch(error => alert(error));
  }
};

function addCard(titleInput, descriptionInput, urlInput, idAuthorInput) {
  console.log(titleInput, descriptionInput, urlInput, idAuthorInput)

  let student = {
    title: titleInput,
    description: descriptionInput,
    link: urlInput,
    idAuthor: +idAuthorInput
  };
  
  const urlRequete = urlLinks;

  fetch(urlRequete, {
    method: 'POST',
    body: JSON.stringify(student),
    headers: {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  })
  .then((response) => {
    if (response.status == 201) {
      return response.json();
    } else {
      alert('Erreur réponse : ' + response.status);
    }
  })
  .then((response) => {
    let htmlPost = htmlGetCard(response.title, response.description, response.link, 'Moi même', 'Moi même', response.idLink);

    let html = htmlPost + document.getElementById('displayCard').innerHTML;
    document.getElementById('displayCard').innerHTML = html;

    const inputs = document.querySelector('form').getElementsByTagName('input');

    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = "";
    };

    addModal.hide();
  })
  .catch(error => alert(error));
};

function deleteCard(idLink) {
  const urlRequete = urlLinks + '/' + idLink;

  fetch(urlRequete, {
    method: 'DELETE',
    headers: {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  })
  .then((response) => {
    if (response.status == 200) {
      document.getElementById('delete-card-remove' + idLink).remove();
    }
  })
  .catch(error => alert(error))
};

function schowModalCard() {

  addModal.show();

  document.getElementById('titleModalLabel').textContent = 'Ajouter un élément';
  document.getElementById('btnEditCard').hidden = true;
  document.getElementById('btnAddCard').hidden = false;
  document.getElementById('titleInput').value = "";
  document.getElementById('descriptionInput').value = "";
  document.getElementById('urlInput').value = "";
  document.getElementById('idAuthorInput').value = "";
};

function editCard(idLink) {

  addModal.show();

  document.getElementById('titleModalLabel').textContent = 'Modifier un élément';
  document.getElementById('btnEditCard').hidden = false;
  document.getElementById('btnAddCard').hidden = true;

  const urlRequete = urlLinks + '/' + idLink;

  fetch(urlRequete)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert('Erreur réponse : ' + response.status);
      }
    })
    .then((response) => {
      document.getElementById('idLinkInput').value = response.idLink;
      document.getElementById('titleInput').value = response.title;
      document.getElementById('descriptionInput').value = response.description;
      document.getElementById('urlInput').value = response.link;
      document.getElementById('idAuthorInput').value = response.author.idUser;
    })
    .catch(error => alert(error));
};

function editCardAction(titleInput, descriptionInput, urlInput, idAuthorInput, idLinkInput) {

  const urlRequete = urlLinks + '/' + idLinkInput;

  let studentModif = {
    idLink: +idLinkInput,
    title: titleInput,
    description: descriptionInput,
    link: urlInput,
    idAuthor: +idAuthorInput
  };

  fetch(urlRequete, {
    method: 'PUT',
    body: JSON.stringify(studentModif),
    headers: {
      'Content-type' : 'application/json; charset=UTF-8'
    }
  })
  .then((response) => {
    if (response.status == 200) {
      return response.json();
    } else {
      alert('Erreur réponse : ' + response.status);
    }
  })
  .then((dataModif) => {
    let htmlModif = htmlGetCard(dataModif.title, dataModif.description, dataModif.link, 'Moi même', 'Moi même', dataModif.idLink);

    let html = htmlModif + document.getElementById('displayCard').innerHTML;
    document.getElementById('displayCard').innerHTML = html;

    const inputs = document.querySelector('form').getElementsByTagName('input');

    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = "";
    };

    addModal.hide();
  })
};











