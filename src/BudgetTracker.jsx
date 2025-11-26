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

const mesIconos = {
  Diciembre: '🎄',
  Enero: '🎆',
  Febrero: '💘',
};

const BudgetTracker = () => {
  const [gastos, setGastos] = useState([]);
  const [aportes, setAportes] = useState([]);

  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mesSeleccionado, setMesSeleccionado] = useState('Todos');
  const [nuevoAporte, setNuevoAporte] = useState({ persona: 'Jhojan', monto: '', mes: 'Diciembre' });
  const [mensajeExito, setMensajeExito] = useState('');
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({});

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const [tema, setTema] = useState('dark');

  // Aplicar clase al body para tema claro / oscuro
  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(tema === 'dark' ? 'dark-theme' : 'light-theme');
  }, [tema]);

  // Cargar datos
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setCargando(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener los datos');
        const data = await res.json();
        setGastos(data.gastos || []);
        setAportes(data.aportes || []);
      } catch (err) {
        setError('No se pudieron cargar los datos del servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchBudget();
  }, []);

  // Guardado automático
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

  const calculos = useMemo(() => {
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const gastosPagados = gastos.filter(g => g.pagado).reduce((sum, g) => sum + g.monto, 0);
    const totalAportes = aportes.reduce((sum, a) => sum + a.monto, 0);

    const aportesPorPersona = {
      'Jhojan': aportes.filter(a => a.persona === 'Jhojan').reduce((s, a) => s + a.monto, 0),
      'Luisa ❤️': aportes.filter(a => a.persona === 'Luisa ❤️').reduce((s, a) => s + a.monto, 0),
    };

    const mitadGastos = totalGastos / 2;

    const balance = {
      'Jhojan': aportesPorPersona['Jhojan'] - mitadGastos,
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
      gastosPorCategoria,
    };
  }, [gastos, aportes]);

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

  const eliminarAporte = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este aporte?')) {
      setAportes(prev => prev.filter(a => a.id !== id));
      mostrarExito('🗑️ Aporte eliminado');
    }
  };

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
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
    mostrarExito('Aporte agregado');
  };

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

  const formatMoney = num => "$" + num.toLocaleString('es-CO');

  const gastosFiltrados = mesSeleccionado === 'Todos' 
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

          <button
            className="btn-theme-toggle"
            onClick={() => setTema(prev => prev === 'dark' ? 'light' : 'dark')}
          >
            {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
        </div>

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

      {/* DASHBOARD */}
      {vistaActual === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total Gastos</span>
                  <div className="stat-icon bg-blue-500"><DollarSign size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalGastos)}</div>
                <div className="stat-subtitle">Suma de todos los gastos</div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Total Aportado</span>
                  <div className="stat-icon bg-green-500"><TrendingUp size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.totalAportes)}</div>
                <div className="stat-subtitle">Entre los dos</div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Pagado</span>
                  <div className="stat-icon bg-emerald-500"><Check size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.gastosPagados)}</div>
                <div className="stat-subtitle">Gastos ya cubiertos</div>
              </div>
            </div>

            <div className="card fade-in">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-title">Saldo</span>
                  <div className="stat-icon bg-purple-500"><PieChart size={20} /></div>
                </div>
                <div className="stat-value">{formatMoney(calculos.saldoDisponible)}</div>
                <div className="stat-subtitle">Disponible</div>
              </div>
            </div>
          </div>

          {/* BALANCE */}
          <div className="balance-grid">
            {['Jhojan', 'Luisa ❤️'].map(persona => (
              <div className="card fade-in" key={persona}>
                <div className="balance-header">
                  <div className={`balance-avatar ${persona === 'Jhojan' ? 'purple' : 'pink'}`}>
                    <Users size={24} />
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
                    <span className="balance-amount">{formatMoney(calculos.mitadGastos)}</span>
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

          {/* POR CATEGORIA */}
          <div className="card fade-in">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
              Gastos por Categoría
            </h3>

            {Object.entries(calculos.gastosPorCategoria).map(([categoria, monto]) => {
              const porcentaje = calculos.totalGastos ? (monto / calculos.totalGastos * 100).toFixed(1) : 0;

              return (
                <div className="category-item" key={categoria}>
                  <div className="category-header">
                    <div className="category-info">
                      <span className="category-icon">
                        {categoriaIcons[categoria]}
                      </span>
                      <span className="category-name">{categoria}</span>
                    </div>

                    <div className="category-amount">
                      <div className="category-value">{formatMoney(monto)}</div>
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

      {/* GASTOS */}
      {vistaActual === 'gastos' && (
        <>
          <div className="card fade-in">
            <div className="filters">
              <span className="filter-label">Filtrar por mes:</span>
              <div className="filter-buttons">
                {['Todos', ...meses].map(mes => (
                  <button
                    key={mes}
                    className={`filter-btn ${mesSeleccionado === mes ? 'active' : ''}`}
                    onClick={() => setMesSeleccionado(mes)}
                  >
                    {mes !== 'Todos' && (
                      <span className="month-icon">{mesIconos[mes]}</span>
                    )}
                    {mes}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="expense-list">
            {gastosFiltrados.map(gasto => (
              <div className={`expense-item fade-in ${gasto.pagado ? 'paid' : ''}`} key={gasto.id}>
                
                {/* Modo edición */}
                {editandoGasto === gasto.id ? (
                  <div style={{ width: '100%' }}>
                    <div className="edit-form-grid">
                      <div>
                        <label className="edit-form-label">Nombre</label>
                        <input 
                          className="form-input" 
                          type="text"
                          value={gastoEditado.nombre}
                          onChange={e => handleEditChange('nombre', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="edit-form-label">Monto</label>
                        <input 
                          className="form-input" 
                          type="number"
                          value={gastoEditado.monto}
                          onChange={e => handleEditChange('monto', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="edit-form-label">Categoría</label>
                        <select 
                          className="form-input"
                          value={gastoEditado.categoria}
                          onChange={e => handleEditChange('categoria', e.target.value)}
                        >
                          {categorias.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="edit-form-label">Mes</label>
                        <select 
                          className="form-input"
                          value={gastoEditado.mes}
                          onChange={e => handleEditChange('mes', e.target.value)}
                        >
                          {meses.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      <button className="btn-add" onClick={guardarEdicion}>
                        <Save size={14} /> Guardar
                      </button>

                      <button className="btn-cancel" onClick={cancelarEdicion}>
                        <X size={14} /> Cancelar
                      </button>

                    </div>
                  </div>
                ) : (
                  <>
                    {/* Modo visual */}
                    <div className="expense-info">
                      <div 
                        className={`expense-category ${categoriaColors[gasto.categoria]}`}
                      />

                      <div className="expense-details">
                        <h4>{gasto.nombre}</h4>
                        <div className="expense-meta">
                          <span>{gasto.categoria}</span>
                          <span>•</span>
                          <span>
                            {mesIconos[gasto.mes]} {gasto.mes}
                          </span>
                          {gasto.recurrente && (
                            <span className="expense-recurrent">🔄 Recurrente</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="expense-actions">
                      <span className="expense-amount">
                        {formatMoney(gasto.monto)}
                      </span>

                      <button 
                        className={gasto.pagado ? 'btn-mark-unpaid' : 'btn-mark-paid'}
                        onClick={() => togglePago(gasto.id)}
                      >
                        {gasto.pagado ? '❌ No pagado' : '✅ Pagado'}
                      </button>

                      <button className="btn-edit" onClick={() => iniciarEdicion(gasto)}>
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
                No hay gastos registrados para este mes.
              </div>
            )}
          </div>
        </>
      )}

      {/* APORTES */}
      {vistaActual === 'aportes' && (
        <>
          <div className="card contribution-form fade-in">
            <h3 style={{ marginBottom: 16 }}>Registrar Aporte</h3>

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
                {meses.map(c => (
                  <option key={c}>
                    {mesIconos[c]} {c}
                  </option>
                ))}
              </select>

              <button className="btn-add" onClick={agregarAporte}>
                <Plus size={18} /> Agregar
              </button>
            </div>
          </div>

          <div className="card fade-in">
            <h3 style={{ marginBottom: 16 }}>Historial de Aportes</h3>

            <div className="contribution-list">
              {aportes.map(a => (
                <div className="contribution-item" key={a.id}>
                  
                  <div className="contribution-person">
                    <div className={`person-avatar ${a.persona === 'Jhojan' ? 'purple' : 'pink'}`}>
                      <Users size={24} className="text-white" />
                    </div>

                    <div className="person-info">
                      <h4>{a.persona}</h4>
                      <p>{mesIconos[a.mes]} {a.mes}</p>
                    </div>
                  </div>

                  <div className="contribution-actions">
                    <span className="contribution-amount">{formatMoney(a.monto)}</span>
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
                <div className="empty-state">Aún no hay aportes registrados.</div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default BudgetTracker;
