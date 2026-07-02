-- Tabla sugerida para cargar el CSV de actividades de Supervisión Comunicación.
-- Esta tabla es opcional para producción. El visor de prueba usa comunicacion/data/actividades.js.
CREATE TABLE IF NOT EXISTS public.supervision_comunicacion_actividades (
    id integer,
    tipo text,
    nro_cic text,
    lote text,
    distrito text,
    sector text,
    descripcion text,
    fecha text,
    hora text,
    asistio text,
    enviado text,
    forma_envio text,
    responsable_ign_fi text,
    observacion text,
    creado_en timestamp without time zone DEFAULT now()
);

-- Ejemplo de COPY desde servidor PostgreSQL:
-- COPY public.supervision_comunicacion_actividades
-- (id, tipo, nro_cic, lote, distrito, sector, descripcion, fecha, hora, asistio, enviado, forma_envio, responsable_ign_fi, observacion)
-- FROM '/ruta/Supervision_Comunicacion(Actividades).csv'
-- WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
