// Datos del problema de programación lineal
const datosOptimizacion = {
  empresa: "TechNova",
  titulo:
    "Optimización de Costos y Conocimientos en la Contratación de Diseñadores para una Startup",
  contexto: {
    descripcion_completa:
      "En el entorno actual de la industria creativa, las empresas emergentes deben equilibrar la calidad de sus servicios con la sostenibilidad económica. La correcta gestión del talento humano se convierte en un factor clave para garantizar la eficiencia, innovación y competitividad frente a un mercado cada vez más exigente. Este estudio presenta el diseño y aplicación de un modelo de optimización lineal orientado a determinar la combinación más conveniente de contratación de diseñadores para un startup creativo.",
    descripcion:
      "La empresa TechNova, dedicada al diseño visual y multimedia, busca conformar un equipo de tres diseñadores para una nueva campaña. La dirección puede contratar diseñadores junior (más económicos) y diseñadores senior (más experimentados). Cada diseñador junior tiene un costo mensual de $2.000 y domina tres tecnologías, mientras que un diseñador senior cuesta $3.000 y domina siete tecnologías. La empresa necesita cubrir al menos diez tecnologías en total, garantizando un equipo de tres o más personas, minimizando el costo total de contratación.",
    tipos_de_disenadores: {
      junior: {
        costo: 2000,
        tecnologias: 3,
        descripcion: "Más económicos, dominan 3 tecnologías",
      },
      senior: {
        costo: 3000,
        tecnologias: 7,
        descripcion: "Más experimentados, dominan 7 tecnologías",
      },
    },
    requerimientos: {
      tecnologias_minimas: 10,
      tamano_minimo_equipo: 3,
    },
  },
  modelo_matematico: {
    variables_de_decision: {
      x: "Número de diseñadores junior a contratar",
      y: "Número de diseñadores senior a contratar",
    },
    funcion_objetivo: "Minimizar Z = 2000x + 3000y",
    restricciones: [
      "3x + 7y ≥ 10 (cobertura tecnológica mínima)",
      "x + y ≥ 3 (tamaño mínimo del equipo)",
      "x ≥ 0, y ≥ 0 (no negatividad)",
    ],
  },
  resultados: {
    solucion_continua: {
      x: 2.77,
      y: 0.23,
      costo_minimo_teorico: 6230,
      descripcion:
        "Solución óptima continua obtenida mediante el Método Simplex",
    },
    soluciones_enteras: [
      {
        combinacion: "2 junior, 1 senior",
        junior: 2,
        senior: 1,
        total_disenadores: 3,
        tecnologias: 13,
        costo: 7000,
        factible: true,
        recomendada: true,
        nota: "Mejor equilibrio entre economía, capacidad técnica y tamaño del equipo",
      },
      {
        combinacion: "3 junior, 1 senior",
        junior: 3,
        senior: 1,
        total_disenadores: 4,
        tecnologias: 16,
        costo: 9000,
        factible: true,
        recomendada: false,
        nota: "Mayor capacidad operativa pero costo más elevado",
      },
      {
        combinacion: "1 junior, 2 senior",
        junior: 1,
        senior: 2,
        total_disenadores: 3,
        tecnologias: 17,
        costo: 8000,
        factible: true,
        recomendada: false,
        nota: "Mayor experiencia técnica pero costo intermedio",
      },
      {
        combinacion: "4 junior, 0 senior",
        junior: 4,
        senior: 0,
        total_disenadores: 4,
        tecnologias: 12,
        costo: 8000,
        factible: true,
        recomendada: false,
        nota: "Sin liderazgo senior",
      },
      {
        combinacion: "0 junior, 3 senior",
        junior: 0,
        senior: 3,
        total_disenadores: 3,
        tecnologias: 21,
        costo: 9000,
        factible: true,
        recomendada: false,
        nota: "Máxima experiencia pero costo más alto",
      },
    ],
  },
  analisis_de_sensibilidad: [
    {
      escenario: "Aumento del costo del diseñador senior",
      nuevo_costo_senior: 3500,
      nueva_funcion_objetivo: "Z = 2000x + 3500y",
      solucion: {
        x: 3,
        y: 0,
        costo: 6000,
        tecnologias: 9,
        factible: false,
      },
      efecto:
        "Favorece la contratación de juniors, pero no cumple la restricción tecnológica.",
    },
    {
      escenario: "Aumento del requerimiento tecnológico",
      nueva_restriccion: "3x + 7y ≥ 12",
      solucion: {
        x: 2,
        y: 1,
        costo: 7000,
        tecnologias: 13,
        factible: true,
      },
      efecto: "Se mantiene la misma combinación óptima.",
    },
  ],
  resumen_sensibilidad: [
    {
      parametro: "Costo Senior",
      cambio: "+$500",
      efecto: "Favorece más juniors",
      sigue_factible: true,
    },
    {
      parametro: "Tecnologías",
      cambio: "+2",
      efecto: "Sin cambios en la solución",
      sigue_factible: true,
    },
    {
      parametro: "Tamaño del equipo",
      cambio: "+1",
      efecto: "Aumenta el costo",
      sigue_factible: true,
    },
  ],
  conclusiones: {
    modelo_optimizacion:
      "El modelo de optimización lineal permitió identificar la combinación óptima de contratación para minimizar costos cumpliendo con las restricciones establecidas.",
    solucion_optima:
      "La solución (2 diseñadores junior, 1 diseñador senior) presenta el mejor equilibrio entre economía, capacidad técnica y tamaño del equipo.",
    analisis_sensibilidad:
      "El análisis de sensibilidad evidencia que el modelo es robusto ante cambios moderados en los costos o requerimientos tecnológicos.",
    utilidad_practica:
      "La incorporación del dashboard permite una comprensión visual de los resultados, demostrando la utilidad de la Investigación de Operaciones en contextos reales del sector creativo.",
  },
  recomendaciones: [
    "Implementar la combinación (2 junior, 1 senior): Esta configuración cumple con los requisitos técnicos y humanos al menor costo posible. Se sugiere adoptarla como base para la conformación del equipo inicial del proyecto.",
    "Evaluar la carga laboral y el tipo de proyecto: Si en el futuro se enfrentan proyectos más complejos o de mayor volumen, podría considerarse aumentar a (3 junior, 1 senior) para incrementar la capacidad operativa sin comprometer la dirección técnica.",
    "Monitorear desempeño y ajustar proporciones: Se recomienda revisar periódicamente el rendimiento del equipo, ya que variaciones en costos, experiencia o herramientas dominadas pueden modificar la combinación óptima.",
    "Explorar soluciones mixtas o parciales: Si la empresa trabaja con freelancers o contrataciones por horas, se podrían aproximar los valores fraccionarios del modelo (x=2.77, y=0.23) mediante contratos parciales, optimizando aún más los recursos.",
  ],
};
