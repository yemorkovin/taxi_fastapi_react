// client/src/components/Navbar.jsx
import React, {useEffect, useState} from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../api/post_requests.js';
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const driver = authService.getCurrentDriver();
  const [isAuth, setIsAuth] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем авторизацию пользователя
      const authenticated = await authService.isAuthenticated();
      setIsAuth(authenticated);

      // Проверяем авторизацию водителя
      const driverAuthenticated = await authService.isDriverAuthenticated();
      setIsDriver(driverAuthenticated);

      // Определяем имя для отображения
      if (authenticated && user) {
        setUserName(user.name || 'Пользователь');
      } else if (driverAuthenticated && driver) {
        setUserName(driver.name || 'Водитель');
      }
    };
    checkAuth();
  }, [user, driver]);

  const handleLogout = () => {
    authService.logout();
    setIsAuth(false);
    setIsDriver(false);
    setUserName('');

    toast.success('Вы вышли из системы!', {
      autoClose: 3000,
    });

    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-success" to="/">
          🚕 Taxi Project
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Переключить навигацию"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                to="/"
              >
                Главная
              </NavLink>
            </li>

            {/* Ссылки для водителей */}
            {isDriver && (
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  to="/driver/dashboard"
                >
                  📊 Мои заказы
                </NavLink>
              </li>
            )}

            {/* Ссылки для пользователей */}
            {isAuth && !isDriver && (
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  to="/orders"
                >
                  📋 Мои заказы
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {isAuth || isDriver ? (
              <>
                {/* Отображение роли и имени */}
                <li className="nav-item">
                  <span className={`navbar-text me-3 ${isDriver ? 'text-success' : 'text-info'}`}>
                    {isDriver ? '🚗' : '👤'} {userName}
                    <small className="ms-1 text-secondary">
                      ({isDriver ? 'водитель' : 'клиент'})
                    </small>
                  </span>
                </li>

                {/* Ссылка на профиль */}
                {isDriver ? (
                  <li className="nav-item me-2">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      to="/driver/profile"
                    >
                      Профиль
                    </NavLink>
                  </li>
                ) : (
                  <li className="nav-item me-2">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      to="/profile"
                    >
                      Профиль
                    </NavLink>
                  </li>
                )}

                {/* Кнопка выхода */}
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/register"
                  >
                    Регистрация
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/login"
                  >
                    Войти
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link text-success ${isActive ? 'active' : ''}`}
                    to="/driver/login"
                  >
                    🚗 Водитель
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;