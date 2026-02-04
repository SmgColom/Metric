// src/lib/i18n.js

export const feibotI18n = {
  es: {
    // meta
    "code": "Código",
    "msg": "Mensaje",

    // race
    "race": "Carrera",
    "race.title": "Nombre de la carrera",
    "race.date_time": "Fecha y hora (Unix)",
    "race.id": "ID de carrera",

    // race.items (distancias/categorías)
    "race.items": "Categorías / Distancias",
    "race.items[].id": "ID de categoría",
    "race.items[].race_id": "ID de carrera",
    "race.items[].title": "Nombre de categoría",
    "race.items[].start_time": "Hora de salida (categoría)",
    "race.items[].distance": "Distancia (m)",
    "race.items[].timing": "Cronometraje",
    "race.items[].result": "Resultados",
    "race.items[].certificate": "Certificados",
    "race.items[].type": "Tipo",
    "race.items[].created_at": "Creado",
    "race.items[].updated_at": "Actualizado",

    // score_configs (configuración de puntos/controles)
    "race.score_configs": "Configuración de checkpoints",
    "race.score_configs[].id": "ID de checkpoint",
    "race.score_configs[].race_id": "ID de carrera",
    "race.score_configs[].title": "Nombre del checkpoint",
    "race.score_configs[].item_id": "Categoría asociada (item_id)",
    "race.score_configs[].score_type": "Tipo de checkpoint",
    "race.score_configs[].use_gun": "Usa hora disparo (Gun)",
    "race.score_configs[].gun_time": "Hora Gun",
    "race.score_configs[].gun_date": "Fecha Gun",
    "race.score_configs[].start_time_id": "ID salida base",
    "race.score_configs[].start_time": "Hora de inicio",
    "race.score_configs[].milli_sec": "Milisegundos",
    "race.score_configs[].mac": "Antenas / Dispositivos (MAC)",
    "race.score_configs[].sort": "Orden (ASC/DESC)",
    "race.score_configs[].openTime": "Apertura (seg)",
    "race.score_configs[].closeTime": "Cierre (seg)",
    "race.score_configs[].distance": "Distancia del punto (m)",
    "race.score_configs[].pass_num": "Número de pasos",
    "race.score_configs[].interval_m": "Intervalo (m)",
    "race.score_configs[].lap_num": "Vueltas (#)",
    "race.score_configs[].lap_m": "Metros por vuelta",
    "race.score_configs[].loop_start": "Inicio de loop",
    "race.score_configs[].loop_end": "Fin de loop",
    "race.score_configs[].must_pass": "Paso obligatorio",
    "race.score_configs[].motion_type": "Tipo de actividad",
    "race.score_configs[].fastest_speed": "Velocidad máxima",
    "race.score_configs[].list_sort": "Orden interno",
    "race.score_configs[].longitude": "Longitud",
    "race.score_configs[].latitude": "Latitud",
    "race.score_configs[].pre_score": "Checkpoint base (pre_score)",
    "race.score_configs[].live_broadcast": "En vivo",
    "race.score_configs[].auto_calculate": "Cálculo automático",
    "race.score_configs[].deleted_at": "Eliminado",
    "race.score_configs[].areas": "Áreas",
    "race.score_configs[].slice_time": "Tiempo por cortes",
    "race.score_configs[].team_loop": "Loop por equipo",

    // score_configs[].items (relación config<->categoría)
    "race.score_configs[].items": "Categorías del checkpoint",
    "race.score_configs[].items[].pivot.score_config_id": "ID config (pivot)",
    "race.score_configs[].items[].pivot.item_id": "ID categoría (pivot)",

    // item_check_points (mapa por categoría)
    "race.item_check_points": "Checkpoints por categoría",
    "race.item_check_points[].item_id": "ID categoría",
    "race.item_check_points[].title": "Categoría",
    "race.item_check_points[].all_distance": "Distancia total (m)",
    "race.item_check_points[].checkpoints": "Lista de checkpoints",
    "race.item_check_points[].checkpoints[].name": "Código checkpoint",
    "race.item_check_points[].checkpoints[].title": "Nombre checkpoint",
    "race.item_check_points[].checkpoints[].distance": "Distancia (m)",
    "race.item_check_points[].checkpoints[].lap_num": "Vueltas (#)",
    "race.item_check_points[].checkpoints[].lap_m": "Metros por vuelta",
    "race.item_check_points[].checkpoints[].lap_end": "Cierre de vuelta",

    // scores (resultados por corredor)
    "race.scores": "Resultados",
    "race.scores[].id": "ID resultado",
    "race.scores[].name": "Nombre",
    "race.scores[].sex": "Sexo",
    "race.scores[].city": "Ciudad",
    "race.scores[].country": "País",
    "race.scores[].team": "Equipo",
    "race.scores[].phone": "Teléfono",
    "race.scores[].email": "Email",
    "race.scores[].age": "Edad",
    "race.scores[].age_group": "Grupo de edad",
    "race.scores[].age_group_2": "Grupo de edad 2",
    "race.scores[].bib": "Dorsal",
    "race.scores[].epc": "Chip (EPC)",
    "race.scores[].id_card": "Documento",
    "race.scores[].item_id": "ID categoría",
    "race.scores[].item_name": "Categoría",
    "race.scores[].finisher": "Finalizó",
    "race.scores[].check_in": "Check-in",

    // tiempos / parciales
    "race.scores[].start_time": "Salida (neto)",
    "race.scores[].finish_time": "Hora de llegada",
    "race.scores[].total_score": "Tiempo oficial (Gun/Total)",
    "race.scores[].net_score": "Tiempo neto",
    "race.scores[].pace": "Ritmo",
    "race.scores[].diff": "Diferencia",

    // checkpoints típicos
    "race.scores[].cp1": "Parcial 1 (cp1)",
    "race.scores[].cp2": "Parcial 2 (cp2)",
    "race.scores[].cp3": "Parcial 3 (cp3)",
    "labels.total_score": "Tiempo final",

    // rankings
    "race.scores[].total_ranking": "Ranking general (oficial)",
    "race.scores[].net_ranking": "Ranking general (neto)",
    "race.scores[].item_total_ranking": "Ranking categoría (oficial)",
    "race.scores[].item_net_ranking": "Ranking categoría (neto)",
    "race.scores[].age_total_ranking": "Ranking edad (oficial)",
    "race.scores[].age_net_ranking": "Ranking edad (neto)",
    "race.scores[].age_2_total_ranking": "Ranking edad 2 (oficial)",
    "race.scores[].age_2_net_ranking": "Ranking edad 2 (neto)",

    // splits calculados
    "race.scores[].cp1_cp2": "Tiempo cp1 → cp2",
    "race.scores[].cp2_cp3": "Tiempo cp2 → cp3",
    "race.scores[].cp3_cp4": "Tiempo cp3 → cp4",

    // tri (si aplica)
    "race.scores[].net_swimming": "Natación (neto)",
    "race.scores[].net_t1": "Transición 1 (neto)",
    "race.scores[].net_bicycle": "Ciclismo (neto)",
    "race.scores[].net_t2": "Transición 2 (neto)",
    "race.scores[].net_running": "Running (neto)",

    // ==========================
    // ✅ ALIASES para UI (keys planas)
    // ==========================
    "bib": "Dorsal",
    "name": "Nombre",
    "sex": "Sexo",
    "gender": "Género",
    "city": "Ciudad",
    "country": "País",
    "team": "Equipo",
    "phone": "Teléfono",
    "email": "Email",
    "age": "Edad",
    "age_group": "Grupo de edad",
    "age_group2": "Grupo de edad 2",
    "age_group_2": "Grupo de edad 2",
    "epc": "Chip (EPC)",
    "id_card": "Documento",
    "item_id": "ID categoría",
    "item_name": "Categoría",
    "finisher": "Finalizó",
    "check_in": "Check-in",
    "start_time": "Salida (neto)",
    "finish_time": "Hora de llegada",
    "total_score": "Tiempo oficial (Gun/Total)",
    "net_score": "Tiempo neto",
    "pace": "Ritmo",
    "diff": "Diferencia",

    // ✅ Ranking calculado por nosotros
    "category_rank": "Posición en la categoría",

    // ✅ Encabezados de parciales (tabla runner)
    "split_point": "Punto",
    "split_distance": "Distancia",
    "split_time_total": "Tiempo",
    "split_time_lap": "Tiempo parcial",
    "split_pace": "Ritmo",
  },

  en: {
    "code": "Code",
    "msg": "Message",

    "race": "Race",
    "race.title": "Race name",
    "race.date_time": "Date & time (Unix)",
    "race.id": "Race ID",

    "race.items": "Categories / Distances",
    "race.items[].id": "Category ID",
    "race.items[].race_id": "Race ID",
    "race.items[].title": "Category name",
    "race.items[].start_time": "Start time (category)",
    "race.items[].distance": "Distance (m)",
    "race.items[].timing": "Timing",
    "race.items[].result": "Results",
    "race.items[].certificate": "Certificates",
    "race.items[].type": "Type",
    "race.items[].created_at": "Created at",
    "race.items[].updated_at": "Updated at",

    "race.score_configs": "Checkpoint configuration",
    "race.score_configs[].id": "Checkpoint ID",
    "race.score_configs[].race_id": "Race ID",
    "race.score_configs[].title": "Checkpoint name",
    "race.score_configs[].item_id": "Linked category (item_id)",
    "race.score_configs[].score_type": "Checkpoint type",
    "race.score_configs[].use_gun": "Use gun time",
    "race.score_configs[].gun_time": "Gun time",
    "race.score_configs[].gun_date": "Gun date",
    "race.score_configs[].start_time_id": "Base start time ID",
    "race.score_configs[].start_time": "Start time",
    "race.score_configs[].milli_sec": "Milliseconds",
    "race.score_configs[].mac": "Antennas / devices (MAC)",
    "race.score_configs[].sort": "Sort (ASC/DESC)",
    "race.score_configs[].openTime": "Open time (sec)",
    "race.score_configs[].closeTime": "Close time (sec)",
    "race.score_configs[].distance": "Checkpoint distance (m)",
    "race.score_configs[].pass_num": "Pass count",
    "race.score_configs[].interval_m": "Interval (m)",
    "race.score_configs[].lap_num": "Laps (#)",
    "race.score_configs[].lap_m": "Meters per lap",
    "race.score_configs[].loop_start": "Loop start",
    "race.score_configs[].loop_end": "Loop end",
    "race.score_configs[].must_pass": "Must pass",
    "race.score_configs[].motion_type": "Sport / motion type",
    "race.score_configs[].fastest_speed": "Max speed",
    "race.score_configs[].list_sort": "Internal sort",
    "race.score_configs[].longitude": "Longitude",
    "race.score_configs[].latitude": "Latitude",
    "race.score_configs[].pre_score": "Base checkpoint (pre_score)",
    "race.score_configs[].live_broadcast": "Live",
    "race.score_configs[].auto_calculate": "Auto calculate",
    "race.score_configs[].deleted_at": "Deleted at",
    "race.score_configs[].areas": "Areas",
    "race.score_configs[].slice_time": "Slice time",
    "race.score_configs[].team_loop": "Team loop",

    "race.score_configs[].items": "Checkpoint categories",
    "race.score_configs[].items[].pivot.score_config_id": "Config ID (pivot)",
    "race.score_configs[].items[].pivot.item_id": "Category ID (pivot)",

    "race.item_check_points": "Category checkpoints",
    "race.item_check_points[].item_id": "Category ID",
    "race.item_check_points[].title": "Category",
    "race.item_check_points[].all_distance": "Total distance (m)",
    "race.item_check_points[].checkpoints": "Checkpoint list",
    "race.item_check_points[].checkpoints[].name": "Checkpoint code",
    "race.item_check_points[].checkpoints[].title": "Checkpoint name",
    "race.item_check_points[].checkpoints[].distance": "Distance (m)",
    "race.item_check_points[].checkpoints[].lap_num": "Laps (#)",
    "race.item_check_points[].checkpoints[].lap_m": "Meters per lap",
    "race.item_check_points[].checkpoints[].lap_end": "Lap end mode",

    "race.scores": "Results",
    "race.scores[].id": "Result ID",
    "race.scores[].name": "Name",
    "race.scores[].sex": "Sex",
    "race.scores[].city": "City",
    "race.scores[].country": "Country",
    "race.scores[].team": "Team",
    "race.scores[].phone": "Phone",
    "race.scores[].email": "Email",
    "race.scores[].age": "Age",
    "race.scores[].age_group": "Age group",
    "race.scores[].age_group_2": "Age group 2",
    "race.scores[].bib": "Bib",
    "race.scores[].epc": "Chip (EPC)",
    "race.scores[].id_card": "ID card",
    "race.scores[].item_id": "Category ID",
    "race.scores[].item_name": "Category",
    "race.scores[].finisher": "Finisher",
    "race.scores[].check_in": "Check-in",

    "race.scores[].start_time": "Start (net)",
    "race.scores[].finish_time": "Finish time",
    "race.scores[].total_score": "Official time (gun/total)",
    "race.scores[].net_score": "Net time",
    "race.scores[].pace": "Pace",
    "race.scores[].diff": "Diff",

    "race.scores[].cp1": "Split 1 (cp1)",
    "race.scores[].cp2": "Split 2 (cp2)",
    "race.scores[].cp3": "Split 3 (cp3)",

    "race.scores[].total_ranking": "Overall rank (official)",
    "race.scores[].net_ranking": "Overall rank (net)",
    "race.scores[].item_total_ranking": "Category rank (official)",
    "race.scores[].item_net_ranking": "Category rank (net)",
    "race.scores[].age_total_ranking": "Age rank (official)",
    "race.scores[].age_net_ranking": "Age rank (net)",
    "race.scores[].age_2_total_ranking": "Age2 rank (official)",
    "race.scores[].age_2_net_ranking": "Age2 rank (net)",

    "race.scores[].cp1_cp2": "Time cp1 → cp2",
    "race.scores[].cp2_cp3": "Time cp2 → cp3",
    "race.scores[].cp3_cp4": "Time cp3 → cp4",

    "race.scores[].net_swimming": "Swim (net)",
    "race.scores[].net_t1": "Transition 1 (net)",
    "race.scores[].net_bicycle": "Bike (net)",
    "race.scores[].net_t2": "Transition 2 (net)",
    "race.scores[].net_running": "Run (net)",

    // ✅ ALIASES para UI (keys planas)
    "bib": "Bib",
    "name": "Name",
    "sex": "Sex",
    "gender": "Gender",
    "city": "City",
    "country": "Country",
    "team": "Team",
    "phone": "Phone",
    "email": "Email",
    "age": "Age",
    "age_group": "Age group",
    "age_group2": "Age group 2",
    "age_group_2": "Age group 2",
    "epc": "Chip (EPC)",
    "id_card": "ID card",
    "item_id": "Category ID",
    "item_name": "Category",
    "finisher": "Finisher",
    "check_in": "Check-in",
    "start_time": "Start (net)",
    "finish_time": "Finish time",
    "total_score": "Official time (gun/total)",
    "net_score": "Net time",
    "pace": "Pace",
    "diff": "Diff",

    "category_rank": "Category position",

    "split_point": "Point",
    "split_distance": "Distance",
    "split_time_total": "Time",
    "split_time_lap": "Split time",
    "split_pace": "Pace",
  },
};

