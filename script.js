// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Cargar contexto
  cargarContexto();

  // Cargar datos
  cargarDatos();

  // Crear gráficos
  crearGraficoRegionFactible();
  crearGraficoComparacion();
  crearGraficoScatter();
  crearGraficoPie();
  crearGraficoSensibilidad();

  // Cargar tabla
  cargarTablaSoluciones();

  // Cargar insights
  cargarConclusiones();
  cargarRecomendaciones();

  // Event listeners
  document
    .getElementById("metricSelector")
    .addEventListener("change", actualizarGraficoComparacion);
  document
    .getElementById("tableSearch")
    .addEventListener("input", filtrarTabla);
  document
    .getElementById("btn-export")
    ?.addEventListener("click", exportarDatos);

  // Botones de control de región factible
  document.querySelectorAll(".btn-control").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".btn-control")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      crearGraficoRegionFactible(this.dataset.view);
    });
  });
});

// Cargar contexto
function cargarContexto() {
  const contextoElement = document.getElementById("contextoDescripcion");
  if (contextoElement) {
    contextoElement.textContent = datosOptimizacion.contexto.descripcion;
  }
}

// Cargar datos en KPIs
function cargarDatos() {
  const solucionOptima = datosOptimizacion.resultados.soluciones_enteras.find(
    (s) => s.recomendada
  );

  document.getElementById(
    "costoOptimo"
  ).textContent = `$${solucionOptima.costo.toLocaleString()}`;
  document.getElementById("tecnologias").textContent =
    solucionOptima.tecnologias;

  // Calcular eficiencia (tecnologías por cada $1000)
  const eficiencia = (
    (solucionOptima.tecnologias / solucionOptima.costo) *
    1000
  ).toFixed(0);
  document.getElementById("eficiencia").textContent = `${eficiencia}%`;
}

// Gráfico de Región Factible
function crearGraficoRegionFactible(view = "region") {
  const ctx = document.getElementById("regionFactibleChart").getContext("2d");

  // Destruir gráfico anterior si existe
  if (window.regionChart) {
    window.regionChart.destroy();
  }

  // Generar puntos de la región factible
  const regionPoints = [];
  for (let x = 0; x <= 6; x += 0.1) {
    for (let y = 0; y <= 6; y += 0.1) {
      // Verificar restricciones
      if (3 * x + 7 * y >= 10 && x + y >= 3) {
        regionPoints.push({ x: x, y: y });
      }
    }
  }

  // Puntos de soluciones
  const soluciones = datosOptimizacion.resultados.soluciones_enteras.map(
    (s) => {
      return {
        x: s.junior,
        y: s.senior,
        label: s.combinacion,
        recomendada: s.recomendada,
      };
    }
  );

  const datasets = [];

  if (view === "region") {
    datasets.push({
      label: "Región Factible",
      data: regionPoints,
      backgroundColor: "rgba(102, 126, 234, 0.3)",
      borderColor: "rgba(102, 126, 234, 0.5)",
      pointRadius: 1,
      showLine: false,
    });
  }

  // Solución óptima
  const optima = soluciones.find((s) => s.recomendada);
  datasets.push({
    label: "Solución Óptima",
    data: [{ x: optima.x, y: optima.y }],
    backgroundColor: "#43e97b",
    borderColor: "#43e97b",
    pointRadius: 12,
    pointHoverRadius: 15,
  });

  // Otras soluciones
  datasets.push({
    label: "Otras Soluciones",
    data: soluciones
      .filter((s) => !s.recomendada)
      .map((s) => ({ x: s.x, y: s.y })),
    backgroundColor: "#ffa726",
    borderColor: "#ffa726",
    pointRadius: 8,
    pointHoverRadius: 10,
  });

  // Solución continua
  const continua = datosOptimizacion.resultados.solucion_continua;
  datasets.push({
    label: "Solución Continua",
    data: [{ x: continua.x, y: continua.y }],
    backgroundColor: "#f5576c",
    borderColor: "#f5576c",
    pointRadius: 10,
    pointHoverRadius: 12,
    pointStyle: "triangle",
  });

  window.regionChart = new Chart(ctx, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Junior: ${context.parsed.x.toFixed(
                1
              )}, Senior: ${context.parsed.y.toFixed(1)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Diseñadores Junior (x)",
            font: { size: 14, weight: "bold" },
          },
          min: 0,
          max: 6,
        },
        y: {
          title: {
            display: true,
            text: "Diseñadores Senior (y)",
            font: { size: 14, weight: "bold" },
          },
          min: 0,
          max: 6,
        },
      },
    },
  });
}

// Gráfico de Comparación
let comparacionChart;
function crearGraficoComparacion() {
  const ctx = document.getElementById("comparacionChart").getContext("2d");
  const soluciones = datosOptimizacion.resultados.soluciones_enteras;

  comparacionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: soluciones.map((s) => s.combinacion),
      datasets: [
        {
          label: "Costo ($)",
          data: soluciones.map((s) => s.costo),
          backgroundColor: soluciones.map((s) =>
            s.recomendada ? "#43e97b" : "#667eea"
          ),
          borderColor: soluciones.map((s) =>
            s.recomendada ? "#43e97b" : "#667eea"
          ),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Costo: $${context.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Costo Total ($)",
          },
        },
      },
    },
  });
}

