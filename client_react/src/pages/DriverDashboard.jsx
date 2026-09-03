// client/src/pages/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../api/post_requests.js';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalEarnings: 0
  });
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isDriverAuthenticated();
      if (!isAuth) {
        navigate('/driver/login');
        return;
      }
      const currentDriver = authService.getCurrentDriver();
      setDriver(currentDriver);
      await fetchData(currentDriver);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async (currentDriver) => {
    try {
      const token = localStorage.getItem('token');

      // Получаем все заказы
      const ordersResponse = await fetch('http://localhost:8000/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.ok) {
        const allOrders = await ordersResponse.json();

        // Фильтруем заказы для этого водителя
        const driverOrders = allOrders.filter(order => order.driver_id === currentDriver?.id);
        setOrders(driverOrders);

        // Доступные заказы (без водителя и со статусом created)
        const available = allOrders.filter(order =>
          order.driver_id === null && order.status === 'created'
        );
        setAvailableOrders(available);

        // Подсчет статистики
        const completed = driverOrders.filter(o => o.status === 'completed');
        const cancelled = driverOrders.filter(o => o.status === 'cancelled');
        const totalEarnings = completed.reduce((sum, o) => sum + Number(o.price), 0);

        setStats({
          totalOrders: driverOrders.length,
          completedOrders: completed.length,
          cancelledOrders: cancelled.length,
          totalEarnings: totalEarnings
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка загрузки данных');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm('Вы уверены, что хотите принять этот заказ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/orders/${orderId}/accept?driver_id=${driver.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Заказ принят!');
        // Обновляем данные
        await fetchData(driver);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Ошибка при принятии заказа');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Произошла ошибка');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Подтвердите завершение заказа')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Заказ завершен!');
        await fetchData(driver);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Ошибка при завершении заказа');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Произошла ошибка');
    }
  };

  const handleStartOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/orders/${orderId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Заказ в пути!');
        await fetchData(driver);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Ошибка при начале выполнения');
      }
    } catch (error) {
      console.error('Error starting order:', error);
      toast.error('Произошла ошибка');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Вы уверены, что хотите отменить заказ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Заказ отменен');
        await fetchData(driver);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Ошибка при отмене заказа');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Произошла ошибка');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'created': 'bg-info',
      'accepted': 'bg-primary',
      'in_progress': 'bg-warning',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    const statusLabels = {
      'created': 'Создан',
      'accepted': 'Принят',
      'in_progress': 'В пути',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return {
      className: statusMap[status] || 'bg-secondary',
      label: statusLabels[status] || status
    };
  };

  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    } else if (activeTab === 'completed') {
      return orders.filter(o => o.status === 'completed');
    } else if (activeTab === 'cancelled') {
      return orders.filter(o => o.status === 'cancelled');
    }
    return orders;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div>
      {/* Приветствие */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-5 text-light">🚗 Панель водителя</h1>
          <p className="text-secondary">
            Добро пожаловать, <span className="text-success fw-bold">{driver?.name}</span>!
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/driver/profile" className="btn btn-outline-info">
            👤 Профиль
          </Link>
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              authService.logout();
              toast.info('Вы вышли из системы');
              navigate('/');
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card bg-secondary bg-opacity-25 border-secondary">
            <div className="card-body text-center">
              <h5 className="text-secondary">Всего заказов</h5>
              <h2 className="text-light">{stats.totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-secondary bg-opacity-25 border-secondary">
            <div className="card-body text-center">
              <h5 className="text-secondary">Выполнено</h5>
              <h2 className="text-success">{stats.completedOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-secondary bg-opacity-25 border-secondary">
            <div className="card-body text-center">
              <h5 className="text-secondary">Отменено</h5>
              <h2 className="text-danger">{stats.cancelledOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-secondary bg-opacity-25 border-secondary">
            <div className="card-body text-center">
              <h5 className="text-secondary">Заработано</h5>
              <h2 className="text-warning">{stats.totalEarnings} ₽</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Доступные заказы */}
      {availableOrders.length > 0 && (
        <div className="mb-4">
          <h4 className="text-success mb-3">📋 Доступные заказы ({availableOrders.length})</h4>
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Откуда</th>
                  <th>Куда</th>
                  <th>Цена</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {availableOrders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.from_address}</td>
                    <td>{order.to_address}</td>
                    <td className="text-warning">{order.price} ₽</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Принять
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {availableOrders.length > 5 && (
              <p className="text-secondary text-center">
                И еще {availableOrders.length - 5} заказов доступно
              </p>
            )}
          </div>
        </div>
      )}

      {/* Мои заказы */}
      <div>
        <h4 className="text-light mb-3">📦 Мои заказы</h4>

        {/* Табы */}
        <ul className="nav nav-tabs nav-tabs-dark mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'active' ? 'active text-light' : 'text-secondary'}`}
              onClick={() => setActiveTab('active')}
            >
              Активные
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'completed' ? 'active text-light' : 'text-secondary'}`}
              onClick={() => setActiveTab('completed')}
            >
              Завершенные
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'cancelled' ? 'active text-light' : 'text-secondary'}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Отмененные
            </button>
          </li>
        </ul>

        {filteredOrders.length === 0 ? (
          <div className="card bg-secondary bg-opacity-10 border-secondary">
            <div className="card-body text-center text-secondary py-5">
              <h4>Нет заказов</h4>
              <p className="mb-0">
                {activeTab === 'active' ? 'Нет активных заказов' :
                 activeTab === 'completed' ? 'Нет завершенных заказов' :
                 'Нет отмененных заказов'}
              </p>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Откуда</th>
                  <th>Куда</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.from_address}</td>
                      <td>{order.to_address}</td>
                      <td>{order.price} ₽</td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {order.status === 'accepted' && (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleStartOrder(order.id)}
                            >
                              Начать
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              Завершить
                            </button>
                          )}
                          {(order.status === 'created' || order.status === 'accepted') && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Отменить
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <span className="text-success">✅ Завершен</span>
                          )}
                          {order.status === 'cancelled' && (
                            <span className="text-danger">❌ Отменен</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;