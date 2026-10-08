# Kit de reseñas para Google · DH Technology

Herramienta gratuita para que cualquier negocio local consiga más reseñas en Google. Pegas tu enlace de reseñas y en dos minutos tienes carteles con QR, tarjetas de mesa, mensajes listos para WhatsApp y una firma de email que llevan al cliente directamente a escribir su reseña.

**[▶ Probar la herramienta](https://dht-resenas.vercel.app)** · Hecho por [DH Technology](https://h-com-bay.vercel.app)

![Captura de la herramienta](docs/app.png)

## Qué hace

| | |
|---|---|
| **Valida el enlace** | Reconoce los enlaces de Google («Pedir reseñas», `writereview`, Maps o un Place ID suelto), los corrige y avisa si no abren directamente el formulario de reseña. |
| **5 formatos imprimibles** | Cartel A4, tarjeta de mesa que se dobla, pegatina de 100 mm, tarjeta de visita y hoja de 10 tarjetas con marcas de corte. |
| **Calidad de imprenta** | Descarga en PNG a 300 ppp, en SVG vectorial o en PDF a tamaño real desde el diálogo de impresión. |
| **Marca propia** | Logo, colores y textos personalizables, en castellano, inglés, catalán, euskera y gallego. |
| **Mensajes** | Plantillas para WhatsApp, SMS y email con el nombre del cliente, que se abren directamente en la app correspondiente. |
| **Firma de email** | Botón «Déjanos tu reseña» que se pega con formato en Gmail u Outlook. |

## Privacidad

Todo ocurre en el navegador. No hay servidor, base de datos, cookies ni analítica, y las fuentes están alojadas en la propia web. Los datos del negocio y el logo se guardan solo en el `localStorage` del usuario.

## Detalles técnicos

- **QR vectorial propio.** Se genera con nivel de corrección Q y zona de silencio estándar, uniendo los módulos de cada fila en un solo trazado para que el SVG pese poco y se imprima nítido a cualquier tamaño. Las pruebas decodifican el QR de cada formato y comprueban que lleva al enlace exacto.
- **Carteles en SVG con milímetros reales.** Cada unidad del `viewBox` es un milímetro, así que el mismo diseño sirve para pantalla, PNG a 300 ppp e impresión a tamaño real con `@page`.
- **Texto que se ajusta solo.** SVG no parte líneas, así que se estima el ancho de cada palabra y se reduce el tamaño hasta que el texto cabe.
- **Sin coste de servidor.** Es una web estática: no consume funciones de Vercel por mucho tráfico que tenga.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · qrcode · Vitest

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # pruebas
npm run build    # compilación de producción en dist/
```

## Buenas prácticas incluidas

Las plantillas siguen las normas de Google: piden la opinión a todos los clientes y sin ofrecer nada a cambio. Google prohíbe los incentivos y filtrar a los clientes satisfechos, y puede eliminar reseñas o penalizar la ficha.

---

¿Quieres placas NFC, envío automático de mensajes tras cada venta o SEO local? **[Habla con DH Technology](https://h-com-bay.vercel.app/#contacto)**.
