import axios from 'axios';
axios.defaults.baseURL = process.env.NODE_ENV==='production' ? process.env.VUE_APP_API : "/api";

export function request(configData) {                   
    return new Promise((resolve, reject) => {
        axios(configData).then((res) => {
            resolve(res.data)
        }).catch(function(err) {
            reject(err)
        });
    });
}