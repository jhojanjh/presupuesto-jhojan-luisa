import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Check,
  Plus,
  PieChart,
  Download,
  Trash2,
  CreditCard,
  Home,
  Wifi,
  Car,
  BarChart3,
  X,
  Edit,
  Save
} from 'lucide-react';

// BACKEND
const API_URL = "https://budget-api-dt5y.onrender.com/api/budget/main";

const BudgetTracker = () => {
  const [gastos, setGastos] = useState([]);
  const [aportes, setAportes] = useState([]);

  const [vistaActual, setVistaActual] = useState("dashboard");
  const [mesSeleccionado, setMesSeleccionado] = useState("Todos");
  const [nuevoAporte, setNuevoAporte] = useState({ persona: "Jhojan", monto: "", mes: "Diciembre" });
  const [mensajeExito, setMensajeExito] = useState("");
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // 🔵 NUEVO: estado para abrir/cerrar modal de nuevo gasto
  const [modalGasto, setModalGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: "",
    categoria: "Servicios",
    monto: "",
    mes: "Diciembre",
    recurrente: false
  });

  // ==============================
  // CARGAR DATOS DEL BACKEND
  // ==============================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error cargando datos");

        const data = await res.json();
        setGastos(data.gastos || []);
        setAportes(data.aportes || []);
      } catch (err) {
        setError("No se pudieron cargar los datos del servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // ===========================================
  // AUTO-GUARDADO AL BACKEND (PUT)
  // ===========================================
  useEffect(() => {
    if (cargando) return;

    const timeout = setTimeout(async () => {
      try {
        setGuardando(true);
        await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gastos, aportes })
        });
      } catch (err) {
        setError("No se pudieron guardar los cambios.");
      } finally {
        setGuardando(false);
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [gastos, aportes, cargando]);

  // ===========================================
  // CÁLCULOS
  // ===========================================
  const calculos = useMemo(() => {
    const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
    const gastosPagados = gastos.filter(g => g.pagado).reduce((s, g) => s + g.monto, 0);
    const totalAportes = aportes.reduce((s, a) => s + a.monto, 0);

    const aportesPorPersona = {
      "Jhojan": aportes.filter(a => a.persona === "Jhojan").reduce((s, a) => s + a.monto, 0),
      "Luisa ❤️": aportes.filter(a => a.persona === "Luisa ❤️").reduce((s, a) => s + a.monto, 0)
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      "Jhojan": aportesPorPersona["Jhojan"] - mitadGastos,
      "Luisa ❤️": aportesPorPersona["Luisa ❤️"] - mitadGastos
    };

    const gastosPorCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
      return acc;
    }, {});

    return {
      totalGastos,
      gastosPagados,
      totalAportes,
      mitadGastos,
      saldoDisponible: totalAportes - gastosPagados,
      aportesPorPersona,
      balance,
      gastosPorCategoria
    };
  }, [gastos, aportes]);

  // utilidad para $
  const formatMoney = n => "$" + n.toLocaleString("es-CO");

  // FILTRO
  const gastosFiltrados = mesSeleccionado === "Todos"
    ? gastos
    : gastos.filter(g => g.mes === mesSeleccionado);

  // CATEGORÍAS E ICONOS
  const categoriaIcons = {
    "Arriendo": <Home size={18} />,
    "Servicios": <Wifi size={18} />,
    "Transporte": <Car size={18} />,
    "Tarjetas": <CreditCard size={18} />
  };

  const categorias = ["Arriendo", "Servicios", "Transporte", "Tarjetas"];
  const meses = ["Diciembre", "Enero", "Febrero"];

  // ===========================================
  // EVENTOS: marcar pagado
  // ===========================================
  const togglePago = id => {
    setGastos(prev =>
      prev.map(g => g.id === id ? { ...g, pagado: !g.pagado } : g)
    );
  };

  // ===========================================
  // EVENTOS: eliminar gasto
  // ===========================================
  const eliminarGasto = id => {
    if (window.confirm("¿Seguro que quieres eliminar este gasto?")) {
      setGastos(prev => prev.filter(g => g.id !== id));
      mostrarMsg("🗑️ Gasto eliminado");
    }
  };

  // ===========================================
  // EVENTOS: eliminar aporte
  // ===========================================
  const eliminarAporte = id => {
    if (window.confirm("¿Seguro que quieres eliminar este aporte?")) {
      setAportes(prev => prev.filter(a => a.id !== id));
      mostrarMsg("🗑️ Aporte eliminado");
    }
  };

  // ===========================================
  // MODAL: guardar nuevo gasto
  // ===========================================
  const guardarNuevoGasto = () => {
    const monto = parseFloat(nuevoGasto.monto);

    if (!nuevoGasto.nombre || !monto || monto <= 0) {
      alert("Completa los campos correctamente");
      return;
    }

    setGastos(prev => [
      ...prev,
      {
        id: Date.now(),
        ...nuevoGasto,
        monto,
        pagado: false
      }
    ]);

    // limpiar modal
    setNuevoGasto({
      nombre: "",
      categoria: "Servicios",
      monto: "",
      mes: "Diciembre",
      recurrente: false
    });

    setModalGasto(false);
    mostrarMsg("✅ Gasto agregado");
  };

  // ===========================================
  // EVENTOS: mostrar mensajes pequeños arriba
  // ===========================================
  const mostrarMsg = msg => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(""), 3000);
  };

  // ===========================================
  // AGREGAR APORTE
  // ===========================================
  const agregarAporte = () => {
    const monto = parseFloat(nuevoAporte.monto);
    if (!monto || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    setAportes(prev => [
      ...prev,
      {
        id: Date.now(),
        persona: nuevoAporte.persona,
        mes: nuevoAporte.mes,
        monto
      }
    ]);

    setNuevoAporte({ persona: "Jhojan", monto: "", mes: "Diciembre" });
    mostrarMsg("Aporte agregado");
  };

  // ===========================================
  // LIMPIAR TODO
  // ===========================================
  const limpiarDatos = () => {
    if (window.confirm("¿Seguro que deseas limpiar todo?")) {
      setGastos([]);
      setAportes([]);
      mostrarMsg("Datos limpiados");
    }
  };

  // ===========================================
  // EXPORTAR
  // ===========================================
  const exportar = () => {
    const data = {
      gastos,
      aportes,
      fecha: new Date().toISOString(),
      totales: calculos
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `presupuesto-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  if (cargando) return <p>Cargando datos...</p>;

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="header">
        <h1>Control de Presupuesto Compartido</h1>
        <p className="header-subtitle">Diciembre 2024 - Febrero 2025</p>

        {mensajeExito && <div className="message-success">{mensajeExito}</div>}
        {error && <div className="message-error">{error}</div>}

        <div className="action-buttons">
          <button className="btn btn-export" onClick={exportar}>
            <Download size={18} /> Exportar
          </button>

          <button className="btn btn-clear" onClick={limpiarDatos}>
            <Trash2 size={18} /> Limpiar
          </button>
        </div>

        {guardando && <p className="saving-indicator">Guardando cambios...</p>}
      </div>

      {/* NAVEGACIÓN */}
      <div className="nav-container">
        <button className={`nav-btn ${vistaActual === "dashboard" ? "active" : ""}`} onClick={() => setVistaActual("dashboard")}>
          <BarChart3 size={18} /> Dashboard
        </button>

        <button className={`nav-btn ${vistaActual === "gastos" ? "active" : ""}`} onClick={() => setVistaActual("gastos")}>
          <DollarSign size={18} /> Gastos
        </button>

        <button className={`nav-btn ${vistaActual === "aportes" ? "active" : ""}`} onClick={() => setVistaActual("aportes")}>
          <TrendingUp size={18} /> Aportes
        </button>
      </div>

      {/* =============================================
         DASHBOARD
      ============================================= */}
      {vistaActual === "dashboard" && (
        <>
          <div className="stats-grid">

            <div className="card stat-card">
              <div className="stat-item">
                <div className="stat-header">
                  <span>Total Gastos</span>
                  <div className="stat-icon bg-blue-500"><DollarSign size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalGastos)}</div>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-item">
                <div className="stat-header">
                  <span>Total Aportado</span>
                  <div className="stat-icon bg-green-500"><TrendingUp size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalAportes)}</div>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-item">
                <div className="stat-header">
                  <span>Pagado</span>
                  <div className="stat-icon bg-emerald-500"><Check size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.gastosPagados)}</div>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-item">
                <div className="stat-header">
                  <span>Saldo</span>
                  <div className="stat-icon bg-purple-500"><PieChart size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.saldoDisponible)}</div>
              </div>
            </div>

          </div>

          {/* BALANCE */}
          <div className="balance-grid">
            {["Jhojan", "Luisa ❤️"].map(persona => (
              <div className="card" key={persona}>
                <div className="balance-header">
                  <div className={`balance-avatar ${persona === "Jhojan" ? "purple" : "pink"}`}>
                    <Users size={24} />
                  </div>
                  <div className="balance-info">
                    <h3>{persona}</h3>
                    <p>Balance personal</p>
                  </div>
                </div>

                <div className="balance-details">
                  <div className="balance-row">
                    <span>Aportado:</span>
                    <span className="green">{formatMoney(calculos.aportesPorPersona[persona])}</span>
                  </div>

                  <div className="balance-row">
                    <span>Tu parte (50%):</span>
                    <span>{formatMoney(calculos.mitadGastos)}</span>
                  </div>

                  <div className="balance-total">
                    <div className="balance-total-row">
                      <span>Balance:</span>
                      <span className={`balance-total-amount ${calculos.balance[persona] >= 0 ? "positive" : "negative"}`}>
                        {formatMoney(Math.abs(calculos.balance[persona]))}
                      </span>
                    </div>

                    <p className="balance-note">
                      {calculos.balance[persona] > 0
                        ? "Te deben dinero"
                        : calculos.balance[persona] < 0
                        ? "Debes dinero"
                        : "Estás al día"}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* GASTOS POR CATEGORÍA */}
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>
              <PieChart size={20} /> Gastos por Categoría
            </h3>

            {Object.entries(calculos.gastosPorCategoria).map(([cat, monto]) => {
              const porcentaje = calculos.totalGastos ? (monto / calculos.totalGastos * 100).toFixed(1) : 0;

              return (
                <div className="category-item" key={cat}>
                  <div className="category-header">
                    <div className="category-info">
                      {categoriaIcons[cat]}
                      <span>{cat}</span>
                    </div>

                    <div>
                      <div>{formatMoney(monto)}</div>
                      <div className="category-percentage">{porcentaje}%</div>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
                  </div>
                </div>
              );
            })}

          </div>
        </>
      )}

      {/* =============================================
         GASTOS
      ============================================= */}
      {vistaActual === "gastos" && (
        <>
          <div className="card">
            <div className="filters">
              <span>Filtrar por mes:</span>
              <div className="filter-buttons">
                {["Todos", ...meses].map(mes => (
                  <button
                    key={mes}
                    className={`filter-btn ${mesSeleccionado === mes ? "active" : ""}`}
                    onClick={() => setMesSeleccionado(mes)}
                  >
                    {mes}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTÓN PARA ABRIR EL MODAL */}
          <button className="new-gasto-btn" onClick={() => setModalGasto(true)}>
            <Plus size={18} /> Agregar Gasto
          </button>

          <div className="expense-list">
            {gastosFiltrados.map(g => (
              <div key={g.id} className={`expense-item ${g.pagado ? "paid" : ""}`}>

                {/* MODO EDICIÓN */}
                {editandoGasto === g.id ? (
                  <div style={{ width: "100%" }}>
                    <div className="edit-form-grid">

                      <div>
                        <label>Nombre</label>
                        <input
                          className="form-input"
                          value={gastoEditado.nombre}
                          onChange={e => setGastoEditado(prev => ({ ...prev, nombre: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label>Monto</label>
                        <input
                          type="number"
                          className="form-input"
                          value={gastoEditado.monto}
                          onChange={e => setGastoEditado(prev => ({ ...prev, monto: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label>Categoría</label>
                        <select
                          className="form-input"
                          value={gastoEditado.categoria}
                          onChange={e => setGastoEditado(prev => ({ ...prev, categoria: e.target.value }))}
                        >
                          {categorias.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label>Mes</label>
                        <select
                          className="form-input"
                          value={gastoEditado.mes}
                          onChange={e => setGastoEditado(prev => ({ ...prev, mes: e.target.value }))}
                        >
                          {meses.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>

                      <button className="btn-add" onClick={() => {
                        setGastos(prev => prev.map(x => x.id === editandoGasto
                          ? { ...gastoEditado, monto: parseFloat(gastoEditado.monto) }
                          : x
                        ));
                        setEditandoGasto(null);
                        mostrarMsg("Gasto actualizado");
                      }}>
                        <Save size={14} /> Guardar
                      </button>

                      <button className="btn-cancel" onClick={() => setEditandoGasto(null)}>
                        <X size={14} /> Cancelar
                      </button>

                    </div>
                  </div>

                ) : (
                  <>
                    {/* MODO VIEW */}
                    <div className="expense-info">
                      <div className={`expense-category`}></div>

                      <div className="expense-details">
                        <h4>{g.nombre}</h4>
                        <div className="expense-meta">
                          {g.categoria} • {g.mes}
                          {g.recurrente && <span className="expense-recurrent"> 🔄 Recurrente</span>}
                        </div>
                      </div>
                    </div>

                    <div className="expense-actions">
                      <span className="expense-amount">{formatMoney(g.monto)}</span>

                      <button
                        className={g.pagado ? "btn-mark-unpaid" : "btn-mark-paid"}
                        onClick={() => togglePago(g.id)}
                      >
                        {g.pagado ? "❌ No pagado" : "✅ Pagado"}
                      </button>

                      <button className="btn-edit" onClick={() => {
                        setEditandoGasto(g.id);
                        setGastoEditado(g);
                      }}>
                        <Edit size={14} />
                      </button>

                      <button className="btn-delete" onClick={() => eliminarGasto(g.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        </>
      )}

      {/* =============================================
         APORTES
      ============================================= */}
      {vistaActual === "aportes" && (
        <>
          <div className="card contribution-form">
            <h3>Registrar Aporte</h3>

            <div className="form-grid">

              <select
                className="form-input"
                value={nuevoAporte.persona}
                onChange={e => setNuevoAporte({ ...nuevoAporte, persona: e.target.value })}
              >
                <option>Jhojan</option>
                <option>Luisa ❤️</option>
              </select>

              <input
                className="form-input"
                type="number"
                placeholder="Monto"
                value={nuevoAporte.monto}
                onChange={e => setNuevoAporte({ ...nuevoAporte, monto: e.target.value })}
              />

              <select
                className="form-input"
                value={nuevoAporte.mes}
                onChange={e => setNuevoAporte({ ...nuevoAporte, mes: e.target.value })}
              >
                {meses.map(m => <option key={m}>{m}</option>)}
              </select>

              <button className="btn-add" onClick={agregarAporte}>
                <Plus size={18} /> Agregar
              </button>

            </div>
          </div>

          <div className="card">
            <h3>Historial de Aportes</h3>

            <div className="contribution-list">
              {aportes.map(a => (
                <div key={a.id} className="contribution-item">

                  <div className="contribution-person">
                    <div className={`person-avatar ${a.persona === "Jhojan" ? "purple" : "pink"}`}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h4>{a.persona}</h4>
                      <p>{a.mes}</p>
                    </div>
                  </div>

                  <div className="contribution-actions">
                    <span className="contribution-amount">{formatMoney(a.monto)}</span>
                    <button className="btn-contribution-delete" onClick={() => eliminarAporte(a.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}

              {aportes.length === 0 && <div className="empty-state">No hay aportes registrados.</div>}
            </div>
          </div>

        </>
      )}

      {/* =============================================
         MODAL NUEVO GASTO
      ============================================= */}
      {modalGasto && (
        <>
          <div className="modal-overlay" onClick={() => setModalGasto(false)}></div>

          <div className="modal">
            <div className="modal-header">
              <h2>Nuevo Gasto</h2>
              <button className="modal-close" onClick={() => setModalGasto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">

              <label>Nombre</label>
              <input
                className="form-input"
                value={nuevoGasto.nombre}
                onChange={e => setNuevoGasto({ ...nuevoGasto, nombre: e.target.value })}
              />

              <label>Monto</label>
              <input
                className="form-input"
                type="number"
                value={nuevoGasto.monto}
                onChange={e => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
              />

              <label>Categoría</label>
              <select
                className="form-input"
                value={nuevoGasto.categoria}
                onChange={e => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })}
              >
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>

              <label>Mes</label>
              <select
                className="form-input"
                value={nuevoGasto.mes}
                onChange={e => setNuevoGasto({ ...nuevoGasto, mes: e.target.value })}
              >
                {meses.map(m => <option key={m}>{m}</option>)}
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={nuevoGasto.recurrente}
                  onChange={e => setNuevoGasto({ ...nuevoGasto, recurrente: e.target.checked })}
                />
                Recurrente
              </label>

            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModalGasto(false)}>Cancelar</button>

              <button className="btn-add" onClick={guardarNuevoGasto}>
                <Save size={16} /> Guardar
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default BudgetTracker;
