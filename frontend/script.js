
const apiURL = 'https://catalogo-backend.onrender.com/api/products';

async function loadProducts() {
  const res = await fetch(apiURL);
  const data = await res.json();
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  data.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="https://catalogo-backend.onrender.com${prod.image}" />
      <h3>${prod.name}</h3>
      <p>R$ ${prod.price}</p>
      ${isAdmin() ? `<button onclick="deleteProduct(${prod.id})">Remover</button>` : ''}
    `;
    container.appendChild(card);
  });
}

function isAdmin() {
  return localStorage.getItem('token') === 'admin123';
}

if (document.getElementById('uploadForm')) {
  document.getElementById('uploadForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem('token');

    const res = await fetch(apiURL, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData
    });

    if (res.ok) {
      form.reset();
      loadProducts();
    } else {
      alert('Erro ao adicionar produto.');
    }
  });
}

async function deleteProduct(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${apiURL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token }
  });

  if (res.ok) {
    loadProducts();
  } else {
    alert('Erro ao remover produto.');
  }
}

window.onload = loadProducts;
