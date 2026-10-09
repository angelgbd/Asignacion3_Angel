import componentStyles from './tabla-generica.css?inline';

export interface ColumnaTabla {
  clave: string;
  titulo: string;
}

export type FilaTabla = Record<string, unknown>;

/** Tabla presentacional: la página consumidora decide qué columnas y filas mostrar. */
export class TablaGenerica extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['aria-label'];
  }

  #root: ShadowRoot;
  #columnas: ColumnaTabla[] = [];
  #filas: FilaTabla[] = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
  }

  get columnas(): ColumnaTabla[] {
    return this.#columnas;
  }

  set columnas(value: ColumnaTabla[]) {
    this.#columnas = Array.isArray(value) ? value : [];
    this.#render();
  }

  get filas(): FilaTabla[] {
    return this.#filas;
  }

  set filas(value: FilaTabla[]) {
    this.#filas = Array.isArray(value) ? value : [];
    this.#render();
  }

  connectedCallback(): void {
    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  #render(): void {
    this.#root.innerHTML = `
      <style>${componentStyles}</style>
      <div class="table-scroll">
        <table>
          <thead><tr></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    const table = this.#root.querySelector('table');
    const headerRow = this.#root.querySelector('thead tr');
    const body = this.#root.querySelector('tbody');
    if (!table || !headerRow || !body) return;

    table.setAttribute('aria-label', this.getAttribute('aria-label') || 'Tabla de datos');

    for (const columna of this.#columnas) {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = columna.titulo;
      headerRow.append(header);
    }

    if (this.#filas.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.className = 'empty-cell';
      cell.colSpan = Math.max(this.#columnas.length, 1);
      cell.textContent = 'Sin datos';
      row.append(cell);
      body.append(row);
      return;
    }

    for (const fila of this.#filas) {
      const row = document.createElement('tr');
      for (const columna of this.#columnas) {
        const cell = document.createElement('td');
        cell.textContent = this.#formatValue(fila[columna.clave]);
        row.append(cell);
      }
      body.append(row);
    }
  }

  #formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value) ?? '—';
      } catch {
        return '—';
      }
    }
    return String(value);
  }
}

if (!customElements.get('tabla-generica')) {
  customElements.define('tabla-generica', TablaGenerica);
}

declare global {
  interface HTMLElementTagNameMap {
    'tabla-generica': TablaGenerica;
  }
}
