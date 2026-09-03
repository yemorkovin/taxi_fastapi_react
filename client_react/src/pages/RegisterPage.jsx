import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {authService} from "../api/post_requests.js";
import {toast} from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password_hash: '',
    phone: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value // Копируем старое состояние и обновляем измененное поле
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await authService.register(formData);
    toast.success('Вы вышли из системы!', {
        autoClose: 3000, // Закроется через 3 секунды
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
   window.location.href = '/';


  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 rounded-3">
            <div className="card-body p-4 p-sm-5">
              <h2 className="card-title text-center mb-4 fw-bold">Регистрация</h2>

              <form onSubmit={handleSubmit}>
                {/* Поле: Имя пользователя */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingUsername"
                    placeholder="Имя пользователя"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingUsername">Имя пользователя</label>
                </div>

                {/* Поле: Email */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingEmail"
                    placeholder="name@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingEmail">Email адрес</label>
                </div>

                {/* Поле: Пароль */}
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
                  />
                  <label htmlFor="floatingPassword">Пароль</label>
                </div>

                {/* Кнопка отправки */}
                <button className="btn btn-primary w-100 py-2.5 fw-bold" type="submit">
                  Зарегистрироваться
                </button>

                {/* Ссылка на логин */}
                <div className="text-center mt-4">
                  <span className="text-muted">Уже есть аккаунт? </span>
                  <Link to="/login" className="text-decoration-none">Войти</Link><br/>
                  <Link className="text-decoration-none" to="/register/driver">Регистрация для водителя</Link>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;