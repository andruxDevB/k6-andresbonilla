import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Carga .CSV
const loginData = new SharedArray('login credentials', function () {
    return open('../data/credentials.csv')
        .split('\n')
        .slice(1)
        .map(function (line) {
            const [username, password] = line.split(',');
            return {
                username: username ? username.trim() : '',
                password: password ? password.trim() : ''
            };
        })
        .filter(function (item) {
            return item.username && item.password;
        });
});

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '3m', target: 25 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1500'],
        http_req_failed: ['rate<0.03'],
    },
};

export default function () {
    const credentials = loginData[Math.floor(Math.random() * loginData.length)];

    const headers = { 'Content-Type': 'application/json' };
    const payload = JSON.stringify({
        username: credentials.username,
        password: credentials.password,
    });

    const response = http.post('https://fakestoreapi.com/auth/login', payload, { headers, timeout: '60s' });

    check(response, {
        'Status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        'Response time < 1500ms': (r) => r.timings.duration < 1500,
        'Response has token': (r) => {
            try { return r.json('token') !== undefined; } catch (e) { return false; }
        },
    });

    sleep(0.5);
}
