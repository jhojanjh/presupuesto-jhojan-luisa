import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from 'react';
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

// Utilidad para IDs únicos
const generarIdUnico = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const BudgetTracker = () => {
  const [gastos, setGastos] = useState([]);
  const [aportes, setAportes] = useState([]);

  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mesSeleccionado, setMesSeleccionado] = useState('Todos');

  // 🔎 Filtro para el DASHBOARD
  const [mesDashboard, setMesDashboard] = useState('General');

  const [nuevoAporte, setNuevoAporte] = useState({
    persona: 'Jhojan',
    monto: '',
    mes: 'Diciembre'
  });

  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: '',
    monto: '',
    categoria: 'Arriendo',
    mes: 'Diciembre',
    recurrente: true
  });

  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Tema
  const [modoOscuro, setModoOscuro] = useState(true);

  // Edición de gastos
  const [gastoEditandoId, setGastoEditandoId] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({
    nombre: '',
    monto: '',
    categoria: 'Arriendo',
    mes: 'Diciembre',
    recurrente: true
  });

  const timeoutRef = useRef(null);

  // Lista de meses que manejas en la app
  const meses = ['Diciembre', 'Enero', 'Febrero'];
  const categorias = ['Arriendo', 'Servicios', 'Transporte', 'Tarjetas', 'Mercado', 'Moto'];

  // ================== TEMA CLARO / OSCURO ==================
  useEffect(() => {
    if (modoOscuro) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
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

        const gastosCorregidos = gastosServidor.map((gasto) => ({
          ...gasto,
          pagado: Boolean(gasto.pagado),
          recurrente: Boolean(gasto.recurrente)
        }));

        setGastos(gastosCorregidos);
        setAportes(Array.isArray(data.aportes) ? data.aportes : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del servidor.');
        setGastos([]);
        setAportes([]);
      } finally {
        setCargando(false);
      }
    };

    fetchBudget();
  }, []);

  // ================== GUARDADO AUTOMÁTICO ==================
  useEffect(() => {
    if (cargando) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setGuardando(true);

        const datosAGuardar = {
          gastos: gastos.map((g) => ({
            ...g,
            pagado: Boolean(g.pagado),
            recurrente: Boolean(g.recurrente)
          })),
          aportes: aportes.map((a) => ({ ...a })),
          ultimaActualizacion: new Date().toISOString()
        };

        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosAGuardar)
        });

        if (!response.ok) throw new Error('Error en servidor');

        console.log('✅ Datos guardados correctamente');
      } catch (err) {
        console.error('❌ Error guardando:', err);
        setError('No se pudieron guardar los cambios en el servidor');
      } finally {
        setGuardando(false);
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [gastos, aportes, cargando]);

  // ================== MANEJO DE ERRORES ==================
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ================== CÁLCULOS (con filtro del Dashboard) ==================
  const calculos = useMemo(() => {
    const gastosBase =
      mesDashboard === 'General'
        ? gastos
        : gastos.filter((g) => g.mes === mesDashboard);

    const aportesBase =
      mesDashboard === 'General'
        ? aportes
        : aportes.filter((a) => a.mes === mesDashboard);

    const gastosPagadosFiltrados = gastosBase.filter(
      (gasto) => gasto.pagado === true
    );

    const totalGastos = gastosBase.reduce((sum, g) => sum + Number(g.monto), 0);
    const gastosPagados = gastosPagadosFiltrados.reduce(
      (sum, g) => sum + Number(g.monto),
      0
    );
    const totalAportes = aportesBase.reduce(
      (sum, a) => sum + Number(a.monto),
      0
    );

    const aportesPorPersona = {
      Jhojan: aportesBase
        .filter((a) => a.persona === 'Jhojan')
        .reduce((s, a) => s + Number(a.monto), 0),
      'Luisa ❤️': aportesBase
        .filter((a) => a.persona === 'Luisa ❤️')
        .reduce((s, a) => s + Number(a.monto), 0)
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      Jhojan: aportesPorPersona['Jhojan'] - mitadGastos,
      'Luisa ❤️': aportesPorPersona['Luisa ❤️'] - mitadGastos
    };

    const gastosPorCategoria = gastosBase.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto);
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
      gastosPorCategoria,
      numGastos: gastosBase.length,
      numGastosPagados: gastosPagadosFiltrados.length
    };
  }, [gastos, aportes, mesDashboard]);

  const porcentajePagado =
    calculos.totalGastos > 0
      ? (calculos.gastosPagados / calculos.totalGastos) * 100
      : 0;

  const etiquetaPeriodo =
    mesDashboard === 'General' ? 'Todos los meses' : mesDashboard;

  // ================== HELPERS ==================
  const formatMoney = (num) => {
    if (isNaN(num)) return '$0';
    return '$' + Math.round(num).toLocaleString('es-CO');
  };

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // ================== GASTOS ==================
  const togglePago = useCallback((id) => {
    setGastos((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              pagado: !g.pagado
            }
          : g
      )
    );
  }, []);

  const eliminarGasto = useCallback((id) => {
    if (window.confirm('¿Seguro que quieres eliminar este gasto?')) {
      setGastos((prev) => prev.filter((g) => g.id !== id));
      mostrarExito('🗑️ Gasto eliminado');
    }
  }, []);

  const empezarEdicion = useCallback((gasto) => {
    setGastoEditandoId(gasto.id);
    setGastoEditado({
      nombre: gasto.nombre,
      monto: String(gasto.monto),
      categoria: gasto.categoria,
      mes: gasto.mes,
      recurrente: Boolean(gasto.recurrente)
    });
  }, []);

  const cancelarEdicion = () => {
    setGastoEditandoId(null);
  };

  // 🔧 Opción 4: editar un recurrente actualiza todos los meses
  const guardarEdicion = () => {
    const montoNum = parseFloat(gastoEditado.monto);
    if (!gastoEditado.nombre.trim()) {
      setError('El nombre del gasto no puede estar vacío');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    const gastoOriginal = gastos.find((g) => g.id === gastoEditandoId);
    if (!gastoOriginal) {
      setError('No se encontró el gasto a editar');
      return;
    }

    const esRecurrenteOriginal = Boolean(gastoOriginal.recurrente);

    setGastos((prev) =>
      prev.map((g) => {
        // Si NO era recurrente originalmente, solo actualizamos este
        if (!esRecurrenteOriginal) {
          if (g.id !== gastoEditandoId) return g;

          return {
            ...g,
            nombre: gastoEditado.nombre.trim(),
            monto: montoNum,
            categoria: gastoEditado.categoria,
            mes: gastoEditado.mes,
            recurrente: Boolean(gastoEditado.recurrente)
          };
        }

        // Si era recurrente: queremos cambiar TODOS los meses del grupo
        // Usamos nombre + categoría + recurrente como "grupo"
        const mismoGrupo =
          g.recurrente &&
          g.nombre === gastoOriginal.nombre &&
          g.categoria === gastoOriginal.categoria;

        if (!mismoGrupo && g.id !== gastoEditandoId) {
          return g;
        }

        // Para los del grupo: actualizamos nombre, monto, categoría, recurrente
        // El MES solo se cambia en el gasto que estás editando.
        return {
          ...g,
          nombre: gastoEditado.nombre.trim(),
          monto: montoNum,
          categoria: gastoEditado.categoria,
          recurrente: Boolean(gastoEditado.recurrente),
          mes: g.id === gastoEditandoId ? gastoEditado.mes : g.mes
        };
      })
    );

    setGastoEditandoId(null);
    setError(null);
    mostrarExito(
      esRecurrenteOriginal
        ? '✏️ Gasto recurrente actualizado en todos los meses'
        : '✏️ Gasto actualizado'
    );
  };

  // ⭕ Crear gasto (recurrente = se agrega en todos los meses)
  const agregarGasto = () => {
    const monto = parseFloat(nuevoGasto.monto);
    if (!nuevoGasto.nombre.trim()) {
      setError('Por favor escribe un nombre para el gasto');
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    const mesesParaCrear = nuevoGasto.recurrente ? meses : [nuevoGasto.mes];

    const nuevosGastos = mesesParaCrear.map((mes) => ({
      id: generarIdUnico(),
      nombre: nuevoGasto.nombre.trim(),
      monto,
      categoria: nuevoGasto.categoria,
      mes,
      recurrente: Boolean(nuevoGasto.recurrente),
      pagado: false,
      fechaCreacion: new Date().toISOString()
    }));

    setGastos((prev) => [...nuevosGastos, ...prev]);

    setNuevoGasto({
      nombre: '',
      monto: '',
      categoria: 'Arriendo',
      mes: 'Diciembre',
      recurrente: true
    });
    setMostrarModalGasto(false);
    setError(null);
    mostrarExito(
      nuevoGasto.recurrente
        ? '✅ Gasto recurrente agregado en todos los meses'
        : '✅ Gasto agregado'
    );
  };

  // ================== APORTES ==================
  const agregarAporte = () => {
    const monto = parseFloat(nuevoAporte.monto);
    if (isNaN(monto) || monto <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setAportes((prev) => [
      ...prev,
      {
        id: generarIdUnico(),
        persona: nuevoAporte.persona,
        monto,
        mes: nuevoAporte.mes,
        fechaCreacion: new Date().toISOString()
      }
    ]);

    setNuevoAporte({ persona: 'Jhojan', monto: '', mes: 'Diciembre' });
    setError(null);
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
    link.download = `presupuesto-${new Date().toISOString().split('T')[0]}.json`;
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
    Tarjetas: <CreditCard size={18} />,
    Mercado: <TrendingUp size={18} />,
    Moto: <Car size={18} />
  };

  const categoriaColors = {
    Arriendo: 'blue',
    Servicios: 'green',
    Transporte: 'yellow',
    Tarjetas: 'red',
    Mercado: 'purple',
    Moto: 'orange'
  };

  // ================== LOADING ==================
  if (cargando) {
    return (
      <div className="app-container">
        <p>Cargando datos del servidor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header">
        <div className="header-top-row">
          <div>
            <h1>Control de Presupuesto Compartido</h1>
            <p className="header-subtitle">Diciembre 2024 - Febrero 2025</p>
          </div>

          <div className="header-status">
            {guardando && (
              <span className="saving-indicator">💾 Guardando...</span>
            )}

            <button
              className="btn-theme-toggle"
              onClick={() => setModoOscuro((prev) => !prev)}
            >
              {modoOscuro ? <Sun size={16} /> : <Moon size={16} />}
              <span>{modoOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>
        </div>

        {/* NOTIFICACIONES */}
        <div className="notifications">
          {mensajeExito && (
            <div className="message-success fade-in">✅ {mensajeExito}</div>
          )}
          {error && (
            <div className="message-error">
              <span>❌ {error}</span>
              <button onClick={() => setError(null)}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn btn-export" onClick={exportarDatos}>
            <Download size={18} /> Exportar
          </button>
          <button className="btn btn-clear" onClick={limpiarDatos}>
            <Trash2 size={18} /> Limpiar
          </button>
        </div>
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
          {/* Filtro de periodo para el DASHBOARD */}
          <div className="card fade-in">
            <div className="filters">
              <span className="filter-label">Ver periodo:</span>
              <div className="filter-buttons">
                {['General', ...meses].map((opcion) => (
                  <button
                    key={opcion}
                    className={`filter-btn ${
                      mesDashboard === opcion ? 'active' : ''
                    }`}
                    onClick={() => setMesDashboard(opcion)}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {/* Total Gastos */}
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total de gastos</span>
                  <div className="stat-icon bg-blue-500">
                    <DollarSign className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">
                  {formatMoney(calculos.totalGastos)}
                </div>
                <div className="stat-subtitle">
                  Periodo: {etiquetaPeriodo}
                </div>
              </div>
            </div>

            {/* Aportes */}
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total aportado</span>
                  <div className="stat-icon bg-green-500">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">
                  {formatMoney(calculos.totalAportes)}
                </div>
                <div className="stat-subtitle">
                  Ambos aportes · {etiquetaPeriodo}
                </div>
              </div>
            </div>

            {/* Pagado */}
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Gastos pagados</span>
                  <div className="stat-icon bg-emerald-500">
                    <Check className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">
                  {formatMoney(calculos.gastosPagados)}
                </div>
                <div className="stat-subtitle">
                  {calculos.totalGastos > 0 ? (
                    <>
                      {porcentajePagado.toFixed(1)}% del periodo
                      <br />
                      <small style={{ fontSize: '12px', opacity: 0.8 }}>
                        {calculos.numGastosPagados} de {calculos.numGastos} gastos
                      </small>
                    </>
                  ) : (
                    'Sin gastos registrados en este periodo'
                  )}
                </div>
              </div>
            </div>

            {/* Saldo disponible */}
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Saldo disponible</span>
                  <div className="stat-icon bg-purple-500">
                    <PieChart className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">
                  {formatMoney(calculos.saldoDisponible)}
                </div>
                <div className="stat-subtitle">
                  Aportes - gastos pagados · {etiquetaPeriodo}
                </div>
              </div>
            </div>
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
                    <p>Balance personal · {etiquetaPeriodo}</p>
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
                    <span className="balance-label">Tu 50% de gastos:</span>
                    <span className="balance-amount">
                      {formatMoney(calculos.mitadGastos || 0)}
                    </span>
                  </div>
                  <div className="balance-total">
                    <div className="balance-total-row">
                      <span className="balance-total-label">Resultado:</span>
                      <span
                        className={`balance-total-amount ${
                          calculos.balance[persona] >= 0 ? 'positive' : 'negative'
                        }`}
                      >
                        {formatMoney(Math.abs(calculos.balance[persona] || 0))}
                      </span>
                    </div>
                    <p className="balance-note">
                      {calculos.balance[persona] > 0
                        ? 'Te han aportado más de lo que te corresponde'
                        : calculos.balance[persona] < 0
                        ? 'Te falta aportar para equilibrar'
                        : 'Están a la par en este periodo'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GASTOS POR CATEGORÍA */}
          <div className="card fade-in">
            <h3>
              <PieChart size={24} />
              Gastos por categoría
            </h3>
            <div>
              {Object.entries(calculos.gastosPorCategoria).map(
                ([categoria, monto]) => {
                  const porcentaje = calculos.totalGastos
                    ? (monto / calculos.totalGastos) * 100
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
                            {porcentaje.toFixed(1)}%
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
                onClick={() => setMostrarModalGasto(true)}
              >
                <Plus size={18} />
                Nuevo gasto
              </button>
            </div>
          </div>

          {/* LISTA DE GASTOS */}
          <div className="expense-list">
            {gastosFiltrados.map((gasto) => {
              const enEdicion = gastoEditandoId === gasto.id;

              return (
                <div
                  className={`expense-item ${
                    gasto.pagado ? 'paid' : ''
                  } fade-in`}
                  key={gasto.id}
                >
                  {enEdicion ? (
                    // 🔧 MODO EDICIÓN
                    <div className="edit-form-grid" style={{ width: '100%' }}>
                      <div>
                        <label className="edit-form-label">Nombre</label>
                        <input
                          type="text"
                          className="form-input"
                          value={gastoEditado.nombre}
                          onChange={(e) =>
                            setGastoEditado((prev) => ({
                              ...prev,
                              nombre: e.target.value
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="edit-form-label">Monto</label>
                        <input
                          type="number"
                          className="form-input"
                          value={gastoEditado.monto}
                          onChange={(e) =>
                            setGastoEditado((prev) => ({
                              ...prev,
                              monto: e.target.value
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="edit-form-label">Categoría</label>
                        <select
                          className="form-input"
                          value={gastoEditado.categoria}
                          onChange={(e) =>
                            setGastoEditado((prev) => ({
                              ...prev,
                              categoria: e.target.value
                            }))
                          }
                        >
                          {categorias.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="edit-form-label">Mes</label>
                        <select
                          className="form-input"
                          value={gastoEditado.mes}
                          onChange={(e) =>
                            setGastoEditado((prev) => ({
                              ...prev,
                              mes: e.target.value
                            }))
                          }
                        >
                          {meses.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="edit-form-label">Recurrente</label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={gastoEditado.recurrente}
                            onChange={(e) =>
                              setGastoEditado((prev) => ({
                                ...prev,
                                recurrente: e.target.checked
                              }))
                            }
                          />
                          <span style={{ fontSize: '0.85rem' }}>Sí</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <button
                          className="btn-cancel"
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>
                        <button className="btn-add" onClick={guardarEdicion}>
                          <Save size={16} />
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 👁️ MODO NORMAL
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
                            gasto.pagado ? 'btn-mark-paid' : 'btn-mark-unpaid'
                          }
                          onClick={() => togglePago(gasto.id)}
                        >
                          {gasto.pagado ? (
                            <>
                              <Check size={14} />
                              Pagado
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              No pagado
                            </>
                          )}
                        </button>

                        <button
                          className="btn-edit"
                          onClick={() => empezarEdicion(gasto)}
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
              );
            })}

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
            <h3>
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
            <h3>Historial de Aportes</h3>
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
                    setNuevoGasto({
                      ...nuevoGasto,
                      categoria: e.target.value
                    })
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

                <label style={{ fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={nuevoGasto.recurrente}
                    onChange={(e) =>
                      setNuevoGasto({
                        ...nuevoGasto,
                        recurrente: e.target.checked
                      })
                    }
                    style={{ marginRight: 6 }}
                  />
                  Gasto recurrente (se creará en todos los meses)
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
