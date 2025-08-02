class Noticia {
  constructor(id, titular, texto, imagen, fecha) {
    this.id = id;
    this.titular = titular;
    this.texto = texto;
    this.imagen = imagen;
    this.fecha = fecha;
  }
}

class UI {
  static mostrarNoticias() {
    const noticias = Storage.obtenerNoticias();
    noticias.forEach(noticia => UI.mostrarNoticia(noticia));
  }

  static mostrarNoticia(noticia) {
    const newsList = document.getElementById('news-list');
    const noticiaElemento = document.createElement('div');
    noticiaElemento.classList.add('noticia');
    noticiaElemento.dataset.id = noticia.id;

    noticiaElemento.innerHTML = `
      <img src="${noticia.imagen}" alt="Imagen de noticia" />
      <h3>${noticia.titular}</h3>
      <p>${noticia.texto}</p>
      <small><strong>Fecha de publicación:</strong> ${noticia.fecha}</small><br>
      <button class="btn btn-warning btn-sm" onclick="editarNoticia('${noticia.id}')">Editar</button>
      <button class="btn btn-danger btn-sm" onclick="eliminarNoticia('${noticia.id}')">Eliminar</button>
    `;

    newsList.appendChild(noticiaElemento);
  }

  static limpiarFormulario() {
    document.getElementById('news-form').reset();
    document.getElementById('news-form').removeAttribute('data-editing');
  }

  static llenarFormulario(noticia) {
    document.getElementById('headline').value = noticia.titular;
    document.getElementById('content').value = noticia.texto;
    document.getElementById('news-form').setAttribute('data-editing', noticia.id);
  }

  static actualizarNoticiaEnDOM(noticia) {
    const noticiaElemento = document.querySelector(`.noticia[data-id="${noticia.id}"]`);
    if (!noticiaElemento) return;

    noticiaElemento.querySelector('img').src = noticia.imagen;
    noticiaElemento.querySelector('h3').textContent = noticia.titular;
    noticiaElemento.querySelector('p').textContent = noticia.texto;
    noticiaElemento.querySelector('small').innerHTML = `<strong>Fecha de publicación:</strong> ${noticia.fecha}`;
  }

  static eliminarNoticiaDelDOM(id) {
    const noticiaElemento = document.querySelector(`.noticia[data-id="${id}"]`);
    if (noticiaElemento) noticiaElemento.remove();
  }

  static mostrarMensaje(mensaje, tipo = 'info') {
    alert(mensaje);
  }
}

class Storage {
  static obtenerNoticias() {
    return JSON.parse(localStorage.getItem('noticias')) || [];
  }

  static guardarNoticias(noticias) {
    localStorage.setItem('noticias', JSON.stringify(noticias));
  }

  static agregarNoticia(noticia) {
    const noticias = Storage.obtenerNoticias();
    noticias.push(noticia);
    Storage.guardarNoticias(noticias);
  }

  static actualizarNoticia(noticiaActualizada) {
    const noticias = Storage.obtenerNoticias().map(n =>
      n.id === noticiaActualizada.id ? noticiaActualizada : n
    );
    Storage.guardarNoticias(noticias);
  }

  static eliminarNoticia(id) {
    const noticias = Storage.obtenerNoticias().filter(n => n.id !== id);
    Storage.guardarNoticias(noticias);
  }

  static obtenerNoticiaPorId(id) {
    return Storage.obtenerNoticias().find(n => n.id === id);
  }
}

document.getElementById('news-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const titular = document.getElementById('headline').value.trim();
  const texto = document.getElementById('content').value.trim();
  const imagenInput = document.getElementById('image');
  const idEdicion = this.getAttribute('data-editing');

  if (!titular || !texto) {
    return UI.mostrarMensaje('Por favor completa todos los campos.');
  }

  const reader = new FileReader();

  reader.onload = function () {
    const imagenBase64 = reader.result;
    const fecha = new Date().toLocaleDateString();
    const id = idEdicion || Date.now().toString();

    const noticia = new Noticia(id, titular, texto, imagenBase64, fecha);

    if (idEdicion) {
      Storage.actualizarNoticia(noticia);
      UI.actualizarNoticiaEnDOM(noticia);
      UI.mostrarMensaje('Noticia actualizada correctamente');
    } else {
      Storage.agregarNoticia(noticia);
      UI.mostrarNoticia(noticia);
      UI.mostrarMensaje('Noticia agregada correctamente');
    }

    UI.limpiarFormulario();
  };

  if (imagenInput.files[0]) {
    reader.readAsDataURL(imagenInput.files[0]);
  } else if (idEdicion) {
    // Mantener imagen anterior si no se carga nueva en edición
    const anterior = Storage.obtenerNoticiaPorId(idEdicion);
    reader.onload({ target: { result: anterior.imagen } });
  } else {
    UI.mostrarMensaje('Por favor, sube una imagen.');
  }
});

function editarNoticia(id) {
  const noticia = Storage.obtenerNoticiaPorId(id);
  if (!noticia) return;
  UI.llenarFormulario(noticia);
}

function eliminarNoticia(id) {
  if (confirm('¿Estás seguro de eliminar esta noticia?')) {
    Storage.eliminarNoticia(id);
    UI.eliminarNoticiaDelDOM(id);
  }
}

document.addEventListener('DOMContentLoaded', UI.mostrarNoticias);