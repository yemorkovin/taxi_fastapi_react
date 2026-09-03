from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from database import (
    OrderStatus
)

class UserCreate(BaseModel):
    phone: str
    name: str
    password_hash: str
    email: str

class UserLogin(BaseModel):
    name: str
    email: str
    token: str
    #password_hash: str
    phone: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone: str
    name: str
    email: str
    created_at: datetime
    token: str



class DriverAuth(BaseModel):
    phone: str
    password_hash: str


class DriverCreate(BaseModel):
    name: str
    phone: str
    car_model: str
    car_number: str
    password_hash: str = Field(..., min_length=6, description="Пароль должен содержать минимум 6 символов")

class DriverResponse(BaseModel):
    id: int
    phone: str
    name: str
    car_model: str
    car_number: str
    is_active: bool
    token: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: int
    from_address: str
    to_address: str
    price: float


class OrderUpdate(BaseModel):
    driver_id: Optional[int] = None
    status: Optional[OrderStatus] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    driver_id: Optional[int]
    from_address: str
    to_address: str
    price: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
