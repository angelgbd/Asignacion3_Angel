# Catálogo con Web Components

Demo en español hecha con Vite y TypeScript. Los productos y precios son ficticios.

## Ejecutar

```bash
npm install
npm run dev
```

## Componentes

- `<tabla-generica>` recibe `columnas` y `filas` como propiedades JavaScript. Renderiza una cabecera y una fila por objeto; cuando `filas` está vacío muestra «Sin datos».
- `<contador-cantidad min="1" max="5" value="1">` conserva su valor dentro del rango. Los clics en más y menos emiten `cantidad-cambiada` con `event.detail.value`.

Cada componente tiene un archivo TypeScript y uno CSS propio. Ambos aíslan su marcado y estilos con Shadow DOM.
