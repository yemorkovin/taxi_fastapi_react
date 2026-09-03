import base64
import json
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

def generate_simple_rs256_jwt(payload: dict) -> str:
    # 1. Автоматически создаем пару ключей в памяти (2048 бит)
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    # 2. Функция для кодирования в Base64URL
    def b64url(data: dict) -> str:
        json_str = json.dumps(data, separators=(',', ':')).encode('utf-8')
        return base64.urlsafe_b64encode(json_str).decode('utf-8').rstrip('=')

    # 3. Собираем заголовок и полезную нагрузку (БЕЗ даты и срока действия)
    header_b64 = b64url({"alg": "RS256", "typ": "JWT"})
    payload_b64 = b64url(payload)
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')

    # 4. Подписываем данные приватным ключом
    signature = private_key.sign(
        signing_input,
        padding.PKCS1v15(),
        hashes.SHA256()
    )

    # 5. Кодируем подпись и собираем готовый токен
    signature_b64 = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    return f"{header_b64}.{payload_b64}.{signature_b64}"
