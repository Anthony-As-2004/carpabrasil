const apiURL = 'https://catalogo-backend.onrender.com/api/products';


async function loadProducts() {
  try {
    const res = await fetch(apiURL);
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    const data = await res.json();

    const container = document.getElementById('product-list');
    container.innerHTML = '';

    data.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="https://catalogo-backend.onrender.com${prod.image}" alt="${prod.name}" />
            <h3>${prod.name}</h3>
          </div>
          <div class="card-back">
            <p><strong>Preço:</strong> R$ ${prod.price}</p>
            <p><strong>Tamanho:</strong> ${prod.size}</p>
            <p><strong>Variedade:</strong> ${prod.variety}</p>
            ${isAdmin() ? `<button onclick="deleteProduct(${prod.id})">Remover</button>` : ""}
          </div>
        </div>
      `;

      // Clique vira o card
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar produtos.");
  }
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

    try {
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
    } catch (err) {
      console.error(err);
      alert('Erro na requisição.');
    }
  });

}async function deleteProduct(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${apiURL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });

    if (res.ok) {
      loadProducts();
    } else {
      alert('Erro ao remover produto.');
    }
  } catch (err) {
    console.error(err);
    alert('Erro na requisição.');
  }
}

window.onload = loadProducts;