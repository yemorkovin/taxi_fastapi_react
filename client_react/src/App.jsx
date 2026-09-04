import Navbar from './components/Navbar';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterDriverPage from "./pages/RegisterDriverPage.jsx";
import RegisterPage from "./pages/RegisterPage";
import DriverLoginPage from "./pages/DriverLoginPage.jsx";
import DriverDashboard from "./pages/DriverDashboard";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark">
      <Navbar />
      <div className="container flex-grow-1 py-4">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/driver" element={<RegisterDriverPage />} />
          <Route path="/driver/login" element={<DriverLoginPage />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />

          {/* Защищенные маршруты для клиентов */}




        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          pauseOnHover
          draggable
        />
      </div>

      {/* Футер */}
      <footer className="bg-dark text-secondary text-center py-3 border-top border-secondary">
        <div className="container">
          <small>© 2026 Taxi Project. Все права защищены.</small>
        </div>
      </footer>
    </div>
  );
}

export default App;