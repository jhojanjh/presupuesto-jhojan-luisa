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

// CAMBIA ESTA URL CUANDO SUBAS EL BACKEND
const API_URL = 'https://budget-api-dt5y.onrender.com/api/budget/main';

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

  // 1. Cargar datos desde el backend al iniciar
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setCargando(true);
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error('Error al obtener los datos');
        }
        const data = await res.json();
        setGastos(data.gastos || []);
        setAportes(data.aportes || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchBudget();
  }, []);

  // 2. Guardar automáticamente cada vez que cambien gastos/aportes (debounce)
  useEffect(() => {
    if (cargando) return; // no guardar mientras carga

    const timeout = setTimeout(async () => {
      try {
        setGuardando(true);
        const res = await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gastos, aportes }),
        });
        if (!res.ok) {
          throw new Error('Error al guardar datos');
        }
        await res.json();
      } catch (err) {
        console.error(err);
        setError('No se pudieron guardar los cambios en el servidor.');
      } finally {
        setGuardando(false);
      }
    }, 800); // 0.8 s

    return () => clearTimeout(timeout);
  }, [gastos, aportes, cargando]);

  const calculos = useMemo(() => {
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const gastosPagados = gastos.filter(g => g.pagado).reduce((sum, g) => sum + g.monto, 0);
    const totalAportes = aportes.reduce((sum, a) => sum + a.monto, 0);
    
    const aportesPorPersona = {
      'Jhojan': aportes.filter(a => a.persona === 'Jhojan').reduce((sum, a) => sum + a.monto, 0),
      'Luisa ❤️': aportes.filter(a => a.persona === 'Luisa ❤️').reduce((sum, a) => sum + a.monto, 0)
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
      saldoDisponible: totalAportes - gastosPagados,
      aportesPorPersona,
      balance,
      gastosPorCategoria,
      mitadGastos
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

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const agregarAporte = () => {
    const monto = parseFloat(nuevoAporte.monto);
    
    if (!monto || monto <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    setAportes([...aportes, {
      id: Date.now(),
      persona: nuevoAporte.persona,
      monto: monto,
      mes: nuevoAporte.mes
    }]);
    setNuevoAporte({ persona: 'Jhojan', monto: '', mes: 'Diciembre' });
    mostrarExito(`✅ Aporte de ${formatMoney(monto)} agregado exitosamente`);
  };

  const limpiarDatos = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
      setGastos([]);
      setAportes([]);
      mostrarExito('🧹 Datos limpiados (se guardará en el servidor).');
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presupuesto-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarExito('📊 Datos exportados exitosamente');
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
    if (!gastoEditado.nombre || !gastoEditado.monto || gastoEditado.monto <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    setGastos(gastos.map(g => 
      g.id === editandoGasto ? { ...gastoEditado, monto: parseFloat(gastoEditado.monto) } : g
    ));
    
    setEditandoGasto(null);
    setGastoEditado({});
    mostrarExito('✅ Gasto actualizado exitosamente');
  };

  const handleEditChange = (field, value) => {
    setGastoEditado(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatMoney = (num) => {
    return '$' + num.toLocaleString('es-CO');
  };

  const gastosFiltrados = mesSeleccionado === 'Todos' 
    ? gastos 
    : gastos.filter(g => g.mes === mesSeleccionado);

  const categoriaIcons = {
    'Arriendo': <Home size={18} />,
    'Servicios': <Wifi size={18} />,
    'Transporte': <Car size={18} />,
    'Tarjetas': <CreditCard size={18} />
  };

  const categoriaColors = {
    'Arriendo': 'blue',
    'Servicios': 'green',
    'Transporte': 'yellow',
    'Tarjetas': 'red'
  };

  const getCategoryColor = (categoria) => {
    return categoriaColors[categoria] || 'blue';
  };

  const categorias = ['Arriendo', 'Servicios', 'Transporte', 'Tarjetas'];
  const meses = ['Diciembre', 'Enero', 'Febrero'];

  const porcentajePagado = calculos.totalGastos > 0
    ? ((calculos.gastosPagados / calculos.totalGastos) * 100).toFixed(1)
    : null;

  if (cargando) {
    return (
      <div className="app-container">
        <p>Cargando datos del servidor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>Control de Presupuesto Compartido</h1>
        <p className="header-subtitle">Diciembre 2024 - Febrero 2025</p>

        {mensajeExito && (
          <div className="message-success">
            {mensajeExito}
          </div>
        )}

        {error && (
          <div className="message-error">
            {error}
          </div>
        )}

        <div className="action-buttons">
          <button onClick={exportarDatos} className="btn btn-export">
            <Download size={18} />
            Exportar
          </button>
          <button onClick={limpiarDatos} className="btn btn-clear">
            <Trash2 size={18} />
            Limpiar
          </button>
        </div>

        {guardando && (
          <p className="saving-indicator">Guardando cambios en el servidor...</p>
        )}
      </div>

      {/* Navigation */}
      <div className="nav-container">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'gastos', label: 'Gastos', icon: DollarSign },
          { id: 'aportes', label: 'Aportes', icon: TrendingUp }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setVistaActual(item.id)}
            className={`nav-btn ${vistaActual === item.id ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Vista Dashboard */}
      {vistaActual === 'dashboard' && (
        <div>
          {/* Stats Grid */}
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

          {/* Balance Section */}
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

          {/* Gastos por Categoría */}
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
        </div>
      )}

      {/* Vista Gastos */}
      {vistaActual === 'gastos' && (
        <div>
          {/* Filtros */}
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

          {/* Lista de gastos */}
          <div className="expense-list">
            {gastosFiltrados.map(gasto => (
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
                      <div className={`expense-category ${getCategoryColor(gasto.categoria)}`} />
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
        </div>
      )}

      {/* Vista Aportes */}
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
                  <span className="contribution-amount">{formatMoney(aporte.monto)}</span>
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