function actualizarGraficoComparacion() {
  const metrica = document.getElementById("metricSelector").value;
  const soluciones = datosOptimizacion.resultados.soluciones_enteras;

  let data, label;
  if (metrica === "costo") {
    data = soluciones.map((s) => s.costo);
    label = "Costo ($)";
  } else if (metrica === "tecnologias") {
    data = soluciones.map((s) => s.tecnologias);
    label = "Tecnologías";
  } else {
    data = soluciones.map((s) => ((s.tecnologias / s.costo) * 1000).toFixed(2));
    label = "Eficiencia (Tec/$1000)";
  }

  comparacionChart.data.datasets[0].data = data;
  comparacionChart.data.datasets[0].label = label;
  comparacionChart.options.scales.y.title.text = label;
  comparacionChart.update();
}

// Gráfico Scatter
function crearGraficoScatter() {
  const ctx = document.getElementById("scatterChart").getContext("2d");
  const soluciones = datosOptimizacion.resultados.soluciones_enteras;

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Soluciones",
          data: soluciones.map((s) => ({
            x: s.costo,
            y: s.tecnologias,
            r: s.recomendada ? 15 : 10,
          })),
          backgroundColor: soluciones.map((s) =>
            s.recomendada ? "#43e97b" : "#667eea"
          ),
          borderColor: soluciones.map((s) =>
            s.recomendada ? "#43e97b" : "#667eea"
          ),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Costo: $${context.parsed.x}, Tecnologías: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Costo ($)" },
          beginAtZero: true,
        },
        y: {
          title: { display: true, text: "Tecnologías" },
          beginAtZero: true,
        },
      },
    },
  });
}

// Gráfico de Pie
function crearGraficoPie() {
  const ctx = document.getElementById("pieChart").getContext("2d");
  const optima = datosOptimizacion.resultados.soluciones_enteras.find(
    (s) => s.recomendada
  );
  const match = optima.combinacion.match(/(\d+) junior, (\d+) senior/);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Junior", "Senior"],
      datasets: [
        {
          data: [parseInt(match[1]), parseInt(match[2])],
          backgroundColor: ["#667eea", "#43e97b"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Gráfico de Sensibilidad
function crearGraficoSensibilidad() {
  const ctx = document.getElementById("sensibilidadChart").getContext("2d");
  const sensibilidad = datosOptimizacion.resumen_sensibilidad;

  new Chart(ctx, {
    type: "radar",
    data: {
      labels: sensibilidad.map((s) => s.parametro),
      datasets: [
        {
          label: "Impacto",
          data: sensibilidad.map((s) => (s.sigue_factible ? 100 : 50)),
          backgroundColor: "rgba(102, 126, 234, 0.2)",
          borderColor: "#667eea",
          borderWidth: 2,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#667eea",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

// Cargar tabla de soluciones
function cargarTablaSoluciones() {
  const tbody = document.getElementById("tableBody");
  const soluciones = datosOptimizacion.resultados.soluciones_enteras;

  tbody.innerHTML = soluciones
    .map((s) => {
      return `
            <tr>
                <td><strong>${s.combinacion}</strong></td>
                <td>${s.junior}</td>
                <td>${s.senior}</td>
                <td>${s.total_disenadores}</td>
                <td>${s.tecnologias}</td>
                <td><strong>$${s.costo.toLocaleString()}</strong></td>
                <td><span class="table-badge ${
                  s.factible ? "success" : "danger"
                }">${s.factible ? "Sí" : "No"}</span></td>
                <td>${
                  s.recomendada
                    ? '<span class="table-badge recommended">⭐ Recomendada</span>'
                    : "-"
                }</td>
            </tr>
        `;
    })
    .join("");
}

// Filtrar tabla
function filtrarTabla() {
  const searchTerm = document.getElementById("tableSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Cargar conclusiones
function cargarConclusiones() {
  const conclusiones = datosOptimizacion.conclusiones;
  const container = document.getElementById("conclusiones");

  container.innerHTML = Object.values(conclusiones)
    .map((c) => `<div class="insight-item">${c}</div>`)
    .join("");
}

// Cargar recomendaciones
function cargarRecomendaciones() {
  const recomendaciones = datosOptimizacion.recomendaciones;
  const container = document.getElementById("recomendaciones");

  container.innerHTML = recomendaciones
    .map((r, i) => `<div class="insight-item">${i + 1}. ${r}</div>`)
    .join("");
}

// Exportar datos
function exportarDatos() {
  const dataStr = JSON.stringify(datosOptimizacion, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "optimizacion-technova.json";
  link.click();
}

console.log("📊 Dashboard de Optimización cargado correctamente");
