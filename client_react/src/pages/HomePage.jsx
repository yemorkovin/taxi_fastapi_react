import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { authService } from '../api/post_requests.js';
import { toast } from 'react-toastify'; // Оставляем только импорт функции


const HomePage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [isAuth, setIsAuth] = useState(false);
  const [orderData, setOrderData] = useState({
    from_address: '',
    to_address: '',
    price: ''
});
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState(null);


  useEffect(() => {
      const checkAuth = async () => {
        const authenticated = await authService.isAuthenticated();
        setIsAuth(authenticated);
        if(authenticated){
            const savedRole = localStorage.getItem('role');
            setRole(savedRole);
        }
      };
      checkAuth();

    }, []);

  const handleCreateOrder = async (e) => {
      e.preventDefault()
      setLoading(true)
        for (const key in orderData) {
            const value = orderData[key];

            // Проверяем, что значение пустое (с учетом пробелов)
            if (!value || String(value).trim() === '') {
                 toast.error('Не все обязательные поля заполнены!');
                setLoading(false);
                return;
            }

        }


  }

    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

  return (
    // bg-dark и text-light задают темную тему, min-vh-100 растягивает на весь экран
    <div className="bg-dark text-light min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">

      {/* Декоративное размытое пятно на фоне (кастомный инлайн-стиль для красоты) */}
      <div
        className="position-absolute start-50 top-50 translate-middle rounded-circle"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(13, 110, 253, 0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }}
      />

      {/* Основной контейнер */}
      <main className="container text-center px-4" style={{ zIndex: 1 }}>

        {/* Заголовок с градиентным текстом */}
        <h1 className="display-4 fw-extrabold mb-3 text-white">
          Добро пожаловать в{' '}
          <span
            style={{
              background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Taxi Project
          </span>
        </h1>

        {/* Описание приложения */}
        <p className="lead text-secondary mb-5">
          Делайте свои заказы с удовольствием или же везите их с энтузиазмом.
        </p>



            {isAuth ? (
                <>
                    <div className="row justify-content-center mt-5 form_row" >
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4">Новый заказ</h2>

            <form onSubmit={handleCreateOrder}>
              <div className="mb-3">
                <label htmlFor="from_address" className="form-label">Откуда</label>
                <input
                  type="text"
                  className="form-control"
                  id="from_address"
                  name="from_address"
                  value={orderData.from_address}
                  onChange={handleOrderChange}
                  placeholder="ул. Ленина, д. 10"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="to_address" className="form-label">Куда</label>
                <input
                  type="text"
                  className="form-control"
                  id="to_address"
                  name="to_address"
                  value={orderData.to_address}
                  onChange={handleOrderChange}
                  placeholder="ул. Пушкина, д. 5"
                />
              </div>

                <div className="mb-3">
                <label htmlFor="price" className="form-label">Цена (Р)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={orderData.price}
                  onChange={handleOrderChange}
                  placeholder="500"
                  min='1'
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
                    Создание...
                  </>
                ) : (
                  'Создать'
                )}
              </button>


            </form>
          </div>
        </div>
      </div>
    </div>

                </>
                 ) : (
                <>
                    {/* Контейнер для кнопок */}
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">

          {/* Главная кнопка (Регистрация) */}
           <Link
            to="/register"
            className="btn btn-primary btn-lg px-4 py-3 fw-semibold shadow-sm w-100 w-sm-auto"
            style={{ transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Создать аккаунт
          </Link>

          {/* Ссылка на Вход с атрибутом 'to' */}
          <Link
            to="/login"
            className="btn btn-outline-secondary btn-lg px-4 py-3 fw-semibold text-light border-secondary w-100 w-sm-auto"
          >
            Войти
          </Link>


        </div>
                </>
            )}



      </main>
    </div>
  );
}

export default HomePage
