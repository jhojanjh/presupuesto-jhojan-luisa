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
  Save,
  Sun,
  Moon
} from 'lucide-react';

const API_URL = 'https://budget-api-dt5y.onrender.com/api/budget/main';

// ======= GASTOS INICIALES (fallback si el backend está vacío) =======
const GASTOS_INICIALES = [
  { id: 1, nombre: 'Arriendo', categoria: 'Arriendo', monto: 720000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 2, nombre: 'Arriendo', categoria: 'Arriendo', monto: 720000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 3, nombre: 'Arriendo', categoria: 'Arriendo', monto: 720000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 4, nombre: 'Internet LU', categoria: 'Servicios', monto: 100000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 5, nombre: 'Internet JN', categoria: 'Servicios', monto: 80000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 6, nombre: 'Luz', categoria: 'Servicios', monto: 380000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 7, nombre: 'Agua', categoria: 'Servicios', monto: 400000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 8, nombre: 'Celula', categoria: 'Servicios', monto: 285000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 9, nombre: 'Internet LU', categoria: 'Servicios', monto: 100000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 10, nombre: 'Internet JN', categoria: 'Servicios', monto: 80000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 11, nombre: 'Luz', categoria: 'Servicios', monto: 380000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 12, nombre: 'Agua', categoria: 'Servicios', monto: 400000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 13, nombre: 'Celula', categoria: 'Servicios', monto: 285000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 14, nombre: 'Internet LU', categoria: 'Servicios', monto: 100000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 15, nombre: 'Internet JN', categoria: 'Servicios', monto: 80000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 16, nombre: 'Luz', categoria: 'Servicios', monto: 380000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 17, nombre: 'Agua', categoria: 'Servicios', monto: 400000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 18, nombre: 'Celula', categoria: 'Servicios', monto: 285000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 19, nombre: 'Mercado', categoria: 'Mercado', monto: 467000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 20, nombre: 'Mercado', categoria: 'Mercado', monto: 467000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 21, nombre: 'Mercado', categoria: 'Mercado', monto: 466000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 22, nombre: 'Tarjeta de Crédito', categoria: 'Tarjetas', monto: 1580000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 23, nombre: 'ITO', categoria: 'Tarjetas', monto: 900000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 24, nombre: 'Moto - Baul', categoria: 'Moto', monto: 150000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 25, nombre: 'Moto - Aceite', categoria: 'Moto', monto: 150000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 26, nombre: 'Moto - Gasolina', categoria: 'Moto', monto: 150000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 27, nombre: 'Moto - Luces', categoria: 'Moto', monto: 100000, mes: 'Diciembre', pagado: false, unico: true },
  { id: 28, nombre: 'Moto - Otros', categoria: 'Moto', monto: 250000, mes: 'Diciembre', pagado: false, unico: true }
];

