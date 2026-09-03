import subprocess
import sys
import time


def run_services():
    print("🚀 Запуск сервисов базы данных и API...")
    db_process = subprocess.Popen([sys.executable, "database.py"])
    time.sleep(2)
    api_process = subprocess.Popen([sys.executable, "api.py"])
    try:
        db_process.wait()
        api_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Остановка сервисов...")
        db_process.terminate()
        api_process.terminate()
        print("✅ Все процессы успешно остановлены.")

if __name__ == "__main__":
    run_services()
