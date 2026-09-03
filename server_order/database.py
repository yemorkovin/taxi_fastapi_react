import os
from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import create_engine, ForeignKey, String, Text, DECIMAL, Enum as SqlEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker
from dotenv import load_dotenv
#from test_generate_data import run
load_dotenv()

class Base(DeclarativeBase):
    pass
class OrderStatus(str, Enum):
    CREATED = "created"  # Создан, ищет водителя
    ACCEPTED = "accepted"  # Водитель принял заказ
    IN_PROGRESS = "in_progress"  # Клиент в машине, заказ выполняется
    COMPLETED = "completed"  # Успешно завершен
    CANCELLED = "cancelled"  # Отменен
class User(Base):
    """Модель пользователя (клиента)"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Связь один-ко-многим: один клиент -> много заказов
    # Cascade "all, delete-orphan" удалит заказы клиента, если удалить самого клиента
    orders: Mapped[List["Order"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} name='{self.name}'>"

class Driver(Base):
    """Модель водителя"""
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    car_model: Mapped[str] = mapped_column(String(50), nullable=False)
    car_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)

    # Связь один-ко-многим: один водитель -> много заказов
    orders: Mapped[List["Order"]] = relationship(back_populates="driver")

    def __repr__(self) -> str:
        return f"<Driver id={self.id} name='{self.name}' car='{self.car_number}'>"
class Order(Base):
    """Модель заказа"""
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Внешний ключ на клиента. Если клиент удаляется — каскадно удаляем заказ
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Внешний ключ на водителя. Может быть NULL, пока идет поиск.
    # Если водитель удалится из системы, история заказа останется (driver_id станет NULL)
    driver_id: Mapped[Optional[int]] = mapped_column(ForeignKey("drivers.id", ondelete="SET NULL"))

    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    to_address: Mapped[str] = mapped_column(String(255), nullable=False)

    # Точный тип данных для денег в MySQL
    price: Mapped[float] = mapped_column(DECIMAL(10, 2), nullable=False)

    # Статус заказа на базе Enum
    status: Mapped[OrderStatus] = mapped_column(
        SqlEnum(OrderStatus),
        default=OrderStatus.CREATED,
        nullable=False
    )

    # Таймстампы
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    # onupdate автоматически обновляет время при любом изменении строки в БД
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    # Обратные связи для ORM (позволяют писать order.user или order.driver)
    user: Mapped["User"] = relationship(back_populates="orders")
    driver: Mapped[Optional["Driver"]] = relationship(back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order id={self.id} status='{self.status.value}' price={self.price}>"


MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_DB = os.getenv("MYSQL_DB")

# Сборка финальной строки подключения
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
# Создаем Engine (движок)
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Включает логирование всех SQL-запросов в консоль
    pool_recycle=3600,  # Предотвращает разрыв соединения со стороны MySQL по таймауту
    pool_pre_ping=True  # Проверяет живое ли соединение перед отправкой запроса
)

# Создаем фабрику сессий
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


if __name__ == "__main__":
    print("Инициализация базы данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно синхронизированы с MySQL!\n")
    #run()