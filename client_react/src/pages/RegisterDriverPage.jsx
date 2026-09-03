import React, { useState } from 'react';
import { toast } from "react-toastify";
import { authService } from '../api/post_requests.js';
import { useNavigate } from 'react-router-dom';

export default function DriverRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    car_model: '',
    car_number: '',
    password_hash: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // 1. Валидация телефона (РФ: +7 или 8, затем 10 цифр)
    const phoneRegex = /^(?:\+7|8)?[\s\-()]*?\d{3}[\s\-()]*?\d{3}[\s\-()]*?\d{2}[\s\-()]*?\d{2}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Введите корректный номер телефона (например, +7 (999) 123-45-67)', {
        autoClose: 3000,
      });
      return false;
    }

    // 2. Валидация модели машины
    if (formData.car_model.trim().length < 2 || /^\d+$/.test(formData.car_model)) {
      toast.error('Укажите корректную марку и модель авто', {
        autoClose: 3000,
      });
      return false;
    }

    // 3. Валидация госномера (РФ стандарт: А123АА77 или А123АА177)
    const carNumberRegex = /^[A-Za-z0-9]{6}$/;
    const cleanCarNumber = formData.car_number.replace(/\s+/g, '');
    if (!carNumberRegex.test(cleanCarNumber)) {
      toast.error('Неверный формат госномера (Пример: А123АА)', {
        autoClose: 3000,
      });
      return false;
    }

    // 4. Проверка пароля
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
      const result = await authService.registerDriver(formData);

      if (result.success) {
        toast.success('Регистрация водителя прошла успешно!', {
          autoClose: 3000,
        });
        // Очищаем форму
        setFormData({
          name: '',
          phone: '',
          car_model: '',
          car_number: '',
          password_hash: ''
        });
        // Перенаправляем на главную
        setTimeout(() => navigate('/'), 1500);
      } else {
        toast.error(result.error || 'Ошибка регистрации', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      toast.error('Произошла ошибка при регистрации', {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 rounded-3">
            <div className="card-body p-4 p-sm-5">
              <h2 className="card-title text-center mb-4 fw-bold">Регистрация водителя</h2>
              <form onSubmit={handleSubmit} className="p-3">

                {/* Имя водителя */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingName"
                    placeholder="Имя водителя"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingName">ФИО водителя</label>
                </div>

                {/* Телефон */}
                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control"
                    id="floatingPhone"
                    placeholder="+7 (999) 999-99-99"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingPhone">Номер телефона</label>
                </div>

                {/* Марка и модель авто */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingCarModel"
                    placeholder="Hyundai Solaris"
                    name="car_model"
                    value={formData.car_model}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingCarModel">Марка и модель автомобиля</label>
                </div>

                {/* Госномер авто */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingCarNumber"
                    placeholder="А123АА"
                    name="car_number"
                    value={formData.car_number}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingCarNumber">Государственный номер</label>
                </div>

                {/* Пароль */}
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Пароль"
                    name="password_hash"
                    value={formData.password_hash}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                  <label htmlFor="floatingPassword">Пароль для входа (мин. 6 символов)</label>
                </div>

                <button
                  className="btn btn-primary w-100 py-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Регистрация...
                    </>
                  ) : (
                    'Стать водителем'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}