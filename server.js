const express = require('express');
const app = express();

// db 모듈 가져오기
const db = require('./models/db.js');

// 라우팅 예제
app.get('/users', (req, res) => {
    // 데이터베이스 연결 사용
    db.query('SELECT * FROM User', (error, results, fields) => {
        if (error) {
            // 에러 처리
            console.error(error);
            res.status(500).send('Database error');
        } else {
            // 결과 처리
            res.json(results);
            console.log("유저 데이터 접근");
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
