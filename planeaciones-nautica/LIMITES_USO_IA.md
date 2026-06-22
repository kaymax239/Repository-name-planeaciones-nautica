# Límites de uso de IA — Regla de producto (liberación agosto 2026)

> **Estado:** regla **definida, no implementada**. Este documento la deja registrada para que
> se considere en cualquier diseño de seguridad, endpoints, cuotas y lógica futura.
> _Registrado: 2026-06-21._

## 1. La regla

Al liberarse formalmente el sistema en **agosto 2026**, cada docente tendrá la siguiente
restricción para la generación de **presentaciones con IA**:

- **1 presentación IA al mes**
- **por materia**
- **por docente**

**Ejemplo:** un docente que imparte Álgebra podrá generar **una sola** presentación IA de
Álgebra durante ese mes. Si imparte además Física, tendrá otra cuota independiente de 1 para
Física.

### Precisiones de alcance
- La unidad de conteo es **(docente × materia × mes-calendario)**.
- El límite **NO** es por unidad ni por tema: generar la presentación de *Álgebra · Unidad 1*
  consume la cuota mensual de *Álgebra* completa para ese docente.
- Aplica **solo** a la ruta de IA (Claude/Opus). El **generador determinista**
  (`construirPresentacionV2`) y las plantillas premium hand-authored **no** consumen cuota
  (no tienen costo de API). Esto permite que el docente siga teniendo material aunque agote
  su presentación IA del mes.
- El reinicio del contador es **mensual por calendario** (no ventana móvil de 30 días),
  salvo decisión contraria.

## 2. Restricciones de diseño (qué NO hacer)

- ❌ **No** usar `localStorage`/estado de cliente como mecanismo definitivo de cuota: es
  trivialmente manipulable y no sobrevive entre dispositivos. (Sí es válido como *pista* de
  UX para deshabilitar el botón, pero **la verdad la decide el servidor**.)
- ❌ **No** confiar en el cache existente como control de cuota: el cache
  (`app/lib/cachePresentacion.ts`) está keyado por `carrera|materia|unidad|tema|modelo` y es
  **efímero en Vercel** (`/tmp`). Sirve para *no repagar la misma unidad*, no para *limitar a
  un docente*.

## 3. Dónde debe vivir la validación (punto único)

El único punto de enforcement correcto es el **Route Handler de servidor**:
[`app/api/presentacion/route.ts`](app/api/presentacion/route.ts).

La API key ya vive solo ahí, así que es el único lugar donde el cliente no puede saltarse la
lógica. La cuota debe verificarse **antes** de invocar a Claude:

```
POST /api/presentacion
  1. Autenticar docente            -> identidad (hoy inexistente)
  2. Resolver materia              -> ya se recibe `materia`
  3. ¿materia asignada al docente? -> autorización
  4. Leer contador del mes (docente, materia)
  5. Si contador >= 1  -> 429 "limite_mensual_alcanzado" (el cliente cae al determinista)
  6. Generar con IA (como hoy)
  7. Registrar generación (historial) e incrementar contador (atómico)
```

> Nota: el incremento del contador debe ser **transaccional/atómico** para evitar que dos
> solicitudes concurrentes del mismo docente consuman ambas la única cuota.

## 4. Modelo de datos futuro (para conectar después)

Hoy **no hay usuarios ni base de datos**. La regla queda preparada para conectar a:

| Entidad | Campos mínimos | Propósito |
|---|---|---|
| `docente` | id, nombre, email/credencial | Identidad y autenticación. |
| `materia_asignada` | docente_id, materia, carrera (PN/MN), semestre | Autorización (qué materias puede generar). |
| `contador_mensual` | docente_id, materia, periodo (`YYYY-MM`), usados | Cuota; clave única `(docente_id, materia, periodo)`. |
| `historial_generacion` | id, docente_id, materia, unidad, tema, modelo, tokens/costo, timestamp | Trazabilidad, auditoría de costo, soporte. |

El **bloqueo automático** se deriva de `contador_mensual.usados >= 1` para el `periodo` actual.

## 5. Costura de migración (cómo llegar ahí sin reescribir)

1. **Persistencia primero:** sustituir el cache en `/tmp` por almacenamiento persistente
   (Vercel KV/Postgres/Blob o Redis). Mismo patrón de `leerCache`/`escribirCache`, otro backend.
2. **Identidad:** añadir autenticación de docente (middleware) y pasar `docenteId` al endpoint.
3. **Cuota:** tabla `contador_mensual` + chequeo en el paso 4-7 de §3. El cliente ya maneja el
   *fallback* cuando el endpoint no devuelve `200`, así que un `429` encaja sin romper la UX
   (cae al generador determinista). Conviene un mensaje claro: "Ya usaste tu presentación IA de
   {materia} este mes".
4. **Historial/costo:** registrar cada llamada para dimensionar gasto antes de abrir a usuarios.

## 6. Relación con la auditoría

Esto cierra los riesgos "endpoint de IA sin auth ni rate-limit" y "cache efímero" señalados en
[`AUDITORIA_PROYECTO.md`](AUDITORIA_PROYECTO.md) §4–§5. La cuota mensual es, de hecho, el
mecanismo de control de costo de IA que la auditoría marca como bloqueante de liberación pública.
