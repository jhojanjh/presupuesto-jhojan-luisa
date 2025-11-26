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

const API_URL = 'https://budget-api-dt5y.onrender.com/api/budget/main';

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

  // NUEVO: formulario para agregar gasto
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: '',
    monto: '',
    categoria: 'Arriendo',
    mes: 'Diciembre',
    recurrente: true
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({});

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // ================== CARGAR DESDE BACKEND ==================
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setCargando(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener los datos');
        const data = await res.json();

        // Normalizamos datos para que siempre sean numéricos y booleanos
        const gastosDb = (data.gastos || []).map(g => ({
          ...g,
          monto: Number(g.monto) || 0,
          pagado: g.pagado === true || g.pagado === 'true',
          recurrente: g.recurrente === true || g.recurrente === 'true'
        }));

        const aportesDb = (data.aportes || []).map(a => ({
          ...a,
          monto: Number(a.monto) || 0
        }));

        setGastos(gastosDb);
        setAportes(aportesDb);
      } catch (err) {
        setError('No se pudieron cargar los datos del servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchBudget();
  }, []);

  // ================== GUARDAR AUTOMÁTICO ==================
  useEffect(() => {
    if (cargando) return;

    const timeout = setTimeout(async () => {
      try {
        setGuardando(true);
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gastos, aportes }),
        });
      } catch (err) {
        setError('No se pudieron guardar los cambios en el servidor.');
      } finally {
        setGuardando(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [gastos, aportes, cargando]);

  // ================== CÁLCULOS ==================
  const calculos = useMemo(() => {
    const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);

    // AQUÍ está la lógica correcta de pagado
    const gastosPagados = gastos.reduce((sum, g) => {
      return g.pagado ? sum + (g.monto || 0) : sum;
    }, 0);

    const totalAportes = aportes.reduce((sum, a) => sum + (a.monto || 0), 0);

    const aportesPorPersona = {
      'Jhojan': aportes
        .filter(a => a.persona === 'Jhojan')
        .reduce((s, a) => s + (a.monto || 0), 0),
      'Luisa ❤️': aportes
        .filter(a => a.persona === 'Luisa ❤️')
        .reduce((s, a) => s + (a.monto || 0), 0),
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      'Jhojan': aportesPorPersona['Jhojan'] - mitadGastos,
      'Luisa ❤️': aportesPorPersona['Luisa ❤️'] - mitadGastos
    };

    const gastosPorCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + (g.monto || 0);
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
    };
  }, [gastos, aportes]);

  // ================== UTILIDADES ==================
  const formatMoney = num => "$" + (Number(num) || 0).toLocaleString('es-CO');

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // ================== ACCIONES GASTOS ==================
  const togglePago = (id) => {
    setGastos(gastos.map(g => 
      g.id === id ? { ...g, pagado: !g.pagado } : g
    ));
  };

  const eliminarGasto = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este gasto?')) {
      setGastos(prev => prev.filter(g => g.id !== id));
      mostrarExito('🗑️ Gasto eliminado');
    }
  };

  const agregarGasto = () => {
    const monto = parseFloat(nuevoGasto.monto);
    if (!nuevoGasto.nombre.trim() || !monto || monto <= 0) {
      alert('Por favor ingresa un nombre y un monto válido mayor a 0');
      return;
    }

    setGastos([
      ...gastos,
      {
        id: Date.now(),
        nombre: nuevoGasto.nombre.trim(),
        monto,
        categoria: nuevoGasto.categoria,
        mes: nuevoGasto.mes,
        recurrente: nuevoGasto.recurrente,
        pagado: false
      }
    ]);

    setNuevoGasto({
      nombre: '',
      monto: '',
      categoria: 'Arriendo',
      mes: 'Diciembre',
      recurrente: true
    });

    mostrarExito('✅ Gasto agregado');
  };

  // ================== ACCIONES APORTES ==================
  const eliminarAporte = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este aporte?')) {
      setAportes(prev => prev.filter(a => a.id !== id));
      mostrarExito('🗑️ Aporte eliminado');
    }
  };

  const agregarAporte = () => {
    const monto = parseFloat(nuevoAporte.monto);
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setAportes([
      ...aportes,
      {
        id: Date.now(),
        persona: nuevoAporte.persona,
        monto,
        mes: nuevoAporte.mes,
      }
    ]);

    setNuevoAporte({ persona: 'Jhojan', monto: '', mes: 'Diciembre' });
    mostrarExito('✅ Aporte agregado');
  };

  // ================== OTRAS ACCIONES ==================
  const limpiarDatos = () => {
    if (window.confirm('¿Seguro que deseas limpiar todos los registros?')) {
      setGastos([]);
      setAportes([]);
      mostrarExito('Todos los datos fueron limpiados');
    }
  };

  const exportarDatos = () => {
    const data = {
      gastos,
      aportes,
      exportado: new Date().toISOString(),
      totales: calculos
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `presupuesto-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
      alert('Completa todos los campos');
      return;
    }

    setGastos(gastos.map(g =>
      g.id === editandoGasto ? { ...gastoEditado, monto: parseFloat(gastoEditado.monto) } : g
    ));

    setEditandoGasto(null);
    setGastoEditado({});
    mostrarExito('Gasto actualizado');
  };

  const handleEditChange = (field, value) => {
    setGastoEditado(prev => ({ ...prev, [field]: value }));
  };

  // ================== FILTROS / CONSTANTES ==================
  const pagosFiltrados = mesSeleccionado === 'Todos' 
    ? gastos 
    : gastos.filter(g => g.mes === mesSeleccionado);

  const categoriaIcons = {
    'Arriendo': <Home size={18} />,
    'Servicios': <Wifi size={18} />,
    'Transporte': <Car size={18} />,
    'Tarjetas': <CreditCard size={18} />,
  };

  const categoriaColors = {
    'Arriendo': 'blue',
    'Servicios': 'green',
    'Transporte': 'yellow',
    'Tarjetas': 'red',
  };

  const categorias = ['Arriendo', 'Servicios', 'Transporte', 'Tarjetas'];
  const meses = ['Diciembre', 'Enero', 'Febrero'];

  const porcentajePagado = calculos.totalGastos > 0
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

  // ================== RENDER ==================
  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="header">
        <h1>Control de Presupuesto Compartido</h1>
        <p className="header-subtitle">Diciembre 2024 - Febrero 2025</p>

        {mensajeExito && <div className="message-success">{mensajeExito}</div>}
        {error && <div className="message-error">{error}</div>}

        <div className="action-buttons">
          <button className="btn btn-export" onClick={exportarDatos}>
            <Download size={18} /> Exportar
          </button>
          <button className="btn btn-clear" onClick={limpiarDatos}>
            <Trash2 size={18} /> Limpiar
          </button>
        </div>

        {guardando && <p className="saving-indicator">Guardando cambios...</p>}
      </div>

      {/* NAV */}
      <div className="nav-container">
        <button 
          className={`nav-btn ${vistaActual === 'dashboard' ? 'active' : ''}`}
          onClick={() => setVistaActual('dashboard')}
        >
          <BarChart3 size={18} /> Dashboard
        </button>

        <button 
          className={`nav-btn ${vistaActual === 'gastos' ? 'active' : ''}`}
          onClick={() => setVistaActual('gastos')}
        >
          <DollarSign size={18} /> Gastos
        </button>

        <button 
          className={`nav-btn ${vistaActual === 'aportes' ? 'active' : ''}`}
          onClick={() => setVistaActual('aportes')}
        >
          <TrendingUp size={18} /> Aportes
        </button>
      </div>

      {/* ==================== DASHBOARD ==================== */}
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
                subtitle: porcentajePagado !== null 
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
              <div key={index} className="card">
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

          {/* BALANCE */}
          <div className="balance-grid">
            {['Jhojan', 'Luisa ❤️'].map((persona) => (
              <div key={persona} className="card">
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
                      {formatMoney(calculos.aportesPorPersona[persona])}
                    </span>
                  </div>
                  <div className="balance-row">
                    <span className="balance-label">Tu parte (50%):</span>
                    <span className="balance-amount">
                      {formatMoney(calculos.mitadGastos)}
                    </span>
                  </div>
                  <div className="balance-total">
                    <div className="balance-total-row">
                      <span className="balance-total-label">Balance:</span>
                      <span className={`balance-total-amount ${calculos.balance[persona] >= 0 ? 'positive' : 'negative'}`}>
                        {formatMoney(Math.abs(calculos.balance[persona]))}
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
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={24} />
              Gastos por Categoría
            </h3>
            <div>
              {Object.entries(calculos.gastosPorCategoria).map(([categoria, monto]) => {
                const porcentaje = calculos.totalGastos > 0 
                  ? (monto / calculos.totalGastos * 100).toFixed(1)
                  : 0;
                return (
                  <div key={categoria} className="category-item">
                    <div className="category-header">
                      <div className="category-info">
                        <div style={{ color: '#9ca3af' }}>
                          {categoriaIcons[categoria]}
                        </div>
                        <span className="category-name">{categoria}</span>
                      </div>
                      <div className="category-amount">
                        <div className="category-value">{formatMoney(monto)}</div>
                        <div className="category-percentage">{porcentaje}%</div>
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
              })}
            </div>
          </div>
        </>
      )}

      {/* ==================== GASTOS ==================== */}
      {vistaActual === 'gastos' && (
        <>

          {/* FORMULARIO NUEVO GASTO */}
          <div className="card contribution-form">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={24} /> Registrar Nuevo Gasto
            </h3>
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
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={nuevoGasto.mes}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, mes: e.target.value })}
                className="form-input"
              >
                {meses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="nuevo-recurrente"
                  type="checkbox"
                  checked={nuevoGasto.recurrente}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, recurrente: e.target.checked })}
                />
                <label htmlFor="nuevo-recurrente">Gasto recurrente</label>
              </div>

              <button
                onClick={agregarGasto}
                className="btn-add"
              >
                <Plus size={18} />
                Agregar gasto
              </button>
            </div>
          </div>

          {/* FILTRO POR MES */}
          <div className="card">
            <div className="filters">
              <span className="filter-label">Filtrar por mes:</span>
              <div className="filter-buttons">
                {['Todos', 'Diciembre', 'Enero', 'Febrero'].map(mes => (
                  <button
                    key={mes}
                    onClick={() => setMesSeleccionado(mes)}
                    className={`filter-btn ${mesSeleccionado === mes ? 'active' : ''}`}
                  >
                    {mes}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LISTA DE GASTOS */}
          <div className="expense-list">
            {pagosFiltrados.map(gasto => (
              <div 
                key={gasto.id}
                className={`expense-item ${gasto.pagado ? 'paid' : ''}`}
              >
                {editandoGasto === gasto.id ? (
                  // MODO EDICIÓN
                  <div style={{ width: '100%' }}>
                    <div className="edit-form-grid">
                      <div>
                        <label className="edit-form-label">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={gastoEditado.nombre || ''}
                          onChange={(e) => handleEditChange('nombre', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                      
                      <div>
                        <label className="edit-form-label">
                          Monto
                        </label>
                        <input
                          type="number"
                          value={gastoEditado.monto || ''}
                          onChange={(e) => handleEditChange('monto', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                      
                      <div>
                        <label className="edit-form-label">
                          Categoría
                        </label>
                        <select
                          value={gastoEditado.categoria || ''}
                          onChange={(e) => handleEditChange('categoria', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '14px' }}
                        >
                          {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="edit-form-label">
                          Mes
                        </label>
                        <select
                          value={gastoEditado.mes || ''}
                          onChange={(e) => handleEditChange('mes', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '14px' }}
                        >
                          {meses.map(mes => (
                            <option key={mes} value={mes}>{mes}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={guardarEdicion}
                        className="btn-add"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        <Save size={14} />
                        Guardar
                      </button>

                      <button
                        onClick={cancelarEdicion}
                        className="btn-cancel"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id={`recurrente-${gasto.id}`}
                        checked={gastoEditado.recurrente || false}
                        onChange={(e) => handleEditChange('recurrente', e.target.checked)}
                        className="edit-checkbox"
                      />
                      <label htmlFor={`recurrente-${gasto.id}`} className="edit-checkbox-label">
                        Gasto recurrente
                      </label>
                    </div>
                  </div>
                ) : (
                  // MODO VISUALIZACIÓN NORMAL
                  <>
                    <div className="expense-info">
                      <div className={`expense-category ${categoriaColors[gasto.categoria] || 'blue'}`} />
                      <div className="expense-details">
                        <h4>{gasto.nombre}</h4>
                        <div className="expense-meta">
                          <span>{gasto.categoria}</span>
                          <span>•</span>
                          <span>{gasto.mes}</span>
                          {gasto.recurrente && <span className="expense-recurrent">🔄 Recurrente</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="expense-actions">
                      <span className="expense-amount">{formatMoney(gasto.monto)}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!gasto.pagado ? (
                          <button
                            onClick={() => togglePago(gasto.id)}
                            className="btn-mark-paid"
                          >
                            ✅ Marcar como pagado
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePago(gasto.id)}
                            className="btn-mark-unpaid"
                          >
                            ❌ Marcar como no pagado
                          </button>
                        )}

                        <button
                          onClick={() => iniciarEdicion(gasto)}
                          className="btn-edit"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => eliminarGasto(gasto.id)}
                          className="btn-delete"
                          title="Eliminar gasto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ==================== APORTES ==================== */}
      {vistaActual === 'aportes' && (
        <div>
          {/* Formulario agregar aporte */}
          <div className="card contribution-form">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={24} style={{ color: '#4ade80' }} />
              Registrar Nuevo Aporte
            </h3>
            <div className="form-grid">
              <select
                value={nuevoAporte.persona}
                onChange={(e) => setNuevoAporte({...nuevoAporte, persona: e.target.value})}
                className="form-input"
              >
                <option>Jhojan</option>
                <option>Luisa ❤️</option>
              </select>
              
              <input
                type="number"
                placeholder="Monto"
                value={nuevoAporte.monto}
                onChange={(e) => setNuevoAporte({...nuevoAporte, monto: e.target.value})}
                className="form-input"
              />
              
              <select
                value={nuevoAporte.mes}
                onChange={(e) => setNuevoAporte({...nuevoAporte, mes: e.target.value})}
                className="form-input"
              >
                <option>Diciembre</option>
                <option>Enero</option>
                <option>Febrero</option>
              </select>
              
              <button
                onClick={agregarAporte}
                className="btn-add"
              >
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de aportes */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Historial de Aportes</h3>
            <div className="contribution-list">
              {aportes.map(aporte => (
                <div key={aporte.id} className="contribution-item">
                  <div className="contribution-person">
                    <div className={`person-avatar ${aporte.persona === 'Jhojan' ? 'purple' : 'pink'}`}>
                      <Users size={24} className="text-white" />
                    </div>
                    <div className="person-info">
                      <h4>{aporte.persona}</h4>
                      <p>{aporte.mes}</p>
                    </div>
                  </div>
                  <div className="contribution-actions">
                    <span className="contribution-amount">{formatMoney(aporte.monto)}</span>
                    <button 
                      className="btn-contribution-delete"
                      onClick={() => eliminarAporte(aporte.id)}
                      title="Eliminar aporte"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {aportes.length === 0 && (
                <div className="empty-state">
                  No hay aportes registrados aún. ¡Agrega el primero!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BudgetTracker;
