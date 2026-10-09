import componentStyles from './contador-cantidad.css?inline';

/**
 * Atributos observados: min, max y value.
 * Estado interno: value, limitado al rango indicado.
 * Evento de interacción: cantidad-cambiada, con detail.value.
 */
export class ContadorCantidad extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['min', 'max', 'value'];
  }

  #root: ShadowRoot;
  #min = 1;
  #max = 99;
  #value = 1;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.addEventListener('click', this.#onClick);
  }

  get value(): number {
    return this.#value;
  }

  set value(value: number) {
    this.#value = this.#clamp(value);
    this.#render();
  }

  get min(): number {
    return this.#min;
  }

  get max(): number {
    return this.#max;
  }

  connectedCallback(): void {
    this.#readAttributes();
  }

  attributeChangedCallback(): void {
    this.#readAttributes();
  }

  #readAttributes(): void {
    const min = this.#readInteger('min', 1);
    const requestedMax = this.#readInteger('max', 99);
    this.#min = min;
    this.#max = Math.max(min, requestedMax);
    this.#value = this.#clamp(this.#readInteger('value', this.#min));
    this.#render();
  }

  #readInteger(attribute: string, fallback: number): number {
    const rawValue = this.getAttribute(attribute);
    if (rawValue === null) return fallback;
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
  }

  #clamp(value: number): number {
    const safeValue = Number.isFinite(value) ? Math.trunc(value) : this.#min;
    return Math.min(this.#max, Math.max(this.#min, safeValue));
  }

  #render(): void {
    if (!this.#root.querySelector('.counter')) {
      this.#root.innerHTML = `
        <style>${componentStyles}</style>
        <div class="counter" role="group" aria-label="Cantidad">
          <button class="step-button" type="button" data-step="-1" aria-label="Disminuir cantidad">
            <span aria-hidden="true">−</span>
          </button>
          <output aria-live="polite" aria-atomic="true"></output>
          <button class="step-button" type="button" data-step="1" aria-label="Aumentar cantidad">
            <span aria-hidden="true">+</span>
          </button>
        </div>
      `;
    }

    const output = this.#root.querySelector('output');
    const decrease = this.#root.querySelector<HTMLButtonElement>('[data-step="-1"]');
    const increase = this.#root.querySelector<HTMLButtonElement>('[data-step="1"]');
    if (!output || !decrease || !increase) return;

    output.value = String(this.#value);
    decrease.disabled = this.#value <= this.#min;
    increase.disabled = this.#value >= this.#max;
  }

  #onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('[data-step]');
    if (!button || button.disabled) return;

    const previousValue = this.#value;
    this.value = this.#value + Number(button.dataset.step);

    if (this.#value !== previousValue) {
      this.dispatchEvent(
        new CustomEvent<{ value: number }>('cantidad-cambiada', {
          detail: { value: this.#value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };
}

if (!customElements.get('contador-cantidad')) {
  customElements.define('contador-cantidad', ContadorCantidad);
}

declare global {
  interface HTMLElementTagNameMap {
    'contador-cantidad': ContadorCantidad;
  }
}
