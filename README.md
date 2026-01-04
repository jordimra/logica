# 🧩 Generador de Puzles Lógicos (Logic Puzzle Generator)

Una aplicación web interactiva y ligera para crear, editar y resolver **Puzles de Lógica** (también conocidos como *Zebra Puzzles* o *Einstein Puzzles*).

Desarrollado con **PHP**, **JavaScript** y **CSS** puro, sin dependencias externas ni bases de datos.

![Captura de pantalla del proyecto](screenshot.png)
*(Te recomiendo subir una captura de pantalla de tu puzle y reemplazar esta línea)*

## ✨ Características

* **Configuración Dinámica:** Soporta múltiples tamaños de cuadrícula:
    * **3x4** (Estándar)
    * **4x4** (Extendido)
    * **5x4** (5 ítems por categoría)
    * **5x5** (5 categorías - *Modo Experto con variable 'E'*)
* **Interfaz Interactiva:**
    * Haz clic para marcar una cruz (❌) o un círculo (🔵).
    * **Lógica Transitiva Automática:** Si marcas que A=B y B=C, el sistema deduce automáticamente que A=C.
    * Limpieza inteligente de filas y columnas al confirmar una selección.
* **Ayudas Visuales:**
    * Detección de conflictos en tiempo real (resaltado en amarillo).
    * Indicadores visuales cuando una fila/columna está completa o tiene errores.
    * Posibilidad de activar/desactivar estas ayudas.
* **Gestión de Datos:**
    * **Importar/Exportar:** Guarda tus plantillas o progresos en archivos `.json`.
    * Campos de texto para personalizar categorías e ítems.
    * Área de descripción desplegable para redactar las pistas del puzle.
* **Diseño Limpio:** Interfaz separada en tarjetas (Intro, Lógica, Resultados) con estilos cuidados y responsive.

## 🚀 Instalación y Uso

No necesitas configurar una base de datos. Solo necesitas un servidor con soporte para **PHP**.

### Opción A: Servidor PHP Integrado (Rápido)
Si tienes PHP instalado en tu ordenador, abre la terminal en la carpeta del proyecto y ejecuta:

```bash
php -S localhost:8000