const BudgetTracker = () => {
  const [gastos, setGastos] = useState([]);
  const [aportes, setAportes] = useState([]);

  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mesSeleccionado, setMesSeleccionado] = useState('Todos');

  const [nuevoAporte, setNuevoAporte] = useState({
    persona: 'Jhojan',
    monto: '',
    mes: 'Diciembre'
  });

  // estado para crear gastos
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: '',
    monto: '',
    categoria: 'Arriendo',
    mes: 'Diciembre',
    recurrente: true
  });

  // modal para agregar gasto
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);

  const [mensajeExito, setMensajeExito] = useState('');
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({});

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // modo oscuro / claro
  const [modoOscuro, setModoOscuro] = useState(true);

  useEffect(() => {
    if (modoOscuro) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [modoOscuro]);

  // ================== CARGAR DESDE BACKEND ==================
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener los datos');

        const data = await res.json();

        const gastosServidor = Array.isArray(data.gastos) ? data.gastos : [];
        // si el backend viene vacío, usamos los iniciales
        setGastos(gastosServidor.length > 0 ? gastosServidor : GASTOS_INICIALES);
        setAportes(data.aportes || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del servidor.');
        // si falla el backend, al menos mostramos los gastos iniciales
        setGastos(GASTOS_INICIALES);
      } finally {
        setCargando(false);
      }
    };

    fetchBudget();
  }, []);

  // ================== GUARDAR AUTOMÁTICO (PUT) ==================
  useEffect(() => {
    if (cargando) return; // No guardes mientras está cargando

    const timeout = setTimeout(async () => {
      try {
        setGuardando(true);
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gastos, aportes })
        });
      } catch (err) {
        console.error(err);
        setError('No se pudieron guardar los cambios en el servidor.');
      } finally {
        setGuardando(false);
      }
    }, 800); // debounce

    return () => clearTimeout(timeout);
  }, [gastos, aportes, cargando]);

  // ================== CÁLCULOS ==================
  const calculos = useMemo(() => {
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const gastosPagados = gastos
      .filter((g) => g.pagado)
      .reduce((sum, g) => sum + g.monto, 0);

    const totalAportes = aportes.reduce((sum, a) => sum + a.monto, 0);

    const aportesPorPersona = {
      Jhojan: aportes
        .filter((a) => a.persona === 'Jhojan')
        .reduce((s, a) => s + a.monto, 0),
      'Luisa ❤️': aportes
        .filter((a) => a.persona === 'Luisa ❤️')
        .reduce((s, a) => s + a.monto, 0)
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      Jhojan: aportesPorPersona['Jhojan'] - mitadGastos,
      'Luisa ❤️': aportesPorPersona['Luisa ❤️'] - mitadGastos
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

  // ================== HELPERS ==================
  const formatMoney = (num) => '$' + num.toLocaleString('es-CO');

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // ================== GASTOS ==================
  const togglePago = (id) => {
    setGastos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, pagado: !g.pagado } : g))
    );
  };

  const eliminarGasto = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este gasto?')) {
      setGastos((prev) => prev.filter((g) => g.id !== id));
      mostrarExito('🗑️ Gasto eliminado');
    }
  };

  const iniciarEdicion = (gasto) => {
    setEditandoGasto(gasto.id);
    setGastoEditado({ ...gasto });
  };

  const cancelarEdicion = () => {
    setEditandoGasto(null);
    setGastoEditado({});
  };

  const guardarEdicion = () => {
    if (!gastoEditado.nombre || !gastoEditado.monto) {
      alert('Completa todos los campos del gasto');
      return;
    }

    setGastos((prev) =>
      prev.map((g) =>
        g.id === editandoGasto
          ? { ...gastoEditado, monto: parseFloat(gastoEditado.monto) }
          : g
      )
    );

    setEditandoGasto(null);
    setGastoEditado({});
    mostrarExito('✅ Gasto actualizado');
  };

  const handleEditChange = (field, value) => {
    setGastoEditado((prev) => ({ ...prev, [field]: value }));
  };

  // crear gasto
  const agregarGasto = () => {
    const monto = parseFloat(nuevoGasto.monto);
    if (!nuevoGasto.nombre.trim()) {
      alert('Por favor escribe un nombre para el gasto');
      return;
    }
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
    }

    const nuevo = {
      id: Date.now(),
      nombre: nuevoGasto.nombre.trim(),
      monto,
      categoria: nuevoGasto.categoria,
      mes: nuevoGasto.mes,
      recurrente: nuevoGasto.recurrente,
      pagado: false
    };

    setGastos((prev) => [nuevo, ...prev]); // aparece arriba
    setNuevoGasto({
      nombre: '',
      monto: '',
      categoria: 'Arriendo',
      mes: 'Diciembre',
      recurrente: true
    });
    setMostrarModalGasto(false);
    mostrarExito('✅ Gasto agregado');
  };

  // ================== APORTES ==================
  const agregarAporte = () => {
    const monto = parseFloat(nuevoAporte.monto);
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setAportes((prev) => [
      ...prev,
      {
        id: Date.now(),
        persona: nuevoAporte.persona,
        monto,
        mes: nuevoAporte.mes
      }
    ]);

    setNuevoAporte({ persona: 'Jhojan', monto: '', mes: 'Diciembre' });
    mostrarExito('✅ Aporte agregado');
  };

  const eliminarAporte = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este aporte?')) {
      setAportes((prev) => prev.filter((a) => a.id !== id));
      mostrarExito('🗑️ Aporte eliminado');
    }
  };

  // ================== OTROS ==================
  const limpiarDatos = () => {
    if (
      window.confirm(
        '¿Seguro que deseas limpiar todos los registros? Esta acción no se puede deshacer.'
      )
    ) {
      setGastos([]);
      setAportes([]);
      mostrarExito('🧹 Todos los datos fueron limpiados');
    }
  };

  const exportarDatos = () => {
    const data = {
      gastos,
      aportes,
      exportado: new Date().toISOString(),
      totales: calculos
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `presupuesto-${new Date()
      .toISOString()
      .split('T')[0]}.json`;
    link.click();
  };

  // ================== CONFIG LISTAS ==================
  const gastosFiltrados =
    mesSeleccionado === 'Todos'
      ? gastos
      : gastos.filter((g) => g.mes === mesSeleccionado);

  const categoriaIcons = {
    Arriendo: <Home size={18} />,
    Servicios: <Wifi size={18} />,
    Transporte: <Car size={18} />,
    Tarjetas: <CreditCard size={18} />
    // Mercado y Moto pueden quedar sin icono
  };

  const categoriaColors = {
    Arriendo: 'blue',
    Servicios: 'green',
    Transporte: 'yellow',
    Tarjetas: 'red',
    Mercado: 'purple',
    Moto: 'orange'
  };

  const categorias = ['Arriendo', 'Servicios', 'Transporte', 'Tarjetas', 'Mercado', 'Moto'];
  const meses = ['Diciembre', 'Enero', 'Febrero'];

  const porcentajePagado =
    calculos.totalGastos > 0
      ? ((calculos.gastosPagados / calculos.totalGastos) * 100).toFixed(1)
      : null;

  // ================== LOADING ==================
  if (cargando) {
    return (
      <div className="app-container">
        <p>Cargando datos del servidor...</p>
      </div>
    );
  }

  return (
    <div className={`app-container ${modoOscuro ? 'theme-dark' : 'theme-light'}`}>
      {/* HEADER */}
      <div className="header">
        <div
          className="header-top-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div>
            <h1>Control de Presupuesto Compartido</h1>
            <p className="header-subtitle">Diciembre 2024 - Febrero 2025</p>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setModoOscuro((prev) => !prev)}
          >
            {modoOscuro ? <Sun size={16} /> : <Moon size={16} />}
            <span>{modoOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
        </div>

        {mensajeExito && <div className="message-success fade-in">{mensajeExito}</div>}
        {error && <div className="message-error">{error}</div>}

        <div className="action-buttons">
          <button className="btn btn-export" onClick={exportarDatos}>
            <Download size={18} /> Exportar
          </button>
          <button className="btn btn-clear" onClick={limpiarDatos}>
            <Trash2 size={18} /> Limpiar
          </button>
        </div>

        {guardando && (
          <p className="saving-indicator">Guardando cambios en el servidor...</p>
        )}
      </div>

      {/* NAV */}
      <div className="nav-container">
        <button
          className={`nav-btn ${vistaActual === 'dashboard' ? 'active' : ''}`}
          onClick={() => setVistaActual('dashboard')}
        >
          <BarChart3 size={18} />
          Dashboard
        </button>
        <button
          className={`nav-btn ${vistaActual === 'gastos' ? 'active' : ''}`}
          onClick={() => setVistaActual('gastos')}
        >
          <DollarSign size={18} />
          Gastos
        </button>
        <button
          className={`nav-btn ${vistaActual === 'aportes' ? 'active' : ''}`}
          onClick={() => setVistaActual('aportes')}
        >
          <TrendingUp size={18} />
          Aportes
        </button>
      </div>

      {/* ================== DASHBOARD ================== */}
      {vistaActual === 'dashboard' && (
        <>
          <div className="stats-grid">
            {[
              {
                title: 'Total Gastos',
                value: calculos.totalGastos,
                subtitle: '3 meses',
                icon: DollarSign,
                color: 'bg-blue-500'
              },
              {
                title: 'Total Aportado',
                value: calculos.totalAportes,
                subtitle: 'Por ambos',
                icon: TrendingUp,
                color: 'bg-green-500'
              },
              {
                title: 'Pagado',
                value: calculos.gastosPagados,
                subtitle:
                  porcentajePagado !== null
                    ? `${porcentajePagado}% completado`
                    : 'Sin gastos registrados',
                icon: Check,
                color: 'bg-emerald-500'
              },
              {
                title: 'Saldo',
                value: calculos.saldoDisponible,
                subtitle: 'Disponible',
                icon: PieChart,
                color: 'bg-purple-500'
              }
            ].map((card, index) => (
              <div key={index} className="card fade-in">
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-title">{card.title}</span>
                    <div className={`stat-icon ${card.color}`}>
                      <card.icon className="text-white" size={20} />
                    </div>
                  </div>
                  <div className="stat-value">{formatMoney(card.value)}</div>
                  <div className="stat-subtitle">{card.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* BALANCE POR PERSONA */}
          <div className="balance-grid">
            {['Jhojan', 'Luisa ❤️'].map((persona) => (
              <div key={persona} className="card fade-in">
                <div className="balance-header">
                  <div
                    className={`balance-avatar ${
                      persona === 'Jhojan' ? 'purple' : 'pink'
                    }`}
                  >
                    <Users className="text-white" size={24} />
                  </div>
                  <div className="balance-info">
                    <h3>{persona}</h3>
                    <p>Balance personal</p>
                  </div>
                </div>

                <div className="balance-details">
                  <div className="balance-row">
                    <span className="balance-label">Aportado:</span>
                    <span className="balance-amount green">
                      {formatMoney(calculos.aportesPorPersona[persona] || 0)}
                    </span>
                  </div>
                  <div className="balance-row">
                    <span className="balance-label">Tu parte (50%):</span>
                    <span className="balance-amount">
                      {formatMoney(calculos.mitadGastos || 0)}
                    </span>
                  </div>
                  <div className="balance-total">
                    <div className="balance-total-row">
                      <span className="balance-total-label">Balance:</span>
                      <span
                        className={`balance-total-amount ${
                          calculos.balance[persona] >= 0
                            ? 'positive'
                            : 'negative'
                        }`}
                      >
                        {formatMoney(Math.abs(calculos.balance[persona] || 0))}
                      </span>
                    </div>
                    <p className="balance-note">
                      {calculos.balance[persona] > 0
                        ? 'Te deben este monto'
                        : calculos.balance[persona] < 0
                        ? 'Debes este monto'
                        : 'Estás al día'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GASTOS POR CATEGORÍA */}
          <div className="card fade-in">
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PieChart size={24} />
              Gastos por Categoría
            </h3>
            <div>
              {Object.entries(calculos.gastosPorCategoria).map(
                ([categoria, monto]) => {
                  const porcentaje = calculos.totalGastos
                    ? ((monto / calculos.totalGastos) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={categoria} className="category-item fade-in">
                      <div className="category-header">
                        <div className="category-info">
                          <div style={{ color: '#9ca3af' }}>
                            {categoriaIcons[categoria]}
                          </div>
                          <span className="category-name">{categoria}</span>
                        </div>
                        <div className="category-amount">
                          <div className="category-value">
                            {formatMoney(monto)}
                          </div>
                          <div className="category-percentage">
                            {porcentaje}%
                          </div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}

      {/* ================== GASTOS ================== */}
      {vistaActual === 'gastos' && (
        <>
          {/* FILTROS + BOTÓN NUEVO GASTO */}
          <div className="card fade-in">
            <div className="filters">
              <span className="filter-label">Filtrar por mes:</span>
              <div className="filter-buttons">
                {['Todos', ...meses].map((mes) => (
                  <button
                    key={mes}
                    className={`filter-btn ${
                      mesSeleccionado === mes ? 'active' : ''
                    }`}
                    onClick={() => setMesSeleccionado(mes)}
                  >
                    {mes}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button
                className="btn-add"
                style={{ minWidth: 180 }}
                onClick={() => setMostrarModalGasto(true)}
              >
                <Plus size={18} />
                Nuevo gasto
              </button>
            </div>
          </div>

          {/* LISTA DE GASTOS */}
          <div className="expense-list">
            {gastosFiltrados.map((gasto) => (
              <div
                className={`expense-item ${gasto.pagado ? 'paid' : ''} fade-in`}
                key={gasto.id}
              >
                {editandoGasto === gasto.id ? (
                  // MODO EDICIÓN
                  <div style={{ width: '100%' }}>
                    <div className="edit-form-grid">
                      <div>
                        <label className="edit-form-label">Nombre</label>
                        <input
                          className="form-input"
                          type="text"
                          value={gastoEditado.nombre || ''}
                          onChange={(e) =>
                            handleEditChange('nombre', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="edit-form-label">Monto</label>
                        <input
                          className="form-input"
                          type="number"
                          value={gastoEditado.monto || ''}
                          onChange={(e) =>
                            handleEditChange('monto', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="edit-form-label">Categoría</label>
                        <select
                          className="form-input"
                          value={gastoEditado.categoria || ''}
                          onChange={(e) =>
                            handleEditChange('categoria', e.target.value)
                          }
                        >
                          {categorias.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="edit-form-label">Mes</label>
                        <select
                          className="form-input"
                          value={gastoEditado.mes || ''}
                          onChange={(e) =>
                            handleEditChange('mes', e.target.value)
                          }
                        >
                          {meses.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button className="btn-add" onClick={guardarEdicion}>
                        <Save size={14} />
                        Guardar
                      </button>
                      <button className="btn-cancel" onClick={cancelarEdicion}>
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // MODO LECTURA
                  <>
                    <div className="expense-info">
                      <div
                        className={`expense-category ${
                          categoriaColors[gasto.categoria] || 'blue'
                        }`}
                      />
                      <div className="expense-details">
                        <h4>{gasto.nombre}</h4>
                        <div className="expense-meta">
                          <span>{gasto.categoria}</span>
                          <span>•</span>
                          <span>{gasto.mes}</span>
                          {gasto.recurrente && (
                            <span className="expense-recurrent">
                              🔄 Recurrente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="expense-actions">
                      <span className="expense-amount">
                        {formatMoney(gasto.monto)}
                      </span>

                      <button
                        className={
                          gasto.pagado ? 'btn-mark-unpaid' : 'btn-mark-paid'
                        }
                        onClick={() => togglePago(gasto.id)}
                      >
                        {gasto.pagado ? '❌ No pagado' : '✅ Pagado'}
                      </button>

                      <button
                        className="btn-edit"
                        onClick={() => iniciarEdicion(gasto)}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => eliminarGasto(gasto.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {gastosFiltrados.length === 0 && (
              <div className="empty-state">
                No hay gastos registrados en este mes.
              </div>
            )}
          </div>
        </>
      )}

      {/* ================== APORTES ================== */}
      {vistaActual === 'aportes' && (
        <>
          {/* FORM APORTES */}
          <div className="card contribution-form fade-in">
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={24} style={{ color: '#4ade80' }} />
              Registrar Nuevo Aporte
            </h3>
            <div className="form-grid">
              <select
                className="form-input"
                value={nuevoAporte.persona}
                onChange={(e) =>
                  setNuevoAporte({ ...nuevoAporte, persona: e.target.value })
                }
              >
                <option>Jhojan</option>
                <option>Luisa ❤️</option>
              </select>
              <input
                className="form-input"
                type="number"
                placeholder="Monto"
                value={nuevoAporte.monto}
                onChange={(e) =>
                  setNuevoAporte({ ...nuevoAporte, monto: e.target.value })
                }
              />
              <select
                className="form-input"
                value={nuevoAporte.mes}
                onChange={(e) =>
                  setNuevoAporte({ ...nuevoAporte, mes: e.target.value })
                }
              >
                {meses.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button className="btn-add" onClick={agregarAporte}>
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>

          {/* HISTORIAL APORTES */}
          <div className="card fade-in">
            <h3
              style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}
            >
              Historial de Aportes
            </h3>
            <div className="contribution-list">
              {aportes.map((a) => (
                <div className="contribution-item fade-in" key={a.id}>
                  <div className="contribution-person">
                    <div
                      className={`person-avatar ${
                        a.persona === 'Jhojan' ? 'purple' : 'pink'
                      }`}
                    >
                      <Users size={24} className="text-white" />
                    </div>
                    <div className="person-info">
                      <h4>{a.persona}</h4>
                      <p>{a.mes}</p>
                    </div>
                  </div>
                  <div className="contribution-actions">
                    <span className="contribution-amount">
                      {formatMoney(a.monto)}
                    </span>
                    <button
                      className="btn-contribution-delete"
                      onClick={() => eliminarAporte(a.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {aportes.length === 0 && (
                <div className="empty-state">
                  No hay aportes registrados todavía.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================== MODAL NUEVO GASTO ================== */}
      {mostrarModalGasto && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalGasto(false)}
        >
          <div
            className="modal-card fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Nuevo gasto</h3>
              <button
                className="modal-close"
                onClick={() => setMostrarModalGasto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Nombre del gasto"
                  value={nuevoGasto.nombre}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, nombre: e.target.value })
                  }
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={nuevoGasto.monto}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, monto: e.target.value })
                  }
                  className="form-input"
                />
                <select
                  value={nuevoGasto.categoria}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })
                  }
                  className="form-input"
                >
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={nuevoGasto.mes}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, mes: e.target.value })
                  }
                  className="form-input"
                >
                  {meses.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={nuevoGasto.recurrente}
                    onChange={(e) =>
                      setNuevoGasto({
                        ...nuevoGasto,
                        recurrente: e.target.checked
                      })
                    }
                  />
                  Gasto recurrente
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setMostrarModalGasto(false)}
              >
                Cancelar
              </button>
              <button className="btn-add" onClick={agregarGasto}>
                <Plus size={18} />
                Guardar gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
