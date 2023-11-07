const express = require('express');
const db = require('../models/db.js'); // db 모듈 가져오기

const router = express.Router();

// '/users' 엔드포인트에 대한 라우트 정의
router.get('/users', (req, res) => {
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

router.post('/login', (req, res) => {
    const providedEmail = req.body.email; // 사용자가 입력한 이메일
    console.log(providedEmail)
    db.query('SELECT * FROM User WHERE email = ?', [providedEmail], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Database error');
        } else {
            if (results.length > 0) {
                console.log("사용자 데이터 찾음");
                res.json({ message: '로그인 성공' });
            } else {
                console.log("사용자 데이터 없음");
                res.status(404).json({ message: '사용자를 찾을 수 없습니다. 회원가입을 시도합니다.' });
            }
        }
    });
});

router.post('/register', (req, res) => {
    const userData = req.body; // 클라이언트에서 보낸 데이터 (이메일, 이름)

    // 여기에서 userData에 있는 이메일과 이름을 데이터베이스에 추가하는 쿼리를 실행
    db.query('INSERT INTO User (email, name) VALUES (?, ?)', [userData.email, userData.name], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('회원가입에 실패했습니다.');
        } else {
            res.json({ message: '회원가입 성공' });
        }
    });
});

// 일기 저장
router.post('/saveDiary', (req, res) => {
    const { email, date, content, answer, emotion } = req.body;

    db.query('INSERT INTO Diary (email, date, content, answer, emotion) VALUES (?, ?, ?, ?, ?)', [email, date, content, answer, emotion], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('일기 저장에 실패했습니다.');
        } else {
            res.json({ message: '일기 저장 성공' });
        }
    });
});

module.exports = router;
