from fastapi import FastAPI, HTTPException, Depends, Header
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uvicorn
from server_order.schemes import (
    UserCreate, UserResponse, DriverCreate, DriverResponse, OrderCreate, OrderUpdate, OrderResponse, UserLogin,
    DriverAuth
)
from database import (
    User, Driver, Order, OrderStatus,
    SessionLocal, engine, Base
)
from utils import generate_token, password_hash
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Delivery API",
    description="API для сервиса доставки",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # ваш фронтенд
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Получить список всех пользователей"""
    users = db.query(User).all()
    return users


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Получить пользователя по ID"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/auth/verify", response_model=UserResponse)
def verify_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """проверяет валидность токена и возвращает данные пользователя"""

    if not authorization:
        raise HTTPException(status_code=401, detail="authorization header required 1")

    #'Bearer: asklfjakfjasklgjasdklgjaklfg'
    p = authorization.split() #['Bearer:', 'asfaskfjasklfjasklf...']
    if len(p) != 2 or p[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail="authorization header required 2")

    token = p[1]
    user_db = db.query(User).filter(User.token == token).first()

    if not user_db:
        raise  HTTPException(status_code=401, detail="Invalid token")

    return user_db







@app.post("/user/create", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Создать нового пользователя"""
    # 1. Проверяем дубликат
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this phone already exists")

    # 2. Создаем объект и хешируем пароль
    user_data = user.model_dump()
    user_data['password_hash'] = password_hash.hash_password(user.password_hash)
    user_data['token'] = generate_token.generate_simple_rs256_jwt(
        { 'email': user_data['email']}
    )
    db_user = User(**user_data)

    # 3. Сохраняем в БД
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # Теперь у db_user появился сгенерированный БД id

    return db_user

