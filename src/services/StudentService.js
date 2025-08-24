// src/api/studentService.js or any component
import axiosInstance from '../Api/axiosInstance';

const API_URL = 'http://localhost:8080/students';

export const fetchStudents = () => {
    return axiosInstance.get('/students');
};

const getAll = (page = 0, size = 5, sort = 'id,asc', nameFilter = '') => {
    let url = `${API_URL}?page=${page}&size=${size}&sort=${sort}`;
    if (nameFilter) {
        url += `&nameFilter=${nameFilter}`;
    }
    return axiosInstance.get(url);
};

const getById = (id) => axiosInstance.get(`${API_URL}/${id}`);
const create = (student) => axiosInstance.post(API_URL, student);
const update = (id, student) => axiosInstance.put(`${API_URL}/${id}`, student);
const remove = (id) => axiosInstance.delete(`${API_URL}/${id}`);

export default { getAll, getById, create, update, remove };
