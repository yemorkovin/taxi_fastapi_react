import api from "./api.js";

async function getUsers() {
    try {
        const response = await api.get('/users',);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

async function getUserById(id) {
    try {
        const response = await api.get(`/users/${id}`,);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

async function getDrivers() {
    try {
        const response = await api.get('/drivers',);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

async function getDriversActive() {
    try {
        const response = await api.get('/drivers/active',);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

async function getDriversById(id) {
    try {
        const response = await api.get(`/drivers/${id}`,);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

async function getOrders() {
    try {
        const response = await api.get('/orders',);
        console.log('Данные с сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
    }
}

