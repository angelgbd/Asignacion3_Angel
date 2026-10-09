import './style.css';
import './components/contador-cantidad';
import './components/tabla-generica';
import type { ContadorCantidad } from './components/contador-cantidad';
import type { ColumnaTabla, FilaTabla, TablaGenerica } from './components/tabla-generica';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

const productos: Producto[] = [
  { id: 'cuaderno-a5', nombre: 'Cuaderno A5', descripcion: 'Pasta suave · 120 hojas', precio: 89 },
  { id: 'marcadores-12', nombre: 'Marcadores x12', descripcion: 'Punta doble · base agua', precio: 145 },
  { id: 'termo-acero', nombre: 'Termo de acero', descripcion: '500 ml · conserva la temperatura', precio: 329 },
];

const carrito = new Map<string, LineaCarrito>();
const productList = document.querySelector<HTMLDivElement>('#product-list');
const cartTable = document.querySelector<TablaGenerica>('#cart-table');
const cartCount = document.querySelector<HTMLSpanElement>('#cart-count');
const cartTotal = document.querySelector<HTMLElement>('#cart-total');
const clearCartButton = document.querySelector<HTMLButtonElement>('#clear-cart');
const catalogStatus = document.querySelector<HTMLParagraphElement>('#catalog-status');

const columnasCarrito: ColumnaTabla[] = [
  { clave: 'producto', titulo: 'Producto' },
  { clave: 'precio', titulo: 'Precio' },
  { clave: 'cantidad', titulo: 'Cantidad' },
];

const formatoPrecio = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

function renderProducts(): void {
  if (!productList) return;
  productList.replaceChildren();

  for (const product of productos) {
    const row = document.createElement('article');
    row.className = 'product-row';

    const details = document.createElement('div');
    details.className = 'product-details';
    const name = document.createElement('h3');
    name.textContent = product.nombre;
    const description = document.createElement('p');
    description.textContent = product.descripcion;
    details.append(name, description);

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = formatoPrecio.format(product.precio);

    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const counter = document.createElement('contador-cantidad') as ContadorCantidad;
    counter.setAttribute('min', '1');
    counter.setAttribute('max', '5');
    counter.setAttribute('value', '1');

    counter.addEventListener('cantidad-cambiada', (event) => {
      const { value } = (event as CustomEvent<{ value: number }>).detail;
      if (catalogStatus) catalogStatus.textContent = `Cantidad seleccionada para ${product.nombre}: ${value}.`;
    });

    const addButton = document.createElement('button');
    addButton.className = 'button button-primary';
    addButton.type = 'button';
    addButton.textContent = 'Agregar';
    addButton.setAttribute('aria-label', `Agregar ${product.nombre} al carrito`);
    addButton.addEventListener('click', () => {
      const cantidad = counter.value;
      const existente = carrito.get(product.id);
      carrito.set(product.id, {
        producto: product,
        cantidad: (existente?.cantidad ?? 0) + cantidad,
      });
      updateCart();
      if (catalogStatus) {
        catalogStatus.textContent = `${cantidad} ${cantidad === 1 ? 'unidad agregada' : 'unidades agregadas'}: ${product.nombre}.`;
      }
    });

    actions.append(counter, addButton);
    row.append(details, price, actions);
    productList.append(row);
  }
}

function updateCart(): void {
  if (!cartTable || !cartCount || !cartTotal || !clearCartButton) return;

  const filas: FilaTabla[] = Array.from(carrito.values(), ({ producto, cantidad }) => ({
    producto: producto.nombre,
    precio: formatoPrecio.format(producto.precio),
    cantidad,
  }));
  cartTable.columnas = columnasCarrito;
  cartTable.filas = filas;

  const quantity = Array.from(carrito.values()).reduce((sum, line) => sum + line.cantidad, 0);
  const total = Array.from(carrito.values()).reduce((sum, line) => sum + line.producto.precio * line.cantidad, 0);
  cartCount.textContent = String(quantity);
  cartCount.setAttribute('aria-label', `${quantity} artículos en el carrito`);
  cartTotal.textContent = formatoPrecio.format(total);
  clearCartButton.disabled = carrito.size === 0;
}

clearCartButton?.addEventListener('click', () => {
  carrito.clear();
  updateCart();
  if (catalogStatus) catalogStatus.textContent = 'Carrito vaciado.';
});

renderProducts();
updateCart();
