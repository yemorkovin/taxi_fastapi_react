import hashlib
import os


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    # Используем pbkdf2_hmac — он работает везде и не требует много памяти
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"


def check_password(stored_password: str, provided_password: str) -> bool:
    salt_hex, key_hex = stored_password.split(':')
    salt = bytes.fromhex(salt_hex)
    original_key = bytes.fromhex(key_hex)

    # Хэшируем введенный пароль с той же солью
    new_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)

    # Простое и надежное сравнение байт
    return original_key == new_key