export const scoreTypeLabel = {
  es: {
    start_time: "Salida",
    total_score: "Meta / Tiempo final",
    cp1: "Punto de control 1",
    cp2: "Punto de control 2",
    cp3: "Punto de control 3",
    cp4: "Punto de control 4",
    cp5: "Punto de control 5",
  },
  en: {
    start_time: "Start",
    total_score: "Finish / Final time",
    cp1: "Checkpoint 1",
    cp2: "Checkpoint 2",
    cp3: "Checkpoint 3",
    cp4: "Checkpoint 4",
    cp5: "Checkpoint 5",
  },
};

export const yesNo = {
  es: { 0: "No", 1: "Sí" },
  en: { 0: "No", 1: "Yes" },
};

export const sortLabel = {
  es: { ASC: "Ascendente", DESC: "Descendente" },
  en: { ASC: "Ascending", DESC: "Descending" },
};

/**
 * Traducción con fallback:
 * - si no existe "bib" busca "race.scores[].bib"
 * - si no existe "age_group2" busca "race.scores[].age_group_2"
 */
export function t(key, lang = "es") {
  const dict = feibotI18n?.[lang] ?? {};
  if (dict[key]) return dict[key];

  const fallbacks = [
    `race.scores[].${key}`,
    key === "age_group2" ? "race.scores[].age_group_2" : null,
    key === "age_group_2" ? "race.scores[].age_group_2" : null,
  ].filter(Boolean);

  for (const fb of fallbacks) {
    if (dict[fb]) return dict[fb];
  }

  return key;
}
