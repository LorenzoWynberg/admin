# Guía del Panel de Administración

Cómo operar Mandados día a día — desde la cotización hasta la conciliación.

<div class="lead">

**Esta guía está dirigida a administradores** que despachan, monitorean y cierran órdenes en el panel de Mandados. Aprenderá a procesar el ciclo completo: recibir solicitudes de clientes, generar cotizaciones, asignar conductores, dar seguimiento a entregas y conciliar montos finales con cargos o créditos.

</div>

### ¿Qué es Mandados? {#what-is-mandados}
Mandados es una plataforma de logística de mensajería de última milla. El cliente solicita una orden desde su aplicación móvil indicando qué necesita comprar, recoger o entregar; el panel administrativo gestiona ese pedido durante todo su ciclo de vida; el conductor ejecuta la ruta físicamente.

### Tres aplicaciones, un panel {#three-apps}
| Aplicación | Quién la usa | Rol |
| --- | --- | --- |
| **Cliente** (móvil) | Personas o negocios | Crean órdenes, reciben cotizaciones, dan seguimiento, califican. |
| **Conductor** (móvil) | Mensajeros en planilla | Reciben rutas asignadas, ejecutan paradas, registran prueba de entrega. |
| **Panel Admin** (web) | Operaciones | Cotizan, despachan, monitorean conflictos, concilian, gestionan tarifas. |

<div class="callout info">
<strong>Los conductores están en planilla</strong>
El objetivo de despacho es <em>bin-packing</em>: maximizar paradas por conductor para minimizar el tamaño del equipo. No se busca «distribución justa» de viajes — se empacan las rutas lo más densas posible.
</div>

---

## Acceso al panel {#signing-in}
El panel se accede desde un navegador web moderno. La pantalla de inicio de sesión solicita correo y contraseña.

<figure>
  <img src="/guide/screenshots/01-admin-login.png" alt="Pantalla de inicio de sesión del panel" />
  <figcaption>Pantalla de acceso. Use las credenciales que le proporcionó el equipo de operaciones.</figcaption>
</figure>

### Cambiar idioma {#change-language}
El panel está disponible en **español**, **inglés** y **francés**. El idioma se selecciona desde la sección *Configuraciones*; también puede cambiar la URL agregando el código de idioma (`/es/...`, `/en/...`, `/fr/...`).

---

## Vista general {#overview}
<figure>
  <img src="/guide/screenshots/02-panel.png" alt="Vista general del panel principal" />
  <figcaption>Pantalla <em>Panel</em> — el resumen del día con métricas operativas.</figcaption>
</figure>

Al iniciar sesión llegará al **Panel** principal. Esta pantalla resume:

- Cantidad de órdenes activas, pendientes y completadas del día.
- Conductores en ruta y disponibles.
- Métricas rápidas de ingresos y volumen.