@app.post("/user/login", response_model=UserLogin)
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    user_db = db.query(User).filter(User.email == user.email).first()

    if not user_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not password_hash.check_password(str(user_db.password_hash), user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    new_token = generate_token.generate_simple_rs256_jwt(
        {'email': user_db.email}
    )
    user_db.token = new_token
    db.commit()
    db.refresh(user_db)
    return user_db

'''@app.post("/user/token", response_model=User)
def auth_token(user: UserCreate, db: Session = Depends(get_db)):
    user_db = db.query(User).filter(User.token == user.token).first()

    if not user_db:
        raise HTTPException(status_code=400, detail="Invalid token")

    return user_db
'''


@app.get("/drivers", response_model=List[DriverResponse])
def get_drivers(db: Session = Depends(get_db)):
    """Получить список всех водителей"""
    drivers = db.query(Driver).all()
    return drivers


@app.get("/drivers/active", response_model=List[DriverResponse])
def get_active_drivers(db: Session = Depends(get_db)):
    """Получить список активных водителей"""
    drivers = db.query(Driver).filter(Driver.is_active == True).all()
    return drivers


@app.get("/drivers/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    """Получить водителя по ID"""
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


# Добавьте в api.py после эндпоинта login_user

# Было: def login_driver(driver: DriverCreate, db: Session = Depends(get_db)):
# Стало:
@app.post("/driver/login", response_model=DriverResponse)
def login_driver(driver: DriverAuth, db: Session = Depends(get_db)):
    """Авторизация водителя"""
    # Ищем водителя по телефону
    driver_db = db.query(Driver).filter(Driver.phone == driver.phone).first()
    print(driver_db)

    if not driver_db:
        raise HTTPException(status_code=400, detail="Invalid phone or password")

    # Проверяем пароль (убедитесь, что в модели DriverAuth поле называется password_hash)
    if not password_hash.check_password(str(driver_db.password_hash), driver.password_hash):
        raise HTTPException(status_code=400, detail="Invalid phone or password")

    # Генерируем новый токен
    new_token = generate_token.generate_simple_rs256_jwt(
        {'phone': driver_db.phone, 'role': 'driver'}
    )
    driver_db.token = new_token
    db.commit()
    db.refresh(driver_db)
    return driver_db


@app.post("/driver/verify", response_model=DriverResponse)
def verify_driver_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Проверяет валидность токена водителя и возвращает данные"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    p = authorization.split()
    if len(p) != 2 or p[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = p[1]
    driver_db = db.query(Driver).filter(Driver.token == token).first()

    if not driver_db:
        raise HTTPException(status_code=401, detail="Invalid token")

    return driver_db
@app.post("/drivers", response_model=DriverResponse)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    """Создать нового водителя"""
    existing = db.query(Driver).filter(
        (Driver.phone == driver.phone) | (Driver.car_number == driver.car_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this phone or car number already exists")

    # Хешируем пароль и генерируем токен
    driver_data = driver.model_dump()
    driver_data['password_hash'] = password_hash.hash_password(driver.password_hash)
    driver_data['token'] = generate_token.generate_simple_rs256_jwt(
        {'email': driver.phone}  # используем телефон как идентификатор
    )

    db_driver = Driver(**driver_data)
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

@app.put("/drivers/{driver_id}/status")
def toggle_driver_status(driver_id: int, is_active: bool, db: Session = Depends(get_db)):
    """Включить/выключить водителя"""
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.is_active = is_active
    db.commit()
    return {"message": f"Driver status updated to {is_active}"}


# --- Эндпоинты для заказов ---

@app.get("/orders", response_model=List[OrderResponse])
def get_orders(
        status: Optional[OrderStatus] = None,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """Получить список заказов с возможностью фильтрации по статусу"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(desc(Order.created_at)).limit(limit).all()
    return orders


@app.get("/orders/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    """Получить все заказы пользователя"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return orders


@app.get("/orders/driver/{driver_id}", response_model=List[OrderResponse])
def get_driver_orders(driver_id: int, db: Session = Depends(get_db)):
    """Получить все заказы водителя"""
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    orders = db.query(Order).filter(Order.driver_id == driver_id).all()
    return orders


@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Получить заказ по ID"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/orders", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Создать новый заказ"""
    user = db.get(User, order.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_order = Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@app.put("/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    """Обновить заказ (назначить водителя, изменить статус)"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Проверяем, существует ли водитель, если его назначают
    if order_update.driver_id is not None:
        driver = db.get(Driver, order_update.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        if not driver.is_active:
            raise HTTPException(status_code=400, detail="Driver is not active")
        order.driver_id = order_update.driver_id

    if order_update.status is not None:
        order.status = order_update.status

    db.commit()
    db.refresh(order)
    return order


@app.put("/orders/{order_id}/accept")
def accept_order(order_id: int, driver_id: int, db: Session = Depends(get_db)):
    """Принять заказ водителем"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.CREATED:
        raise HTTPException(status_code=400, detail="Order cannot be accepted in current status")

    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if not driver.is_active:
        raise HTTPException(status_code=400, detail="Driver is not active")

    order.driver_id = driver_id
    order.status = OrderStatus.ACCEPTED
    db.commit()
    db.refresh(order)
    return {"message": "Order accepted", "order": order}


@app.put("/orders/{order_id}/start")
def start_order(order_id: int, db: Session = Depends(get_db)):
    """Начать выполнение заказа"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Order must be accepted before starting")

    order.status = OrderStatus.IN_PROGRESS
    db.commit()
    db.refresh(order)
    return {"message": "Order started", "order": order}


@app.put("/orders/{order_id}/complete")
def complete_order(order_id: int, db: Session = Depends(get_db)):
    """Завершить заказ"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in [OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS]:
        raise HTTPException(status_code=400, detail="Order cannot be completed in current status")

    order.status = OrderStatus.COMPLETED
    db.commit()
    db.refresh(order)
    return {"message": "Order completed", "order": order}


@app.put("/orders/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Отменить заказ"""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Completed order cannot be cancelled")

    order.status = OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)
    return {"message": "Order cancelled", "order": order}


# --- Дополнительные эндпоинты ---

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Получить статистику по системе"""
    users_count = db.query(User).count()
    drivers_count = db.query(Driver).count()
    active_drivers_count = db.query(Driver).filter(Driver.is_active == True).count()
    orders_count = db.query(Order).count()

    orders_by_status = {}
    for status in OrderStatus:
        count = db.query(Order).filter(Order.status == status).count()
        orders_by_status[status.value] = count

    return {
        "users": users_count,
        "drivers": {
            "total": drivers_count,
            "active": active_drivers_count
        },
        "orders": {
            "total": orders_count,
            "by_status": orders_by_status
        }
    }


# Запуск сервера
if __name__ == "__main__":
    # Создаем таблицы при запуске (если их нет)
    Base.metadata.create_all(bind=engine)

    uvicorn.run(
        "api:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )