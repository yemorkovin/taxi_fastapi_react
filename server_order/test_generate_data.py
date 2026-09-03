from database import User, Driver, SessionLocal, Order, OrderStatus

def run():
    with SessionLocal() as session:
        print("--- Шаг 1: Наполнение базы базовыми данными ---")

        existing_user = session.query(User).filter_by(phone="+79991112233").first()

        if not existing_user:
            client = User(name="Александр", phone="+79991112233")
            driver = Driver(name="Дмитрий", phone="+79995556677", car_model="Skoda Octavia", car_number="О777ОО77")
            session.add_all([client, driver])
            session.commit()  # Коммитим, чтобы получить сгенерированные MySQL ID
            print(f"Созданы: {client} и {driver}")
        else:
            client = existing_user
            driver = session.query(Driver).filter_by(phone="+79995556677").first()
            print(f"Используем существующих: {client} и {driver}")

        print("\n--- Шаг 2: Создание нового заказа клиентом ---")
        # Клиент делает заказ. Поле driver_id пока не заполнено (NULL)
        new_order = Order(
            user_id=client.id,
            from_address="Москва, ул. Тверская, д. 5",
            to_address="Аэропорт Шереметьево, Терминал С",
            price=1500.50
            # status по умолчанию станет OrderStatus.CREATED
        )
        session.add(new_order)
        session.commit()
        print(f"Заказ успешно размещен: {new_order}")

        print("\n--- Шаг 3: Назначение водителя на заказ ---")
        # Извлекаем заказ из базы данных
        order_in_db = session.get(Order, new_order.id)
        if order_in_db:
            # Назначаем водителя и переводим статус
            order_in_db.driver_id = driver.id
            order_in_db.status = OrderStatus.ACCEPTED
            session.commit()
            print(f"Водитель принял заказ! Текущее состояние: {order_in_db}")
            print(f"Имя назначенного водителя (через ORM связь): {order_in_db.driver.name}")

        print("\n--- Шаг 4: Завершение заказа ---")
        # Симулируем успешное окончание поездки
        if order_in_db:
            order_in_db.status = OrderStatus.COMPLETED
            session.commit()
            print(f"Поездка завершена. Итоговый статус: {order_in_db.status.value}")
            print(f"Время обновления строки в БД (updated_at): {order_in_db.updated_at}")