Use el panel como punto de partida diario, pero la verdadera mesa de trabajo es [**Necesita Atención**](#needs-attention) — donde se concentra todo lo accionable.

### Menú lateral {#sidebar-menu}
La navegación principal vive en la barra izquierda. Está organizada de mayor a menor frecuencia de uso:

<div class="section-cards">
  <div class="card"><strong class="card-title">Panel</strong><p>Resumen del día.</p></div>
  <div class="card"><strong class="card-title">Necesita Atención</strong><p>Mesa de trabajo — todo lo que requiere acción manual.</p></div>
  <div class="card"><strong class="card-title">Rutas</strong><p>Rutas activas con conductor en movimiento.</p></div>
  <div class="card"><strong class="card-title">Órdenes</strong><p>Listado completo de órdenes con filtros.</p></div>
  <div class="card"><strong class="card-title">Cotizaciones</strong><p>Historial de cotizaciones generadas.</p></div>
  <div class="card"><strong class="card-title">Usuarios</strong><p>Clientes registrados.</p></div>
  <div class="card"><strong class="card-title">Conductores</strong><p>Personal de planilla.</p></div>
  <div class="card"><strong class="card-title">Empresas</strong><p>Clientes corporativos con tarifas especiales.</p></div>
  <div class="card"><strong class="card-title">Direcciones</strong><p>Directorio reutilizable de direcciones.</p></div>
  <div class="card"><strong class="card-title">Catálogos</strong><p>Productos y precios para cotizaciones.</p></div>
  <div class="card"><strong class="card-title">Reglas de Precios</strong><p>Configuración de tarifas por distancia, tier, ventana, etc.</p></div>
  <div class="card"><strong class="card-title">Notificaciones</strong><p>Eventos del sistema dirigidos a operación.</p></div>
  <div class="card"><strong class="card-title">Registros de auditoría</strong><p>Quién hizo qué y cuándo.</p></div>
  <div class="card"><strong class="card-title">Configuraciones</strong><p>Monedas, ventanas de servicio, idioma, perfil.</p></div>
</div>

---

## Necesita Atención <span class="pill green">la pantalla más importante</span> {#needs-attention}

**Esta es la pantalla donde un administrador pasa la mayor parte de su día.** Cualquier orden que requiera intervención manual aparece aquí, organizada en pestañas por tipo de acción.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Pestañas de Necesita Atención" />
  <figcaption>Pestañas de <em>Necesita Atención</em>. El número en cada pestaña indica cuántas órdenes esperan acción.</figcaption>
</figure>

### Las cinco pestañas {#five-tabs}
| Pestaña | Qué contiene | Acción esperada |
| --- | --- | --- |
| **Conflictos** | Órdenes que el sistema no pudo despachar automáticamente o que tienen problemas de factibilidad (ventana imposible, sin conductor disponible, distancia excede el rango). | Revisar el motivo, reasignar manualmente, ajustar la ventana o desestimar la orden. |
| **Conciliación** | Órdenes <span class="pill blue">Completada</span> donde el conductor entregó pero el monto cobrado debe ajustarse al monto real de los productos comprados. | Abrir el diálogo de conciliación, ingresar precios reales por línea, generar la cotización final. |
| **Sin Cotizar** | Órdenes que el cliente acaba de crear y que aún no tienen cotización. | Verificar direcciones de cada parada, crear la cotización y enviarla al cliente. |
| **Sin Pagar** | Órdenes entregadas que aún no han sido pagadas por el cliente. | Dar seguimiento al cobro, marcar como pagado cuando corresponda. |
| **Solicitudes de Reembolso** | Reclamos de clientes que solicitan devolución total o parcial. | Revisar evidencia (prueba de entrega, fotos), aprobar o rechazar. |

### Filtros de severidad {#severity-filters}
Dentro de cada pestaña, las órdenes están priorizadas por severidad: <span class="pill red">Crítico</span> <span class="pill amber">Alto</span> <span class="pill blue">Medio</span> <span class="pill gray">Bajo</span>. Los filtros superiores permiten enfocar el trabajo del día.

<div class="callout tip">
<strong>Hábito recomendado</strong>
Comience cada turno revisando <em>Conflictos</em> y <em>Sin Cotizar</em> en ese orden. Conflictos puede tener órdenes urgentes ya despachadas que hay que rescatar; Sin Cotizar son ingresos potenciales esperando una respuesta.
</div>

---

## Ciclo de vida de una orden {#lifecycle}

Una orden atraviesa cuatro fases visibles para el administrador. El sistema mueve la orden entre estados automáticamente cuando el conductor o el cliente realiza una acción; el administrador interviene en los puntos de decisión.

<div class="lifecycle">
  <div class="step"><span class="num">1</span><strong>Cotizar</strong><span>cliente crea — admin cotiza</span></div>
  <div class="step"><span class="num">2</span><strong>Aprobar</strong><span>cliente acepta cotización</span></div>
  <div class="step"><span class="num">3</span><strong>Despachar</strong><span>asignar conductor + ruta</span></div>
  <div class="step"><span class="num">4</span><strong>Ejecutar</strong><span>recolección y entrega</span></div>
  <div class="step"><span class="num">5</span><strong>Conciliar</strong><span>ajustar montos reales</span></div>
  <div class="step"><span class="num">6</span><strong>Cerrar</strong><span>cobro y archivo</span></div>
</div>

Las siguientes secciones detallan cada fase desde la perspectiva del administrador.

---

## 1 · Cotizar una orden nueva {#quote}

Cuando un cliente crea una orden desde su app, ésta llega al panel en estado <span class="pill amber">Pendiente</span> sin cotización. Aparecerá en la pestaña *Sin Cotizar* de Necesita Atención y al inicio del listado de Órdenes.

Para esta guía seguimos una orden real (`ORD-KA2SEDK3A75X`) creada por el cliente Lorenzo Wynberg con la tarea «Comprar 2 cajas de leche y pan en Auto Mercado» y entrega en Calle 6, Hospital, San José.

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Listado de órdenes mostrando una orden pendiente recién creada" />
  <figcaption>La orden recién creada aparece arriba del listado de Órdenes con estado <em>Pendiente · Sin Pagar</em>.</figcaption>
</figure>

### Paso 1.1 — Detectarla en Necesita Atención {#step-1-1}
Cuando llega la orden, el contador de la pestaña *Sin Cotizar* aumenta. Es la primera señal del día.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Necesita Atención con badge en Sin Cotizar" />
  <figcaption>La pestaña <em>Sin Cotizar</em> muestra <strong>1</strong> — una orden esperando cotización.</figcaption>
</figure>

### Paso 1.2 — Abrir el detalle de la orden {#step-1-2}
Haga clic sobre la orden para abrir su detalle. En este punto verá las paradas, los detalles de tiempo, el historial de cotizaciones (vacío en este punto) y los pagos.

<figure>
  <img src="/guide/screenshots/23-order-detail-pending.png" alt="Detalle de una orden pendiente sin cotización" />
  <figcaption>Detalle de orden en estado pendiente. Note la advertencia amarilla en la parte superior y que la parada de recolección solo tiene la descripción («Comprar 2 cajas de leche y pan en Auto Mercado») pero ninguna dirección — el botón <em>+ Agregar Dirección</em> permite asignarla.</figcaption>
</figure>

<div class="callout warn">
<strong>Todas las paradas deben tener dirección antes de cotizar</strong>
Cuando el cliente solo describe la tarea sin fijar ubicación, el administrador debe agregar la dirección del comercio donde se hará la compra. Sin direcciones completas, el botón <em>Crear Cotización</em> está deshabilitado.
</div>

### Paso 1.3 — Agregar la dirección de recolección {#step-1-3}
1. En la tarjeta *Paradas*, haga clic en `+ Agregar Dirección` dentro de la parada de recolección.
2. Busque el comercio en el directorio de [Direcciones](#addresses) o ingrese una nueva.
3. Confirme. La parada se completa, la advertencia amarilla desaparece, y aparecen los botones `Crear Cotización` y `Calcular Distancia`.

<figure>
  <img src="/guide/screenshots/30-order-ready-to-quote.png" alt="Orden con todas las direcciones completas, lista para cotizar" />
  <figcaption>La orden ahora tiene Auto Mercado Sabana Sur como dirección de recolección. El botón <em>Crear Cotización</em> está activo en la parte superior derecha.</figcaption>
</figure>

### Paso 1.4 — Crear la cotización (Borrador) {#step-1-4}
1. Presione `Crear Cotización`.
2. Se abrirá un diálogo donde podrá:
   - Agregar líneas de productos por parada (descripción, cantidad, precio unitario estimado) — desde catálogo o manuales.
   - Aplicar tier de servicio: <span class="pill gray">Regular</span>, <span class="pill amber">Express</span>, <span class="pill red">Urgente</span>.
   - Agregar cargos especiales o descuentos.
3. El sistema calcula automáticamente la tarifa de envío con base en distancia, tier y ventana de servicio según las [Reglas de Precios](#pricing).
4. Al guardar, la cotización queda en estado <span class="pill gray">Borrador</span> — guardada pero aún no visible para el cliente.

<figure>
  <img src="/guide/screenshots/31-order-quote-draft.png" alt="Orden con cotización en borrador" />
  <figcaption>La cotización aparece en <em>Historial de Cotizaciones</em> con etiqueta <em>Borrador</em>. Total estimado: ₡7,684.00 (incluye base, distancia y productos estimados).</figcaption>
</figure>

### Paso 1.5 — Enviar la cotización al cliente {#step-1-5}
Cuando la cotización está revisada, presione `Enviar al Cliente`. El estado de la cotización pasa a <span class="pill blue">Enviado</span> y el de la orden a <span class="pill blue">Cotizada</span>. El cliente recibe una notificación en su app y puede aceptar o rechazar.

<figure>
  <img src="/guide/screenshots/32-order-quote-sent.png" alt="Cotización enviada al cliente" />
  <figcaption>Estado actualizado: orden <em>Cotizada</em> — esperando respuesta del cliente. Aparece también el botón <em>Outsource</em> para escenarios donde la operación necesite sub-contratar.</figcaption>
</figure>

### Paso 1.6 — Cliente acepta → orden Aprobada {#step-1-6}
Cuando el cliente acepta desde su app, la orden pasa automáticamente a <span class="pill green">Aprobado</span>. La cotización ya muestra los renglones de la compra estimada y la orden está lista para despachar.

<figure>
  <img src="/guide/screenshots/33-order-approved.png" alt="Orden aprobada con cotización aceptada" />
  <figcaption>Estado <em>Aprobado</em>. La cotización <em>QUO-K9N5EXSZ6NFY</em> está <em>Aceptada</em>. Las líneas de productos son visibles bajo cada parada.</figcaption>
</figure>

### Estados de la cotización {#quote-states}
| Estado | Significado |
| --- | --- |
| <span class="pill gray">Borrador</span> | Guardada pero no enviada — solo la ve el administrador. |
| <span class="pill blue">Enviado</span> | Visible para el cliente; espera su aprobación. |
| <span class="pill green">Aceptado</span> | Cliente aceptó. La orden pasa a <span class="pill green">Aprobado</span>. |
| <span class="pill red">Rechazado</span> | Cliente rechazó. Puede generar otra cotización si es necesario. |
| <span class="pill gray">Expirado</span> | Pasó la fecha de validez sin aceptación. |
| <span class="pill green">Finalizado</span> | Generada al cierre tras la conciliación. |

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Listado de cotizaciones" />
  <figcaption>Sección <em>Cotizaciones</em> — historial completo de todas las cotizaciones del sistema con filtros por estado, fecha y monto.</figcaption>
</figure>

---

## 2 · Despachar la orden {#dispatch}

Una orden <span class="pill green">Aprobado</span> está lista para asignarle un conductor y crear su ruta. El sistema intenta hacerlo automáticamente mediante `AutoDispatchService`, que evalúa:

- Factibilidad de horario contra la ventana del cliente.
- Distancia desde la posición actual / próximo destino del conductor.
- Capacidad restante del vehículo.
- Densidad de la ruta — el algoritmo prefiere agregar paradas a un conductor activo en la zona antes que asignar a uno ocioso (estrategia de *bin-packing*).

<div class="callout info">
<strong>Despacho automático vs manual</strong>
La gran mayoría de órdenes se despachan solas. El administrador interviene cuando aparece un conflicto: la orden cae en la pestaña <em>Conflictos</em> de Necesita Atención con el motivo descrito.
</div>

### Resultado del despacho {#dispatch-result}
Una vez asignado, el estado pasa a <span class="pill blue">Conductor Asignado</span>, la parada de recolección se reclasifica a *Compra* (porque tiene productos a comprar) y se genera una entrada en la sección Rutas.

<figure>
  <img src="/guide/screenshots/35-order-assigned.png" alt="Orden con conductor asignado" />
  <figcaption>Orden con <em>Conductor Asignado</em>. La parada se renombra a <em>Compra</em> reflejando que el conductor debe adquirir los productos antes de entregarlos.</figcaption>
</figure>

<figure>
  <img src="/guide/screenshots/36-routes-active.png" alt="Sección Rutas con la nueva ruta asignada" />
  <figcaption>Sección <em>Rutas</em>. La ruta nueva <em>RTE-FBU8B79YW4JT</em> tiene dos paradas (Compra → Entrega), un mapa en vivo, y los botones <em>Outsource Driver</em> y <em>Optimizar Ruta</em>.</figcaption>
</figure>

### Cuando hay conflicto {#dispatch-conflict}
Si el sistema no encuentra un despacho factible, la orden queda en *Conflictos*. Las acciones típicas son:

1. **Asignar manualmente** — abrir la orden, presionar `Asignar Conductor`, elegir de la lista.
2. **Ajustar la ventana** — extender el rango temporal si la única razón es la disponibilidad horaria.
3. **Sub-contratar (outsourcing)** — pagar a un proveedor externo. Solo cuando no hay otra opción, ya que reduce margen.
4. **Cancelar** — devolver al cliente con explicación.

<div class="callout warn">
<strong>Una sola entrega por orden</strong>
Cada orden tiene exactamente un punto de entrega final. Si el cliente necesita entregar en varios destinos diferentes, debe crear órdenes separadas. El sistema rechaza una segunda parada de tipo «entrega» en la misma orden.
</div>

---

## 3 · Monitorear la ejecución {#monitor}

Una vez asignada, la orden recorre estados a medida que el conductor avanza:

| Estado | Significado |
| --- | --- |
| <span class="pill blue">Conductor Asignado</span> | Conductor recibió la asignación pero aún no inició. |
| <span class="pill blue">Recogiendo</span> · <span class="pill blue">Llegando</span> · <span class="pill blue">En sitio</span> | Subestados durante la fase de recolección/compra. |
| <span class="pill blue">Recolectada</span> | Compras hechas, listo para entregar. |
| <span class="pill blue">En Tránsito</span> | Camino al destino final. |
| <span class="pill blue">Llegando</span> · <span class="pill blue">En sitio</span> (entrega) | Subestados de la fase de entrega. |
| <span class="pill amber">Esperando confirmación</span> | Pendiente de PIN del cliente o foto de prueba. |
| <span class="pill green">Completado</span> | Entregada con prueba registrada. |

### Recolección — el conductor compra {#monitor-pickup}
<figure>
  <img src="/guide/screenshots/37-order-picking-up.png" alt="Orden en estado Recogiendo" />
  <figcaption>Estado <em>Recogiendo</em> — el conductor está en o camino al comercio para realizar la compra.</figcaption>
</figure>

### En tránsito — camino al destino {#monitor-transit}
<figure>
  <img src="/guide/screenshots/39-order-in-transit-active.png" alt="Orden en tránsito" />
  <figcaption>Estado <em>En Tránsito</em> — la compra está hecha y el conductor va camino al cliente.</figcaption>
</figure>

### Entrega completada {#monitor-delivered}
Al confirmar la entrega con PIN y foto, la orden pasa a <span class="pill green">Completado</span>. Las paradas quedan marcadas como *Completado*.

<figure>
  <img src="/guide/screenshots/40-order-completed-needs-reconciliation.png" alt="Orden completada esperando conciliación" />
  <figcaption>Orden <em>Completado</em> con paradas finalizadas. La cotización original sigue como referencia y aparece el pago en estado <em>Autorizado</em> (preautorizado, listo para capturar el monto final tras conciliación).</figcaption>
</figure>

### PIN y prueba de entrega {#pin-and-pod}
Cada orden tiene un **PIN de 6 dígitos** generado al crear la orden. El cliente lo recibe en su app; el conductor debe pedirlo al entregar para confirmar identidad. Adicionalmente, según configuración, puede requerirse:

- **Prueba fotográfica** — el conductor toma foto del paquete entregado.
- **Firma** — el destinatario firma en pantalla.

Sin la prueba requerida, la orden queda en <span class="pill amber">Esperando confirmación</span> hasta resolverse.

---

## 4 · Conciliar montos finales {#reconcile}

La conciliación es el ajuste posterior a la entrega: la cotización inicial es una *estimación* de cuánto costarán los productos. El precio real solo se conoce cuando el conductor compra. La conciliación reconcilia ambos montos y genera un cargo o crédito si hay diferencia.

<div class="callout info">
<strong>Cuándo aparece</strong>
Las órdenes <span class="pill green">Completado</span> con pago <em>Autorizado</em> sin conciliar aparecen en la pestaña <em>Conciliación</em> de Necesita Atención.
</div>

<figure>
  <img src="/guide/screenshots/41-needs-attention-conciliacion.png" alt="Pestaña Conciliación con orden pendiente" />
  <figcaption>La pestaña <em>Conciliación</em> muestra <strong>1</strong> — la orden recién completada espera ajuste de montos.</figcaption>
</figure>

### Paso 4.1 — Abrir el diálogo de conciliación {#step-4-1}
Desde el detalle de una orden completada con pago autorizado aparece el botón `Conciliar` en el encabezado (también es accesible directamente desde la pestaña *Conciliación* de Necesita Atención). Al presionarlo se abre el formulario completo.

<figure>
  <img src="/guide/screenshots/42-reconciliation-dialog.png" alt="Diálogo de Conciliación abierto sobre la orden completada" />
  <figcaption>Diálogo <em>Conciliar Orden</em>. Encabezado con <em>Total de Cotización Original</em> (₡7,684.00) y <em>Cliente pagó</em>. Bajo <em>Artículos</em> aparece cada parada de compra con sus líneas (cantidad + precio unitario editables y un total por línea). El pie calcula <em>Cargos por servicio</em>, <em>Total de Artículos</em>, <em>Impuesto</em>, <em>Total estimado nuevo</em> y la <strong>Diferencia</strong> (delta) en rojo o verde según el signo.</figcaption>
</figure>

### Paso 4.2 — Ajustar líneas con los precios reales {#step-4-2}
1. Para cada línea, edite la *Cantidad* y el *Precio Unitario* usando lo realmente pagado (basado en el comprobante de compra). Por ejemplo, si la *Caja de leche entera 1L (×2)* cotizada a ₡1,500 salió en ₡1,700, ingrese ₡1,700.
2. Si el conductor adquirió artículos extra que no estaban en la cotización, presione `+ Agregar Artículo` y registre la nueva línea.
3. Si algún artículo no fue conseguido, presione la *×* al final de la línea para eliminarla — saldrá del total.
4. Use el campo *Notas* para dejar contexto al cliente sobre el ajuste (opcional pero recomendado cuando hay sobrecargo).
5. Revise la fila *Diferencia*: positivo = sobrecargo (el cliente debe la diferencia), negativo = crédito (se cobra menos de lo autorizado), cero = sin ajuste.

### Paso 4.3 — Generar la conciliación {#step-4-3}
Al confirmar el diálogo, el sistema:

- Crea una nueva cotización en estado <span class="pill green">Finalizado</span> (versión 2).
- Captura del pago autorizado el monto final correcto. Si el monto real es menor que el autorizado, solo cobra lo real. Si es mayor, marca el pago como <span class="pill amber">Sobrecargo Pendiente</span>.
- Marca la orden con `reconciled_at` y la quita de la pestaña *Conciliación*.

<figure>
  <img src="/guide/screenshots/42-order-reconciled.png" alt="Orden tras la conciliación" />
  <figcaption>Orden tras conciliar. Aparece la nueva cotización <em>Finalizado</em> v2 con el monto real (₡10,339.50) junto a la cotización original aceptada (₡7,684.00). El pago <em>Autorizado</em> ya fue capturado por el monto correcto.</figcaption>
</figure>

### Resultado posible {#reconciliation-outcomes}
| Diferencia | Resultado | Estado de pago |
| --- | --- | --- |
| Real = cotizado | Sin ajuste — captura del monto autorizado. | <span class="pill green">Pagado</span> |
| Real &lt; cotizado | Captura por el monto real (más bajo). El cliente solo paga lo realmente comprado. | <span class="pill green">Pagado</span> |
| Real &gt; cotizado | Sobrecargo — el cliente debe pagar la diferencia, generalmente con un segundo cobro o saldo. | <span class="pill amber">Sobrecargo Pendiente</span> hasta cubrirse. |

<div class="callout tip">
<strong>El pago se «autoriza» antes de la entrega</strong>
Cuando la cotización es aceptada, la pasarela autoriza un cargo con el monto cotizado pero <em>no lo cobra todavía</em>. La conciliación es la que dispara la captura final: por el monto correcto, ni más ni menos. Esto evita reembolsos o cargos sorpresa.
</div>

---

## Órdenes {#orders}

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Listado completo de órdenes" />
  <figcaption>Listado de órdenes con filtros de estado, fechas y rutas.</figcaption>
</figure>

El listado completo de órdenes — la fuente de verdad para reportes y búsquedas históricas. Filtros disponibles:

- Estado de la orden (todos los estados del ciclo).
- Estado de pago (Pagado, Sin Pagar, Sobrecargo).
- Recolección y entrega programadas.
- Búsqueda por código de orden o cliente.

### Anatomía del detalle de una orden {#order-detail}

<figure>
  <img src="/guide/screenshots/16-order-detail.png" alt="Detalle completo de una orden" />
  <figcaption>Detalle de orden completa — información, paradas, cotizaciones, pagos.</figcaption>
</figure>

La página de detalle muestra:

- **Encabezado** — código de orden, estado, fecha de creación, acciones rápidas (cancelar, eliminar, asignar).
- **Paradas** — todas las paradas en orden, con dirección, descripción y estado individual.
- **Detalles de la Orden** — tier de servicio, ventana, requisitos (PIN, foto, firma), distancia y tiempo estimado.
- **Historial de Cotizaciones** — todas las cotizaciones generadas (inicial + finalizada tras conciliación).
- **Pagos** — registros de pagos asociados.
- **Línea de tiempo** — eventos del ciclo de vida con marca temporal.

---

## Cotizaciones {#quotes}

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Sección de cotizaciones" />
  <figcaption>Listado de cotizaciones. Cada cotización está vinculada a una orden.</figcaption>
</figure>

Vista alternativa centrada en cotizaciones — útil para auditar cambios de precio, ver tasas de aceptación, o re-enviar cotizaciones expiradas.

---

## Rutas {#routes}

<figure>
  <img src="/guide/screenshots/04-routes.png" alt="Sección Rutas" />
  <figcaption>Rutas activas con conductores en movimiento.</figcaption>
</figure>

Vista operativa en vivo. Cada ruta agrupa varias paradas asignadas al mismo conductor. La densidad de la ruta es objetivo del algoritmo de despacho — siempre busca empacar más paradas en menos rutas.

---

## Conductores {#drivers}

Sección crítica del panel. Aquí se gestionan los mensajeros que ejecutan las entregas: datos personales, licencia, vehículo, ubicación base y — lo más importante — **su disponibilidad horaria**, porque sin horario configurado el sistema no puede asignar órdenes a un conductor.

<figure>
  <img src="/guide/screenshots/50-drivers-list.png" alt="Listado de conductores con dos registros" />
  <figcaption>Listado de Conductores. El botón <em>+ Crear conductor</em> está en la esquina superior derecha. Cada fila muestra estado <em>Activo / Inactivo</em>, número y vencimiento de licencia, placa del vehículo y fecha de creación.</figcaption>
</figure>

### Internos vs Externalizados (outsourced) {#internal-vs-outsourced}
El sistema distingue dos tipos de conductores:

| Tipo | Cuándo se usa | Características |
| --- | --- | --- |
| **Interno** (en planilla) | Operación regular, día a día. | Recibe salario fijo. Tiene **horario configurable** y **ubicación base**. El sistema lo considera para despacho automático según factibilidad. |
| **Externalizado** (outsourced) | Cuando ningún conductor interno tiene factibilidad para una orden y no se puede ajustar la ventana. | Proveedor externo que se paga por viaje. **No** tiene horario ni ubicación base — su disponibilidad se asume bajo demanda. Reduce margen, úsese con criterio. |

<div class="callout info">
<strong>Internos en planilla, no por viaje</strong>
Los conductores internos reciben salario fijo. Esto cambia cómo se piensa la asignación: no hay incentivo a «repartir» viajes — se prioriza la eficiencia operativa (rutas densas, mínimo conductores activos).
</div>

### Detalle del conductor — pestaña Detalles {#driver-details}

<figure>
  <img src="/guide/screenshots/51-driver-detail.png" alt="Detalle de un conductor interno" />
  <figcaption>Pestaña <em>Detalles</em>. Encabezado con nombre, ID público, toggle <em>Activo</em> y botón <em>Eliminar</em>. Cuatro tarjetas con la información esencial.</figcaption>
</figure>

La pestaña *Detalles* contiene cinco tarjetas:

| Tarjeta | Contenido | Acciones |
| --- | --- | --- |
| **Cuenta de Usuario** | Nombre, correo electrónico, teléfono. | Botón *Ver Perfil de Usuario* abre la cuenta del conductor en la sección Usuarios. |
| **Información de Licencia** | Número de licencia y fecha de vencimiento. | Si la licencia venció, aparece la etiqueta <span class="pill red">Vencido</span> automáticamente. |
| **Información del Vehículo** | Placa del vehículo. | Editable. |
| **Fechas** | Fecha de creación y última actualización del registro. | Solo lectura. |
| **Ubicación Base** <span class="pill gray">solo internos</span> | Coordenadas y dirección desde donde el conductor inicia/termina su turno. | Botón *Editar/Establecer* abre un mapa donde se ancla la posición. Se usa para cálculos de factibilidad de despacho. |

#### Toggle Activo

El toggle *Activo* en la esquina superior derecha controla si el conductor está disponible globalmente para asignaciones. Útil para vacaciones, suspensiones o licencias prolongadas — alterna sin necesidad de eliminar el registro.

### Configurar el horario del conductor — pestaña Horario {#driver-schedule}

**Esta es la configuración crítica para que el conductor pueda recibir órdenes.** Sin bloques de disponibilidad, el algoritmo de despacho automático no considerará al conductor — nunca le llegarán paradas.

<figure>
  <img src="/guide/screenshots/52-driver-schedule.png" alt="Calendario de disponibilidad del conductor" />
  <figcaption>Pestaña <em>Horario</em> — calendario de disponibilidad semanal. Los bloques azules son turnos futuros programados; los grises son días pasados (no editables).</figcaption>
</figure>

#### Cómo funciona el calendario

- **Vista por defecto: Semana**, con horas de 4:00 a.m. a 10:00 p.m. Botón *Mes* alterna a vista mensual.
- **Cada bloque azul es un turno disponible** — durante ese rango el conductor puede recibir asignaciones.
- **Días pasados se muestran en gris** y son de solo lectura (no se modifica el histórico).
- **Día actual destacado** en color amarillo claro.

#### Crear un bloque de disponibilidad

1. Haga clic sobre el día y hora deseados en el calendario, o arrastre para seleccionar un rango.
2. Se abre un diálogo donde puede ajustar la hora de inicio y fin del bloque.
3. Confirme. El bloque queda en el calendario como turno programado.
4. Repita para cubrir toda la semana laboral del conductor.
5. **Importante:** presione `Guardar` en la esquina superior derecha cuando termine — los cambios no se persisten hasta guardar.

#### Editar o eliminar un bloque

1. Haga clic sobre un bloque existente.
2. El diálogo se abre en modo edición — puede ajustar las horas o presionar `Eliminar`.
3. Recuerde guardar cambios al final.

<div class="callout warn">
<strong>El pasado no se modifica</strong>
Los días anteriores al actual están bloqueados. Si necesita corregir un histórico de horarios, hágalo a través del equipo técnico (el cambio puede afectar reportes y métricas).
</div>

<div class="callout tip">
<strong>Patrón recomendado</strong>
Configure los horarios de la semana siguiente cada viernes. Use bloques de mañana (08:00–12:00) y tarde (13:00–17:00) separados por una hora de almuerzo, o un bloque corrido (08:00–17:00) según el contrato. Los bloques múltiples por día permiten respetar descansos legales sin que el algoritmo asigne paradas durante el almuerzo.
</div>

### Crear un conductor nuevo {#driver-create}

<figure>
  <img src="/guide/screenshots/53-driver-create.png" alt="Formulario de creación de conductor" />
  <figcaption>Formulario <em>Crear Conductor</em>. Sección <em>Personal Information</em> arriba (nombre, correo, teléfono, contraseña, fecha de nacimiento, sexo, idioma, avatar) y <em>License Information</em> debajo (número de licencia, placa del vehículo).</figcaption>
</figure>

El alta de un nuevo conductor requiere:

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| Nombre completo | Sí | Aparecerá en notificaciones al cliente y en el listado. |
| Correo electrónico | Sí | Será el usuario de acceso a la app móvil del conductor. |
| Teléfono | Sí | Formato Costa Rica: `+506 XXXX-XXXX`. |
| Contraseña | Sí | Genere una temporal — el conductor podrá cambiarla en su primer ingreso. |
| Fecha de nacimiento | Sí | Verificación de mayoría de edad y datos de planilla. |
| Sexo | Sí | Lista predefinida. |
| Código de idioma | Sí | Idioma con que recibirá notificaciones (es / en / fr). |
| Avatar | No | Foto que verán los clientes y el cuadro administrativo. |
| Número de licencia | Sí | Se valida formato. |
| Placa del vehículo | Sí | Formato CR: `ABC-123`. |
| Fecha de vencimiento de licencia | Sí | El sistema marca como <span class="pill red">Vencido</span> al pasar la fecha. |
| Foto de licencia (frente y dorso) | Sí | Adjuntar PDF o imagen para auditoría. |

#### Después de crear el conductor

1. Abra el detalle del conductor recién creado.
2. En la pestaña *Detalles*, configure la **Ubicación Base** (de dónde sale a trabajar).
3. Pase a la pestaña *Horario* y configure su disponibilidad de la semana en curso.
4. Active el toggle *Activo* si no lo está.

Solo después de estos tres pasos el conductor estará listo para recibir asignaciones automáticas.

---

## Usuarios {#users}

<figure>
  <img src="/guide/screenshots/07-users.png" alt="Listado de usuarios" />
  <figcaption>Clientes (personas físicas) registrados en la plataforma.</figcaption>
</figure>

Clientes individuales. Aquí puede ver historial de órdenes por cliente, métodos de pago registrados y estado de la cuenta.

---

## Empresas {#businesses}

<figure>
  <img src="/guide/screenshots/09-businesses.png" alt="Listado de empresas" />
  <figcaption>Clientes corporativos.</figcaption>
</figure>

Cuentas de empresa. Las empresas pueden tener:

- Múltiples usuarios autorizados a crear órdenes.
- Tarifas negociadas distintas a las del público general.
- Facturación consolidada mensual.
- Catálogo de direcciones frecuentes propio.

---

## Direcciones {#addresses}

<figure>
  <img src="/guide/screenshots/10-addresses.png" alt="Directorio de direcciones" />
  <figcaption>Directorio reutilizable de direcciones de comercios y clientes frecuentes.</figcaption>
</figure>

Directorio compartido. Mantener este directorio actualizado acelera la cotización: en lugar de geocodificar manualmente cada vez «Auto Mercado, Sabana Sur», se selecciona del directorio.

---

## Catálogos {#catalogs}

<figure>
  <img src="/guide/screenshots/11-catalogs.png" alt="Catálogos de productos" />
  <figcaption>Catálogos de productos para cotizaciones rápidas.</figcaption>
</figure>

Listas de productos pre-cargados con precio sugerido. Al cotizar, el administrador puede seleccionar líneas del catálogo en lugar de escribirlas manualmente. Útil para clientes recurrentes o canastas estandarizadas.

---

## Reglas de Precios {#pricing}

<figure>
  <img src="/guide/screenshots/12-pricing.png" alt="Reglas de precios" />
  <figcaption>Configuración de tarifas por distancia, tier y ventana de servicio.</figcaption>
</figure>

Define cómo el sistema calcula el costo de envío. Variables principales:

- **Distancia** — tarifa base + costo por kilómetro.
- **Tier** — Regular, Express, Urgente — multiplican la tarifa base.
- **Ventana de servicio** — horario laboral vs nocturno o festivo.
- **Recargos especiales** — peso adicional, manejo frágil, etc.

<div class="callout warn">
<strong>Cambios afectan cotizaciones futuras</strong>
Las cotizaciones ya emitidas mantienen su precio. Solo nuevas cotizaciones recalculan con las reglas actualizadas.
</div>

---

## Notificaciones {#notifications}

<figure>
  <img src="/guide/screenshots/13-notifications.png" alt="Centro de notificaciones" />
  <figcaption>Centro de notificaciones — eventos relevantes para operación.</figcaption>
</figure>

Feed de eventos del sistema dirigidos al equipo de administración: nuevas órdenes, cotizaciones aceptadas, conflictos de despacho, conductores reportando problemas, cobros fallidos, solicitudes de reembolso. Todos los campos son `camelCase` y siguen los tipos definidos en `Api.Broadcast.*`.

---

## Registros de auditoría {#audit-logs}

<figure>
  <img src="/guide/screenshots/14-audit-logs.png" alt="Registros de auditoría" />
  <figcaption>Bitácora de quién hizo qué.</figcaption>
</figure>

Registro inmutable de todas las acciones administrativas. Útil para:

- Investigar discrepancias en órdenes (¿quién canceló?, ¿quién cambió la tarifa?).
- Cumplimiento regulatorio.
- Capacitación — revisar acciones de personal nuevo.

---

## Configuraciones {#settings}

<figure>
  <img src="/guide/screenshots/15-settings.png" alt="Configuraciones generales" />
  <figcaption>Pantalla <em>Configuraciones</em>. Tres tarjetas: <em>Idioma</em> (selector inline), <em>Configuración de Moneda</em> y <em>Ventana de Servicio</em> (ambas abren subpáginas con la flecha derecha).</figcaption>
</figure>

Aquí viven los parámetros globales de la operación. Ojo: la lista es corta a propósito — solo lo que un administrador necesita cambiar a mano. El resto del comportamiento (tarifas, ventanas por orden, factibilidad de despacho) se modela en sus propias secciones.

### Idioma

Cambia el idioma de la interfaz para el administrador actual entre **español**, **inglés** y **francés**. La selección persiste por usuario y reescribe el prefijo de la URL (`/es/...`, `/en/...`, `/fr/...`).

### Configuración de Moneda {#settings-currencies}

<figure>
  <img src="/guide/screenshots/15b-currencies.png" alt="Pantalla de Configuración de Moneda en modo automático" />
  <figcaption>Pantalla <em>Configuración de Moneda</em> en modo <em>Automático</em>. De arriba a abajo: botón <em>Sincronizar Tasas</em>, tarjeta <em>Modo de tipo de cambio</em>, tarjeta <em>Moneda Base</em> (CRC con precisión 2 decimales), y tabla de monedas habilitadas.</figcaption>
</figure>

Esta sección controla qué monedas acepta la plataforma, cómo se obtienen los tipos de cambio y cómo se redondea cada una al mostrar precios. Toda regla de precios y toda cotización se almacena internamente en la **moneda base**; las demás monedas se convierten desde esa base al mostrar el monto al usuario.

#### Modo de tipo de cambio: Automático vs Manual

El primer interruptor decide cómo se obtienen las tasas:

- **Automático** <span class="pill green">por defecto</span> — el sistema descarga tasas desde proveedores externos (p. ej. *gometa*) y las refresca de forma programada. Aparece el botón `Sincronizar Tasas` en la esquina superior derecha para forzar una actualización inmediata.
- **Manual** — el administrador fija el tipo de cambio a mano por cada moneda. Útil cuando se quiere usar una tasa fija negociada con un banco o aislar la operación de oscilaciones intradía.

<figure>
  <img src="/guide/screenshots/15b3-currency-manual-mode.png" alt="Configuración de Moneda en modo Manual" />
  <figcaption>Mismo panel después de mover el switch a <em>Manual</em>. El botón <em>Sincronizar Tasas</em> desaparece, la columna <em>Fecha de Tasa</em> de cada moneda no-base muestra la etiqueta <span class="pill gray">Manual</span>, y el <em>Tipo de Cambio</em> queda en <em>–</em> hasta que se ingrese a mano.</figcaption>
</figure>

#### Moneda base

La tarjeta *Moneda Base* muestra cuál es la moneda en la que se almacenan todos los importes internos (en el ejemplo, CRC con precisión de 2 decimales). No se puede deshabilitar y su tipo de cambio siempre es `1.000000`. Cambiar la moneda base es una operación de migración — no se hace desde este panel.

#### Tabla de monedas

La tabla lista todas las monedas configuradas. Columnas:

| Columna | Qué muestra |
| --- | --- |
| **Código / Nombre / Símbolo** | Identificadores ISO 4217 y la moneda mostrada (p. ej. `USD · US Dollar · $`). |
| **Tipo de Cambio** | Tasa actual respecto a la moneda base. En modo manual muestra la tasa fijada por el admin. |
| **Fecha de Tasa** | Cuándo se actualizó por última vez, con etiqueta de la fuente (p. ej. *gometa*) o <span class="pill gray">Manual</span>. |
| **Redondeo** | Resumen del modo + incremento (p. ej. `nearest @ 0.01`). |
| **Estado** | <span class="pill blue">Base</span>, <span class="pill green">Activo</span> o <span class="pill gray">Deshabilitado</span>. |
| **Habilitado** | Switch para activar/desactivar. La moneda base no se puede desactivar. |
| **Acciones** | Botón *Editar* — abre el diálogo de configuración de la moneda. |

#### Diálogo de edición — redondeo

<figure>
  <img src="/guide/screenshots/15b2-currency-rounding-edit.png" alt="Diálogo de edición de redondeo" />
  <figcaption>Diálogo <em>Editar Configuración de Redondeo</em>. Dos campos: <em>Modo de Redondeo</em> (Al más cercano, Redondear hacia arriba, Redondear hacia abajo) e <em>Incremento de Redondeo</em> (0.01 = centavos, 0.10 = décimos, 0.50, 1.00…).</figcaption>
</figure>

El redondeo afecta cómo se presentan los importes al cliente final, no cómo se almacenan internamente. Por ejemplo, una cotización calculada en ₡7,683.50 con incremento `1` y modo *Al más cercano* se muestra como ₡7,684.

#### Diálogo de edición — tasa manual (solo modo Manual)

<figure>
  <img src="/guide/screenshots/15b4-currency-manual-rate-edit.png" alt="Diálogo de edición con tasa manual para USD" />
  <figcaption>En modo <em>Manual</em>, al editar una moneda no-base aparece el campo <em>Tipo de cambio manual</em>. La vista previa de conversión muestra ambos sentidos (1 USD = 490 CRC y 1 CRC = 0.002041 USD) y advierte si el valor parece invertido.</figcaption>
</figure>

<div class="callout warn">
<strong>Sentido de la tasa</strong>
La tasa se ingresa como <em>cuántas unidades de la moneda base equivalen a 1 unidad de esta moneda</em>. Si por error se ingresa al revés (p. ej. <code>0.002</code> en lugar de <code>490</code>), la vista previa pinta una alerta ámbar sugiriendo el valor inverso.
</div>

### Ventana de Servicio {#settings-service-window}

<figure>
  <img src="/guide/screenshots/15c-service-window.png" alt="Pantalla de Ventana de Servicio" />
  <figcaption>Pantalla <em>Ventana de Servicio</em>. Tres tarjetas: habilitar/deshabilitar, <em>Horario de Operación</em> (con la barra visual verde/roja cuando está activa) y <em>Escalación de Órdenes Sin Asignar</em>.</figcaption>
</figure>

Aquí se define cuándo la plataforma acepta nuevas órdenes y qué hacer con las que se quedan sin conductor demasiado tiempo. Esta configuración es global — afecta a clientes, conductores y al algoritmo de despacho por igual.

#### Habilitar / deshabilitar la ventana

El primer interruptor enciende o apaga la ventana de servicio. **Cuando está deshabilitada**, los clientes pueden crear órdenes 24/7 y el algoritmo no rechaza nada por horario. **Cuando está habilitada**, las órdenes fuera del horario de operación son bloqueadas o quedan en cola para el siguiente intervalo.

#### Horario de operación

Dos campos de hora controlan la ventana del día:

- *El servicio cierra a las* — hora a la que deja de aceptarse trabajo (inicio del bloque cerrado).
- *El servicio abre a las* — hora a la que vuelve la operación (fin del bloque cerrado).

Si la ventana cruza la medianoche, la barra de timeline lo dibuja correctamente: dos segmentos verdes a los extremos del día y un segmento rojo en el medio (cerrado). En el caso normal (apertura en la mañana y cierre en la noche), se ve un segmento verde central rodeado de dos rojos.

#### Escalación de órdenes sin asignar

Las órdenes pagadas que no consiguen conductor escalan automáticamente para evitar quedar olvidadas:

- **Cancelación automática habilitada** — si se enciende, las órdenes que cumplan el umbral se cancelan con reembolso completo. Si se apaga, simplemente se notifica al admin y la orden permanece abierta hasta intervención manual.
- **Umbral de escalación (horas laborales)** — número de horas *dentro de la ventana de servicio* tras las que se dispara la escalación. El campo acepta 1–24.

<div class="callout info">
<strong>«Horas laborales», no reloj de pared</strong>
El umbral se cuenta solo durante horas dentro de la ventana de servicio. Una orden que entra a las 11 p.m. con ventana 8 a.m.–10 p.m. y umbral de 4 horas no escala a las 3 a.m. — escala a mediodía del día siguiente, tras 4 horas reales de operación abierta.
</div>

---

## Glosario de estados {#state-glossary}

### Estados de la orden {#order-states}
| Código interno | Etiqueta | Significado |
| --- | --- | --- |
| `pending` | <span class="pill amber">Pendiente</span> | Cliente creó la orden — esperando cotización. |
| `estimated` | <span class="pill blue">Cotizada</span> | Cotización enviada — esperando respuesta del cliente. |
| `approved` | <span class="pill green">Aprobada</span> | Cliente aceptó — lista para despacho. |
| `assigned` | <span class="pill blue">Asignada</span> | Conductor asignado — recoger pendiente. |
| `picking_up` · `arriving_at_pickup` · `arrived_at_pickup` | <span class="pill blue">Recolección</span> | Sub-estados durante la fase de recolección. |
| `picked_up` | <span class="pill blue">Recolectada</span> | Productos en mano del conductor. |
| `in_transit` | <span class="pill blue">En Tránsito</span> | Camino al destino final. |
| `arriving_at_drop_off` · `arrived_at_drop_off` | <span class="pill blue">Entrega</span> | Sub-estados al llegar al destino. |
| `waiting_confirmation` | <span class="pill amber">Esperando confirmación</span> | Falta PIN o prueba fotográfica. |
| `completed` | <span class="pill green">Completada</span> | Entregada — pendiente de conciliación. |
| `canceled` | <span class="pill gray">Cancelada</span> | Cliente o admin canceló antes de despachar. |
| `denied` | <span class="pill red">Rechazada</span> | Admin rechazó la cotización. |
| `delivery_failed` | <span class="pill red">Entrega fallida</span> | No se pudo entregar (cliente ausente, dirección errónea, etc.). |
| `returned_to_sender` | <span class="pill gray">Devuelta</span> | Productos retornados al remitente. |

### Estados de pago {#payment-states}
| Código | Etiqueta | Significado |
| --- | --- | --- |
| `unpaid` | <span class="pill amber">Sin Pagar</span> | Sin pago registrado. |
| `paid` | <span class="pill green">Pagado</span> | Cobro completo recibido. |
| `surcharge_due` | <span class="pill amber">Sobrecargo Pendiente</span> | Tras conciliación quedó saldo por cobrar. |
| `refunded` | <span class="pill gray">Reembolsada</span> | Devolución total ejecutada. |

---

## Preguntas frecuentes {#faq}

### El cliente quiere modificar la dirección de entrega después de aprobada — ¿se puede? {#faq-edit-address}
Sí, mientras la orden esté en estado <span class="pill green">Aprobada</span> o <span class="pill blue">Asignada</span> y el conductor no haya iniciado la fase de recolección, las direcciones son editables. Una vez que la orden pasa a <span class="pill blue">Recolectada</span>, las direcciones quedan bloqueadas. Para cambios posteriores, lo correcto es crear una nueva orden.

### ¿Qué hago si un conductor reporta un problema durante la entrega? {#faq-delivery-problem}
El conductor puede marcar *Entrega Fallida* desde su app, lo cual mueve la orden a <span class="pill red">Entrega fallida</span>. Esto la lleva a la pestaña *Conflictos* de Necesita Atención. Las opciones son: reintentar la entrega (re-asignar), devolver al remitente, o marcar como pérdida cubierta por seguro.

### El despacho automático asignó al conductor «equivocado» — ¿puedo reasignar? {#faq-reassign-driver}
Sí. Desde el detalle de la orden, presione `Reasignar` — verá la lista de conductores con disponibilidad ordenados por factibilidad. Tenga en cuenta que reasignar puede empeorar la densidad global de rutas; el algoritmo ya optimiza por bin-packing.

### ¿Cuándo se sub-contrata (outsourcing)? {#faq-outsource-when}
Cuando ningún conductor de planilla tiene factibilidad para la orden y el cliente no acepta extender la ventana. Es una decisión costosa — reduce margen porque se paga al proveedor externo. Use con criterio.

### El cliente pagó pero la orden quedó en «Sobrecargo Pendiente» — ¿por qué? {#faq-surcharge-pending}
Porque la conciliación detectó que el monto real de productos fue mayor a la cotización inicial. El cliente pagó la cotización original, pero queda un delta. Notifíquele para cobrar la diferencia.

### ¿Qué diferencia hay entre cancelar y rechazar una orden? {#faq-cancel-vs-reject}
**Cancelar** es para órdenes ya cotizadas o aprobadas que se desisten (cliente o admin). **Rechazar** es exclusivo del paso de cotización — el admin decide no atenderla (capacidad insuficiente, fuera de zona, etc.).

### ¿Cómo se generan los PIN de entrega? {#faq-pin-generation}
Automáticamente al crear la orden — un código de 6 dígitos único por orden. Se muestra al cliente en su app y al conductor durante la entrega. Sirve como verificación de identidad del receptor.

### ¿Puedo crear una orden desde el panel sin que el cliente la inicie? {#faq-admin-create}
No directamente desde el panel. Las órdenes siempre nacen del lado del cliente (app móvil). El panel administra el ciclo de vida — cotizar, despachar, conciliar — pero no expone un formulario para crear órdenes manualmente. Si un cliente llama por teléfono, la práctica es guiarlo a que la cree desde su app o coordinar con el equipo técnico para usar el endpoint de API directamente.
