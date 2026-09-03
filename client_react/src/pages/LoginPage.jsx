// client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/post_requests.js';

import { toast } from 'react-toastify'; // Оставляем только импорт функции


const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password_hash: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password_hash) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }
    const loginData = {
      phone: '',
      name: '',
      email: formData.email,
      password_hash: formData.password_hash
    };

    const result = await authService.login(loginData);
    if (result.success) {
      //navigate('/');

       // Вызываем тостер успеха
      toast.success('Авторизация успешна! Перенаправление...', {
        autoClose: 3000, // Закроется через 3 секунды
      });

      // Запускаем редирект ровно через 3 секунды
      setTimeout(() => {
        //navigate('/');
        window.location.href = '/';
      }, 3000);


    } else {
      setError(result.error || 'Ошибка входа');
    }

    setLoading(false);
  };

  return (

    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4">Вход</h2>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password_hash" className="form-label">Пароль</label>
                <input
                  type="password"
                  className="form-control"
                  id="password_hash"
                  name="password_hash"
                  value={formData.password_hash}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </button>

              <div className="text-center">
                <span className="text-muted">Нет аккаунта?</span>{' '}
                <Link to="/register" className="text-decoration-none">Зарегистрироваться</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
};

export default LoginPage;