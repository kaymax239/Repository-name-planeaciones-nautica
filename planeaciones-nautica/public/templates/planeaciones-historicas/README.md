# Planeaciones históricas (acervo de referencia)

Repositorio **de solo almacenamiento** para planeaciones didácticas reales
elaboradas por docentes de la Escuela Náutica Mercante (FIDENA). Sirve como
**acervo de referencia**; hoy **no lo consume la aplicación** (ningún módulo lo
importa ni lo lee en tiempo de ejecución).

> ⚠️ Esta carpeta es un contenedor vacío a la espera de documentos. No mover,
> renombrar ni borrar archivos existentes del proyecto al poblarla.

## Estructura

```
planeaciones-historicas/
├── LMN/                  Licenciatura en Maquinista Naval
│   ├── Sem01/ … Sem08/
└── LPN/                  Licenciatura en Piloto Naval
    ├── Sem01/ … Sem08/
```

- `LMN` = Maquinista/Mecánico Naval · `LPN` = Piloto Naval.
- `SemNN` = semestre (01–08). Coloca cada planeación en la carpeta de su
  carrera y semestre.

## Convención de nombres sugerida

```
<CLAVE>_<MateriaCorta>_<Ciclo>_<Docente>.<ext>
```

Ejemplo: `ALG103_Algebra_2025A_PerezJ.pdf`

Formatos aceptados: `.pdf`, `.docx` (originales del docente). Conserva el
documento tal cual se recibió; no lo edites.

## Metadatos por documento

Para cada planeación añadida, registra una fila en la tabla de abajo (o un
archivo `.md` hermano con los mismos campos):

| Campo | Descripción |
|---|---|
| **Origen** | De dónde proviene el documento (docente, academia, dirección, etc.) |
| **Fecha de captura** | Fecha en que se incorporó al acervo (AAAA-MM-DD) |
| **Docente** | Autor de la planeación |
| **Carrera** | LMN o LPN |
| **Semestre** | 01–08 |
| **Materia** | Nombre y clave de la asignatura |
| **Ciclo escolar** | Periodo al que corresponde (p. ej. 2025A) |
| **Observaciones** | Notas, calidad del documento, faltantes, etc. |

### Registro de documentos

| Archivo | Origen | Fecha captura | Docente | Carrera | Semestre | Materia | Ciclo | Observaciones |
|---|---|---|---|---|---|---|---|---|
| _(vacío)_ | | | | | | | | |

## Propósito futuro

Una vez poblado, este acervo permitirá (en fases posteriores, aún no
implementadas):

1. Analizar la **estructura real** usada por los docentes.
2. Extraer **estrategias didácticas**.
3. Extraer **secuencias inicio–desarrollo–cierre**.
4. Extraer **instrumentos de evaluación**.
5. **Entrenar/afinar prompts académicos**.
6. Generar planeaciones con **estilo institucional**.
7. Generar **presentaciones alineadas a la práctica real**.

## Aviso de privacidad

Estos documentos pueden contener nombres de docentes y datos internos. No
publicar fuera del entorno autorizado del proyecto.
