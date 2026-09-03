// client/src/pages/DriverLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../api/post_requests.js';

const DriverLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password_hash: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Проверяем, не авторизован ли уже водитель
  useEffect(() => {
    const checkAuth = async () => {
      const isDriver = await authService.isDriverAuthenticated();
      if (isDriver) {
        navigate('/driver/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Очистка телефона от лишних символов для валидации
    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');

    // Проверка телефона (РФ: +7 или 8, затем 10 цифр)
    const phoneRegex = /^(?:\+7|8)?\d{10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Введите корректный номер телефона (например, +7 999 123-45-67)', {
        autoClose: 3000,
      });
      return false;
    }

    // Проверка пароля
    if (formData.password_hash.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов', {
        autoClose: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Подготавливаем данные для отправки
      const loginData = {
        phone: formData.phone.replace(/[\s\-()]/g, ''), // Очищаем телефон
        password_hash: formData.password_hash
      };

      const result = await authService.loginDriver(loginData);

      if (result.success) {
        toast.success('🚗 Добро пожаловать, водитель!', {
          autoClose: 3000,
        });

        // Небольшая задержка перед переходом
        setTimeout(() => {
          navigate('/driver/dashboard');
        }, 500);
      } else {
        toast.error(result.error || 'Ошибка входа. Проверьте телефон и пароль', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Произошла ошибка при входе. Попробуйте позже.', {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для форматирования телефона при вводе
  const formatPhoneNumber = (value) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '');

    // Ограничиваем длину
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+7${cleaned}`;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow border-0 rounded-3 bg-secondary bg-opacity-10">
          <div className="card-body p-4 p-sm-5">
            {/* Заголовок с иконкой */}
            <div className="text-center mb-4">
              <div className="display-1 mb-3">🚗</div>
              <h2 className="card-title fw-bold text-light">Вход для водителя</h2>
              <p className="text-secondary">Войдите в свой аккаунт водителя</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Телефон */}
              <div className="form-floating mb-3">
                <input
                  type="tel"
                  className="form-control bg-dark text-light border-secondary"
                  id="floatingPhone"
                  placeholder="+7 (999) 999-99-99"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  disabled={loading}
                />
                <label htmlFor="floatingPhone">📱 Номер телефона</label>
              </div>

              {/* Пароль с кнопкой показа */}
              <div className="form-floating mb-4 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-dark text-light border-secondary"
                  id="floatingPassword"
                  placeholder="Пароль"
                  name="password_hash"
                  value={formData.password_hash}
                  onChange={handleChange}
                  required
                  minLength="6"
                  disabled={loading}
                />
                <label htmlFor="floatingPassword">🔒 Пароль</label>
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ zIndex: 10 }}
                  tabIndex="-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                className="btn btn-success w-100 py-2 mb-3 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Вход...
                  </>
                ) : (
                  '🚗 Войти как водитель'
                )}
              </button>

              {/* Ссылки */}
              <div className="text-center mb-2">
                <span className="text-muted">Еще не зарегистрированы?</span>{' '}
                <Link to="/register/driver" className="text-decoration-none text-success fw-bold">
                  Стать водителем
                </Link>
              </div>

              <hr className="border-secondary my-3" />

              <div className="text-center">
                <Link to="/login" className="text-decoration-none text-info">
                  👤 Войти как клиент
                </Link>
                <span className="text-secondary mx-2">|</span>
                <Link to="/" className="text-decoration-none text-light">
                  🏠 На главную
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="text-center text-secondary mt-3">
          <small>
            💡 Водительский аккаунт создается отдельно через регистрацию
          </small>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginPage;