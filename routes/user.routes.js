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

    // 이미 작성한 일기가 있는지 확인
    db.query('SELECT * FROM Diary WHERE email = ? AND date = ?', [email, date], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('일기 저장에 실패했습니다.');
        } else if (results.length > 0) {
            // 이미 작성한 일기가 있는 경우
            res.status(400).send('이미 오늘 일기를 작성했습니다.');
        } else {
            // 이미 작성한 일기가 없는 경우, 새로운 일기를 저장
            db.query('INSERT INTO Diary (email, date, content, answer, emotion) VALUES (?, ?, ?, ?, ?)', [email, date, content, answer, emotion], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('일기 저장에 실패했습니다.');
                } else {
                    res.json({ message: '일기 저장 성공' });
                }
            });
        }
    });
});

// 일기체크
router.post('/checkDiary', (req, res) => {
    const userEmail = req.body.email;
    const checkDate = req.body.date;

    const query = 'SELECT * FROM Diary WHERE email = ? AND date = ?';

    db.query(query, [userEmail, checkDate], (err, results) => {
        if (err) {
            console.error('일기 확인 중 오류 발생:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length > 0) {
                res.json({ exists: true }); // 일기가 존재하는 경우
            } else {
                res.json({ exists: false }); // 일기가 존재하지 않는 경우
            }
        }
    });
});

// 서버에서 다이어리 목록을 가져오는 엔드포인트
router.post('/diaryList', (req, res) => {
    const userEmail = req.body.email;
    const searchContent = req.body.content; // 추가: 검색어 받기

    let query = 'SELECT *, answer, emotion FROM Diary WHERE email = ?';

    // 만약 검색어가 제공되면 WHERE 절에 추가
    if (searchContent) {
        query += ' AND content LIKE ?';
    }

    // 최신 날짜순으로 정렬
    query += ' ORDER BY date DESC';

    db.query(query, [userEmail, `%${searchContent}%`], (err, results) => {
        if (err) {
            console.error('다이어리 목록을 가져오는 데 실패했습니다.', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // 결과를 JSON 형식으로 반환
            res.json(results);
        }
    });
});

// 일정 작성 API
router.post('/createSchedule', (req, res) => {
    const { email, date, startTime, endTime, content } = req.body;
    const newSchedule = { start: startTime, end: endTime };
    const getExistingSchedulesQuery = 'SELECT * FROM Daily WHERE email = ? AND date = ?';

    db.query(getExistingSchedulesQuery, [email, date], (err, results) => {
        if (err) {
            console.error('기존 일정을 가져오는 중 에러 발생:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // 기존 일정 목록
            const schedules = results;

            // 겹치는 일정이 있는지 확인하는 함수
            function isOverlap(newSchedule, schedules) {
                for (const schedule of schedules) {
                    console.log(newSchedule.start, newSchedule.end, schedule.start, schedule.end)
                    if (
                        newSchedule.start == schedule.start ||
                        (newSchedule.start < schedule.end && newSchedule.end > schedule.start || newSchedule.start > newSchedule.end)
                    ) {
                        return true; // 겹치는 일정이 있음
                    }
                }
                return false; // 겹치는 일정이 없음
            }

            // 새로운 일정을 추가하기 전에 겹치는 일정이 있는지 확인
            if (isOverlap(newSchedule, schedules)) {
                console.log('충돌이 발생합니다. 일정을 추가할 수 없습니다.');
                res.json({ success: false, message: '충돌이 발생합니다. 일정을 추가할 수 없습니다.' });
            } else {
                // 겹치는 일정이 없는 경우, 새로운 일정을 추가
                const insertScheduleQuery = 'INSERT INTO Daily (email, date, start, end, content) VALUES (?, ?, ?, ?, ?)';
                db.query(insertScheduleQuery, [email, date, startTime, endTime, content], (err, result) => {
                    if (err) {
                        console.error('일정 추가 중 에러 발생:', err);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('일정이 성공적으로 추가되었습니다.');
                        res.json({ success: true });
                    }
                });
            }
        }
    });
});


// 일정 요청 API
router.post('/getSchedules', (req, res) => {
    const userEmail = req.body.email;
    const scheduleDate = req.body.date;

    const query = 'SELECT * FROM Daily WHERE email = ? AND date = ? ORDER BY start'

    db.query(query, [userEmail, scheduleDate], (err, results) => {
        if (err) {
            console.error('일정을 가져오는 중 에러 발생:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('일정이 성공적으로 가져왔습니다.');

            const formattedResults = results.map(schedule => ({
                start: schedule.start.slice(0, 5), // 시간 형식 변환
                end: schedule.end.slice(0, 5), // 시간 형식 변환
                content: schedule.content
            }));

            res.json({ data: formattedResults }); // 데이터를 객체 안에 담아 보내기
        }
    });
});

module.exports = router;
