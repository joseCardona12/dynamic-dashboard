// Variables globales
let currentSlide = 1;
const totalSlides = 11;
let charts = {};

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar navegación
  initNavigation();

  // Cargar datos
  cargarContexto();
  cargarDatos();
  cargarTablaSoluciones();
  cargarConclusiones();
  cargarRecomendaciones();

  // Crear gráficos (se crearán cuando se navegue a esas slides)
  setTimeout(() => {
    crearGraficoRegionFactible();
    crearGraficoComparacion();
  }, 500);

  // Event listener para exportar PDF
  document
    .getElementById("btn-export-pdf")
    .addEventListener("click", exportarPDF);
});

// Inicializar navegación
function initNavigation() {
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  btnPrev.addEventListener("click", () => navigateSlide(-1));
  btnNext.addEventListener("click", () => navigateSlide(1));

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") navigateSlide(-1);
    if (e.key === "ArrowRight") navigateSlide(1);
  });

  updateNavigation();
}

// Navegar entre slides
function navigateSlide(direction) {
  const newSlide = currentSlide + direction;
  if (newSlide < 1 || newSlide > totalSlides) return;

  // Ocultar slide actual
  document.getElementById(`slide-${currentSlide}`).classList.remove("active");

  // Mostrar nuevo slide
  currentSlide = newSlide;
  document.getElementById(`slide-${currentSlide}`).classList.add("active");

  updateNavigation();
}

// Actualizar controles de navegación
function updateNavigation() {
  document.getElementById("current-slide").textContent = currentSlide;
  document.getElementById("total-slides").textContent = totalSlides;

  // Deshabilitar botones en los extremos
  document.getElementById("btn-prev").disabled = currentSlide === 1;
  document.getElementById("btn-next").disabled = currentSlide === totalSlides;

  // Actualizar barra de progreso
  const progress = (currentSlide / totalSlides) * 100;
  document.getElementById("progress-fill").style.width = `${progress}%`;
}

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
  document.getElementById(
    "equipoOptimo"
  ).textContent = `${solucionOptima.junior} Junior + ${solucionOptima.senior} Senior`;
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
function crearGraficoRegionFactible() {
  const ctx = document.getElementById("regionFactibleChart").getContext("2d");

  // Generar puntos de la región factible
  const regionPoints = [];
  for (let x = 0; x <= 6; x += 0.1) {
    for (let y = 0; y <= 6; y += 0.1) {
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

  // Región factible
  datasets.push({
    label: "Región Factible",
    data: regionPoints,
    backgroundColor: "rgba(102, 126, 234, 0.3)",
    borderColor: "rgba(102, 126, 234, 0.5)",
    pointRadius: 1,
    showLine: false,
  });

  // Solución óptima
  const optima = soluciones.find((s) => s.recomendada);
  datasets.push({
    label: "Solución Óptima",
    data: [{ x: optima.x, y: optima.y }],
    backgroundColor: "#43e97b",
    borderColor: "#43e97b",
    pointRadius: 15,
    pointHoverRadius: 18,
  });

  // Otras soluciones
  datasets.push({
    label: "Otras Soluciones",
    data: soluciones
      .filter((s) => !s.recomendada)
      .map((s) => ({ x: s.x, y: s.y })),
    backgroundColor: "#ffa726",
    borderColor: "#ffa726",
    pointRadius: 10,
    pointHoverRadius: 12,
  });

  // Solución continua
  const continua = datosOptimizacion.resultados.solucion_continua;
  datasets.push({
    label: "Solución Continua",
    data: [{ x: continua.x, y: continua.y }],
    backgroundColor: "#f5576c",
    borderColor: "#f5576c",
    pointRadius: 12,
    pointHoverRadius: 15,
    pointStyle: "triangle",
  });

  charts.region = new Chart(ctx, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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
            font: { size: 16, weight: "bold" },
          },
          min: 0,
          max: 6,
        },
        y: {
          title: {
            display: true,
            text: "Diseñadores Senior (y)",
            font: { size: 16, weight: "bold" },
          },
          min: 0,
          max: 6,
        },
      },
    },
  });
}

// Gráfico de Comparación
function crearGraficoComparacion() {
  const ctx = document.getElementById("comparacionChart").getContext("2d");
  const soluciones = datosOptimizacion.resultados.soluciones_enteras;

  charts.comparacion = new Chart(ctx, {
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
            font: { size: 16, weight: "bold" },
          },
        },
        x: {
          title: {
            display: true,
            text: "Combinación de Diseñadores",
            font: { size: 16, weight: "bold" },
          },
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
                <td>${
                  s.recomendada
                    ? '<span class="table-badge recommended">⭐ Recomendada</span>'
                    : '<span class="table-badge success">Factible</span>'
                }</td>
            </tr>
        `;
    })
    .join("");
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

// Función para exportar a PDF
async function exportarPDF() {
  const button = document.getElementById("btn-export-pdf");
  button.textContent = "⏳ Generando PDF...";
  button.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("l", "mm", "a4"); // Landscape para slides
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Guardar slide actual
    const originalSlide = currentSlide;

    // Array de slides a capturar
    const slidesToCapture = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (let i = 0; i < slidesToCapture.length; i++) {
      const slideNum = slidesToCapture[i];

      // Navegar a la slide
      document
        .getElementById(`slide-${currentSlide}`)
        .classList.remove("active");
      currentSlide = slideNum;
      document.getElementById(`slide-${currentSlide}`).classList.add("active");

      // Esperar a que se renderice
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capturar la slide
      const slideElement = document.getElementById(`slide-${slideNum}`);
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Centrar verticalmente
      const yPosition = (pageHeight - imgHeight) / 2;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);

      // Actualizar progreso
      button.textContent = `⏳ Generando... ${i + 1}/${slidesToCapture.length}`;
    }

    // Restaurar slide original
    document.getElementById(`slide-${currentSlide}`).classList.remove("active");
    currentSlide = originalSlide;
    document.getElementById(`slide-${currentSlide}`).classList.add("active");
    updateNavigation();

    // Guardar PDF
    pdf.save("TechNova-Presentacion-Optimizacion.pdf");

    button.textContent = "✅ PDF Generado";
    setTimeout(() => {
      button.textContent = "📥 Descargar PDF";
      button.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Error al generar PDF:", error);
    button.textContent = "❌ Error";
    setTimeout(() => {
      button.textContent = "📥 Descargar PDF";
      button.disabled = false;
    }, 2000);
  }
}

console.log("📊 Presentación cargada correctamente");
