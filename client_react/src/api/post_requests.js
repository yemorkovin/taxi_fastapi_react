import api from "./api.js";


export const authService = {
    async register(userData){
        const isAuth = await authService.isAuthenticated()

        if(isAuth){
         window.location.href = '/';
        }

        const response = await api.post('/user/create', userData);


        if(response.data){
            console.log(JSON.stringify(response.data))
            localStorage.setItem('user', JSON.stringify(response.data))
            localStorage.setItem('token', response.data.token);

            return {success: true, data: response.data}
        }
    },

    async login(credentials) {
        const isAuth = await authService.isAuthenticated()

        if(isAuth){
            window.location.href = '/';
        }
    try {
      const response = await api.post('/user/login', credentials);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('role', 'user');

        return { success: true, data: response.data };
      }
      return { success: false, error: 'Ошибка входа' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Ошибка входа'
      };
    }
  },
    async isAuthenticated() {
        const token = localStorage.getItem('token');
        if(!token){
            //this.logout()
            return false
        }
        const res = await this.verifyToken()
        console.log(`fun: isAuthenticated ${res.data}`)
        console.log(res)
        return res.success
        },
    getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
    async verifyToken(){
        try {
            const token = localStorage.getItem('token');
            if (!token) {

                return {success: false, error: 'No token found'}
            }

            const response = await api.post('/auth/verify', null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                return {success: true, data: response.data}
            }

            return {success: false, error: 'Invalid token'};
        }catch (error){
            console.error(error)
            if(error.response?.status === 401){
                this.logout();
            }
            return {
                success: false,
                error: error.response?.data?.detail || 'Ошибка проверки токена'
            }
        }
    },
    async registerDriver(userData) {
        try {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                window.location.href = '/';
                return { success: false, error: 'Вы уже авторизованы' };
            }

            const response = await api.post('/drivers', userData);

            if (response.data) {
                console.log('Водитель зарегистрирован:', JSON.stringify(response.data));
                return { success: true, data: response.data };
            }
            return { success: false, error: 'Ошибка регистрации водителя' };
        } catch (error) {
            console.error('Driver registration error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Ошибка регистрации водителя'
            };
        }
    },
    async loginDriver(credentials) {
        try {
            const response = await api.post('/driver/login', credentials);
            console.log(response)
            if (response.data) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('driver', JSON.stringify(response.data));
                localStorage.setItem('role', 'driver');
                return { success: true, data: response.data };
            }
            return { success: false, error: 'Ошибка входа' };
        } catch (error) {
            console.error('Driver login error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Ошибка входа'
            };
        }
    },

    // Проверка токена водителя
    async verifyDriverToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'No token found' };
            }

            const response = await api.post('/driver/verify', null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                localStorage.setItem('driver', JSON.stringify(response.data));
                return { success: true, data: response.data };
            }

            return { success: false, error: 'Invalid token' };
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                this.logout();
            }
            return {
                success: false,
                error: error.response?.data?.detail || 'Ошибка проверки токена'
            };
        }
    },
    // Получить текущего водителя
    getCurrentDriver() {
        const driverStr = localStorage.getItem('driver');
        if (driverStr) {
            try {
                return JSON.parse(driverStr);
            } catch {
                return null;
            }
        }
        return null;
    },
    // Проверка авторизации водителя
    async isDriverAuthenticated() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'driver') {
            return false;
        }
        const res = await this.verifyDriverToken();
        return res.success;
    },
    // Выход
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('driver');
        localStorage.removeItem('role');
    }

}
