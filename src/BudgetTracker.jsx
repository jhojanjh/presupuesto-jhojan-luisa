import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Sun,
  Moon
} from 'lucide-react';

const API_URL = 'https://budget-api-dt5y.onrender.com/api/budget/main';

// ======= GASTOS INICIALES =======
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

// Utilidad para IDs únicos
const generarIdUnico = () => {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

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
  const [modoOscuro, setModoOscuro] = useState(true);

  // Refs para controlar el estado
  const timeoutRef = useRef(null);

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
        const gastosFinales = gastosServidor.length > 0 ? gastosServidor : GASTOS_INICIALES;
        
        // Asegurar que todos los gastos tengan pagado como booleano
        const gastosCorregidos = gastosFinales.map(gasto => ({
          ...gasto,
          pagado: Boolean(gasto.pagado)
        }));

        setGastos(gastosCorregidos);
        setAportes(data.aportes || []);

      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del servidor.');
        
        // Asegurar estado booleano en gastos iniciales
        const gastosInicialesCorregidos = GASTOS_INICIALES.map(gasto => ({
          ...gasto,
          pagado: false // Todos deben empezar como no pagados
        }));
        
        setGastos(gastosInicialesCorregidos);
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
          gastos: gastos.map(g => ({
            ...g,
            pagado: Boolean(g.pagado)
          })),
          aportes: aportes.map(a => ({
            ...a
          })),
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

  // ================== CÁLCULOS CORREGIDOS ==================
  const calculos = useMemo(() => {
    // 🔴 CORREGIR: Filtrar SOLO los gastos que están marcados como PAGADOS (true)
    const gastosPagadosFiltrados = gastos.filter(gasto => gasto.pagado === true);
    
    const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
    const gastosPagados = gastosPagadosFiltrados.reduce((sum, g) => sum + Number(g.monto), 0);

    const totalAportes = aportes.reduce((sum, a) => sum + Number(a.monto), 0);

    const aportesPorPersona = {
      Jhojan: aportes
        .filter((a) => a.persona === 'Jhojan')
        .reduce((s, a) => s + Number(a.monto), 0),
      'Luisa ❤️': aportes
        .filter((a) => a.persona === 'Luisa ❤️')
        .reduce((s, a) => s + Number(a.monto), 0)
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      Jhojan: aportesPorPersona['Jhojan'] - mitadGastos,
      'Luisa ❤️': aportesPorPersona['Luisa ❤️'] - mitadGastos
    };

    const gastosPorCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto);
      return acc;
    }, {});

    // DEBUG: Verificar cálculos en consola
    console.log('🔍 DEBUG CÁLCULOS:', {
      totalGastos,
      gastosPagados,
      totalAportes,
      totalGastosCount: gastos.length,
      gastosPagadosCount: gastosPagadosFiltrados.length,
      gastosNoPagadosCount: gastos.filter(g => !g.pagado).length,
      gastosConEstado: gastos.map(g => ({ nombre: g.nombre, pagado: g.pagado }))
    });

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
  const formatMoney = (num) => {
    if (isNaN(num)) return '$0';
    return '$' + Math.round(num).toLocaleString('es-CO');
  };

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // ================== GASTOS - FUNCIONES CORREGIDAS ==================
  const togglePago = useCallback((id) => {
    setGastos((prev) =>
      prev.map((g) => 
        g.id === id ? { 
          ...g, 
          pagado: !g.pagado // 🔴 TOGGLE SIMPLE Y CONSISTENTE
        } : g
      )
    );
  }, []);

  const eliminarGasto = useCallback((id) => {
    if (window.confirm('¿Seguro que quieres eliminar este gasto?')) {
      setGastos((prev) => prev.filter((g) => g.id !== id));
      mostrarExito('🗑️ Gasto eliminado');
    }
  }, []);

  // CREAR GASTO - CORREGIDO
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

    const nuevo = {
      id: generarIdUnico(),
      nombre: nuevoGasto.nombre.trim(),
      monto,
      categoria: nuevoGasto.categoria,
      mes: nuevoGasto.mes,
      recurrente: Boolean(nuevoGasto.recurrente),
      pagado: false, // 🔴 SIEMPRE FALSE AL CREAR
      fechaCreacion: new Date().toISOString()
    };

    setGastos((prev) => [nuevo, ...prev]);
    setNuevoGasto({
      nombre: '',
      monto: '',
      categoria: 'Arriendo',
      mes: 'Diciembre',
      recurrente: true
    });
    setMostrarModalGasto(false);
    setError(null);
    mostrarExito('✅ Gasto agregado');
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

  const categorias = ['Arriendo', 'Servicios', 'Transporte', 'Tarjetas', 'Mercado', 'Moto'];
  const meses = ['Diciembre', 'Enero', 'Febrero'];

  // Calcular porcentaje correctamente
  const porcentajePagado = calculos.totalGastos > 0 
    ? ((calculos.gastosPagados / calculos.totalGastos) * 100) 
    : 0;

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
              className="theme-toggle"
              onClick={() => setModoOscuro((prev) => !prev)}
            >
              {modoOscuro ? <Sun size={16} /> : <Moon size={16} />}
              <span>{modoOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>
        </div>

        {/* NOTIFICACIONES */}
        <div className="notifications">
          {mensajeExito && <div className="message-success fade-in">✅ {mensajeExito}</div>}
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
          <div className="stats-grid">
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total Gastos</span>
                  <div className="stat-icon bg-blue-500">
                    <DollarSign className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalGastos)}</div>
                <div className="stat-subtitle">3 meses</div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total Aportado</span>
                  <div className="stat-icon bg-green-500">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalAportes)}</div>
                <div className="stat-subtitle">Por ambos</div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Pagado</span>
                  <div className="stat-icon bg-emerald-500">
                    <Check className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">{formatMoney(calculos.gastosPagados)}</div>
                <div className="stat-subtitle">
                  {calculos.totalGastos > 0 ? (
                    <>
                      {porcentajePagado.toFixed(1)}% completado
                      <br />
                      <small style={{ fontSize: '12px', opacity: 0.7 }}>
                        {gastos.filter(g => g.pagado).length} de {gastos.length} gastos
                      </small>
                    </>
                  ) : (
                    'Sin gastos registrados'
                  )}
                </div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Saldo</span>
                  <div className="stat-icon bg-purple-500">
                    <PieChart className="text-white" size={20} />
                  </div>
                </div>
                <div className="stat-value">{formatMoney(calculos.saldoDisponible)}</div>
                <div className="stat-subtitle">Disponible</div>
              </div>
            </div>
          </div>

          {/* BALANCE POR PERSONA */}
          <div className="balance-grid">
            {['Jhojan', 'Luisa ❤️'].map((persona) => (
              <div key={persona} className="card fade-in">
                <div className="balance-header">
                  <div className={`balance-avatar ${persona === 'Jhojan' ? 'purple' : 'pink'}`}>
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
                      <span className={`balance-total-amount ${calculos.balance[persona] >= 0 ? 'positive' : 'negative'}`}>
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
            <h3>
              <PieChart size={24} />
              Gastos por Categoría
            </h3>
            <div>
              {Object.entries(calculos.gastosPorCategoria).map(([categoria, monto]) => {
                const porcentaje = calculos.totalGastos ? ((monto / calculos.totalGastos) * 100) : 0;
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
                        <div className="category-value">{formatMoney(monto)}</div>
                        <div className="category-percentage">{porcentaje.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })}
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
                    className={`filter-btn ${mesSeleccionado === mes ? 'active' : ''}`}
                    onClick={() => setMesSeleccionado(mes)}
                  >
                    {mes}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button className="btn-add" onClick={() => setMostrarModalGasto(true)}>
                <Plus size={18} />
                Nuevo gasto
              </button>
            </div>
          </div>

          {/* LISTA DE GASTOS - ESTADO CONSISTENTE */}
          <div className="expense-list">
            {gastosFiltrados.map((gasto) => (
              <div className={`expense-item ${gasto.pagado ? 'paid' : ''} fade-in`} key={gasto.id}>
                <div className="expense-info">
                  <div className={`expense-category ${categoriaColors[gasto.categoria] || 'blue'}`} />
                  <div className="expense-details">
                    <h4>{gasto.nombre}</h4>
                    <div className="expense-meta">
                      <span>{gasto.categoria}</span>
                      <span>•</span>
                      <span>{gasto.mes}</span>
                      {gasto.recurrente && (
                        <span className="expense-recurrent">🔄 Recurrente</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="expense-actions">
                  <span className="expense-amount">{formatMoney(gasto.monto)}</span>

                  {/* 🔴 BOTÓN CORREGIDO - ESTADO CONSISTENTE */}
                  <button
                    className={gasto.pagado ? 'btn-mark-paid' : 'btn-mark-unpaid'}
                    onClick={() => togglePago(gasto.id)}
                    style={{
                      backgroundColor: gasto.pagado ? '#10b981' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
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

                  <button className="btn-edit">
                    <Edit size={14} />
                  </button>

                  <button className="btn-delete" onClick={() => eliminarGasto(gasto.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {gastosFiltrados.length === 0 && (
              <div className="empty-state">No hay gastos registrados en este mes.</div>
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
                onChange={(e) => setNuevoAporte({ ...nuevoAporte, persona: e.target.value })}
              >
                <option>Jhojan</option>
                <option>Luisa ❤️</option>
              </select>
              <input
                className="form-input"
                type="number"
                placeholder="Monto"
                value={nuevoAporte.monto}
                onChange={(e) => setNuevoAporte({ ...nuevoAporte, monto: e.target.value })}
              />
              <select
                className="form-input"
                value={nuevoAporte.mes}
                onChange={(e) => setNuevoAporte({ ...nuevoAporte, mes: e.target.value })}
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
                    <div className={`person-avatar ${a.persona === 'Jhojan' ? 'purple' : 'pink'}`}>
                      <Users size={24} className="text-white" />
                    </div>
                    <div className="person-info">
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
              {aportes.length === 0 && (
                <div className="empty-state">No hay aportes registrados todavía.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================== MODAL NUEVO GASTO ================== */}
      {mostrarModalGasto && (
        <div className="modal-overlay" onClick={() => setMostrarModalGasto(false)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo gasto</h3>
              <button className="modal-close" onClick={() => setMostrarModalGasto(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Nombre del gasto"
                  value={nuevoGasto.nombre}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, nombre: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={nuevoGasto.monto}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
                  className="form-input"
                />
                <select
                  value={nuevoGasto.categoria}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })}
                  className="form-input"
                >
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={nuevoGasto.mes}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, mes: e.target.value })}
                  className="form-input"
                >
                  {meses.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>

                <label>
                  <input
                    type="checkbox"
                    checked={nuevoGasto.recurrente}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, recurrente: e.target.checked })}
                  />
                  Gasto recurrente
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setMostrarModalGasto(false)}>
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