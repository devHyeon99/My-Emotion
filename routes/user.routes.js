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
    db.query('INSERT INTO User (email, name, pairingvalue, pairingemail) VALUES (?, ?, ?, ?)', [userData.email, userData.name, 0, ""], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('회원가입에 실패했습니다.');
        } else {
            res.json({ message: '회원가입 성공' });
        }
    });
});

router.post('/leave', (req, res) => {
    const { email } = req.body;

    // Daily 테이블에서 해당 이메일에 관련된 데이터 삭제
    const deleteDailyQuery = `DELETE FROM Daily WHERE email = ?`;
    db.query(deleteDailyQuery, [email], (error, results) => {
        if (error) {
            console.error('Daily 테이블에서 삭제 중 에러:', error);
            res.status(500).json({ message: '서버 에러 발생' });
            return;
        }

        // Diary 테이블에서 해당 이메일에 관련된 데이터 삭제
        const deleteDiaryQuery = `DELETE FROM Diary WHERE email = ?`;
        db.query(deleteDiaryQuery, [email], (error, results) => {
            if (error) {
                console.error('Diary 테이블에서 삭제 중 에러:', error);
                res.status(500).json({ message: '서버 에러 발생' });
                return;
            }

            // Letter 테이블에서 해당 이메일에 관련된 데이터 삭제
            const deleteLetterQuery = `DELETE FROM Letter WHERE email = ?`;
            db.query(deleteLetterQuery, [email], (error, results) => {
                if (error) {
                    console.error('Letter 테이블에서 삭제 중 에러:', error);
                    res.status(500).json({ message: '서버 에러 발생' });
                    return;
                }

                // User 테이블에서 해당 이메일에 관련된 데이터 삭제 또는 공백으로 설정
                const updatePairingQuery = `UPDATE User SET pairingemail = '', pairingvalue = 0 WHERE pairingemail = ?`;
                db.query(updatePairingQuery, [email], (error, results) => {
                    if (error) {
                        console.error('User 테이블에서 업데이트 중 에러:', error);
                        res.status(500).json({ message: '서버 에러 발생' });
                        return;
                    }

                    const deleteEmailQuery = `DELETE FROM User WHERE email = ?`;
                    db.query(deleteEmailQuery, [email], (error, results) => {
                        if (error) {
                            console.error('User 테이블에서 삭제 중 에러:', error);
                            res.status(500).json({ message: '서버 에러 발생' });
                            return;
                        }
                        // 모든 작업이 성공적으로 완료되었을 때 클라이언트에 응답
                        res.status(200).json({ message: '회원 탈퇴가 성공적으로 처리되었습니다.' });
                    });
                });
            });
        });
    });
});


    ////////// 일기관련 라우터들
    // 일기 저장
    router.post('/saveDiary', (req, res) => {
        const { email, date, content, answer, positivity, negativity, neutral } = req.body;

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
                db.query('INSERT INTO Diary (email, date, content, answer, positivity, negativity, neutral) VALUES (?, ?, ?, ?, ?, ?, ?)'
                    , [email, date, content, answer, positivity, negativity, neutral], (error, results, fields) => {
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
        const searchContent = req.body.content;

        let query = 'SELECT *, answer, positivity, negativity, neutral FROM Diary WHERE email = ?';

        // 만약 검색어가 제공되면 WHERE 절에 추가
        if (searchContent) {
            query += ' AND (content LIKE ? OR date LIKE ?)';
        }

        // 최신 날짜순으로 정렬
        query += ' ORDER BY date DESC';

        db.query(query, [userEmail, `%${searchContent}%`, `%${searchContent}%`], (err, results) => {
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

        const query = 'SELECT id, start, end, content FROM Daily WHERE email = ? AND date = ? ORDER BY start';

        db.query(query, [userEmail, scheduleDate], (err, results) => {
            if (err) {
                console.error('일정을 가져오는 중 에러 발생:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('일정이 성공적으로 가져왔습니다.');

                const formattedResults = results.map(schedule => ({
                    id: schedule.id, // id 필드 포함
                    start: schedule.start.slice(0, 5), // 시간 형식 변환
                    end: schedule.end.slice(0, 5), // 시간 형식 변환
                    content: schedule.content
                }));

                res.json({ data: formattedResults }); 
            }
        });
    });

    // 일정 삭제 API
    router.delete('/deleteSchedule/:scheduleId', (req, res) => {
        const scheduleId = req.params.scheduleId;

        const deleteQuery = 'DELETE FROM Daily WHERE id = ?';

        db.query(deleteQuery, [scheduleId], (err, result) => {
            if (err) {
                console.error('일정 삭제 중 에러 발생:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('일정이 성공적으로 삭제되었습니다.');
                res.json({ message: '일정이 성공적으로 삭제되었습니다.' });
            }
        });
    });

    // 일정 수정할거 가져오기
    router.get('/getSchedule/:id', (req, res) => {
        const scheduleId = req.params.id;

        const query = 'SELECT * FROM Daily WHERE id = ?';

        db.query(query, [scheduleId], (err, results) => {
            if (err) {
                console.error('일정을 가져오는 중 에러 발생:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('일정이 성공적으로 가져왔습니다.');

                const schedule = {
                    id: results[0].id,
                    date: results[0].date,
                    start: results[0].start,
                    end: results[0].end,
                    content: results[0].content
                };

                res.json({ schedule });
            }
        });
    });

    router.put('/updateSchedule/:scheduleId', (req, res) => {
        const scheduleId = req.params.scheduleId;
        const { email, date, startTime, endTime, content } = req.body;
        const newSchedule = { start: startTime, end: endTime };
        const getExistingSchedulesQuery = 'SELECT * FROM Daily WHERE email = ? AND date = ?';

        db.query(getExistingSchedulesQuery, [email, date, scheduleId], (err, results) => {
            if (err) {
                console.error('기존 일정을 가져오는 중 에러 발생:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const schedules = results;

                // 겹치는 일정이 있는지 확인하는 함수
                function isOverlap(newSchedule, schedules) {
                    for (const schedule of schedules) {
                        if (String(schedule.id) !== scheduleId) {
                            // 클라이언트가 보낸 일정과 데이터베이스의 일정이 겹치는지 확인
                            if (
                                newSchedule.start == schedule.start ||
                                (newSchedule.start < schedule.end && newSchedule.end > schedule.start) ||
                                newSchedule.start > newSchedule.end
                            ) {
                                return true; // 겹치는 일정이 있음
                            }
                        }

                        if (String(schedule.id) === scheduleId && (newSchedule.start > newSchedule.end ||
                            newSchedule.start === newSchedule.end)) {
                            return true; // 겹치는 일정이 있음
                        }
                    }
                    return false; // 겹치는 일정이 없음
                }

                // 새로운 일정을 추가하기 전에 겹치는 일정이 있는지 확인
                if (isOverlap(newSchedule, schedules)) {
                    console.log('충돌이 발생합니다. 일정을 업데이트할 수 없습니다.');
                    res.json({ success: false, message: '충돌이 발생합니다. 일정을 업데이트할 수 없습니다.' });
                } else {
                    // 겹치는 일정이 없는 경우, 기존 일정 업데이트
                    const updateScheduleQuery = 'UPDATE Daily SET date = ?, start = ?, end = ?, content = ? WHERE id = ?';
                    db.query(updateScheduleQuery, [date, startTime, endTime, content, scheduleId], (err, result) => {
                        if (err) {
                            console.error('일정 업데이트 중 에러 발생:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            console.log('일정이 성공적으로 업데이트되었습니다.');
                            res.json({ success: true });
                        }
                    });
                }
            }
        });
    });

    // 일기 감정 분석 통계
    router.post('/weekly-stats', async (req, res) => {
        try {
            const userEmail = req.body.email;
            const selectedMonth = new Date(req.body.month); // 오늘 날짜를 가져옴
            // 해당 월의 감정 데이터를 가져오는 쿼리 (Diary 테이블에서 해당 이메일의 감정 데이터를 가져옴) MONTH()를 이용하면 MM만 걸러서 date가져옴
            const query = 'SELECT date, positivity, negativity, neutral FROM Diary WHERE email = ? AND MONTH(date) = MONTH(?)';

            db.query(query, [userEmail, selectedMonth], (err, results) => {
                if (err) {
                    console.error('감정 데이터를 가져오는 중 에러 발생:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else if (results.length === 0) {
                    console.log("사용자가 작성하지 않은 달의 일기 통계를 불러옴.")
                    res.status(404).json({ error: 'No data available for the selected month' });
                } else {
                    console.log("정상적으로 감정 데이터를 불러왔습니다.")
                    // 주차별로 감정 데이터 통계 계산
                    const weeklyStats = {};

                    results.forEach(entry => {
                        const week = getWeekNumber(entry.date); // 주차 계산 함수를 통해 주차 구하기

                        // 주차별로 데이터 누적
                        if (!weeklyStats[week]) {
                            weeklyStats[week] = {
                                totalPositivity: 0,
                                totalNegativity: 0,
                                totalNeutral: 0,
                                count: 0
                            };
                        }

                        // 주차에 맞는 일 수 만큼 반복되어서 각각의 감정들 계산 누적됨.
                        weeklyStats[week].totalPositivity += parseFloat(entry.positivity);
                        weeklyStats[week].totalNegativity += parseFloat(entry.negativity);
                        weeklyStats[week].totalNeutral += parseFloat(entry.neutral);
                        weeklyStats[week].count += 1;
                    });

                    // 여기서 이제 각 주차별 평균값을 계산함.
                    const formattedWeeklyStats = {};
                    Object.keys(weeklyStats).forEach(week => {
                        const avgPositivity = (weeklyStats[week].totalPositivity / weeklyStats[week].count).toFixed(2);
                        const avgNegativity = (weeklyStats[week].totalNegativity / weeklyStats[week].count).toFixed(2);
                        const avgNeutral = (weeklyStats[week].totalNeutral / weeklyStats[week].count).toFixed(2);

                        formattedWeeklyStats[`Week ${week}`] = {
                            avgPositivity,
                            avgNegativity,
                            avgNeutral
                        };
                    });
                    res.json(formattedWeeklyStats);
                }
            });
        } catch (err) {
            res.status(500).send('Error occurred while processing request');
        }

        // 주차 계산하는 함수
        function getWeekNumber(date) {
            const currentDate = new Date(date);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const firstDay = startOfMonth.getDay();
            const daysToAdd = firstDay <= 4 ? 1 - firstDay : 8 - firstDay;

            startOfMonth.setDate(startOfMonth.getDate() + daysToAdd);
            const numberOfDays = Math.floor((currentDate - startOfMonth) / (24 * 3600 * 1000));

            return Math.floor(numberOfDays / 7) + 1;
        }
    });

    // 페어링 관련 라우터들
    // 페어링 체크
    router.post('/checkPairing', (req, res) => {
        const userEmail = req.body.email;

        const query = 'SELECT * FROM User WHERE email = ?';

        db.query(query, [userEmail], (err, results) => {
            if (err) {
                console.error('페어링 확인 중 오류 발생:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                if (results.length > 0) {
                    const pairingValue = results[0].pairingvalue === 0 ? 0 : 1;
                    if (pairingValue === 1) {
                        const pairingEmail = results[0].pairingemail;

                        const pairingQuery = 'SELECT name FROM User WHERE email = ?'; // 이름을 찾기 위한 새로운 쿼리
                        db.query(pairingQuery, [pairingEmail], (error, pairingResults) => {
                            if (error) {
                                console.error('페어링 사용자 정보 확인 중 오류 발생:', error);
                                res.status(500).json({ error: 'Internal Server Error' });
                            } else {
                                if (pairingResults.length > 0) {
                                    const pairingName = pairingResults[0].name;
                                    res.json({ pairingValue, pairingEmail, pairingName });
                                } else {
                                    res.json({ pairingValue, pairingEmail });
                                }
                            }
                        });
                    } else {
                        res.json({ pairingValue });
                    }
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            }
        });
    });


    // 페어링 연결 라우터
    router.post('/pairing', (req, res) => {
        const userEmail = req.body.email;
        const pairingEmail = req.body.pairEmail;

        const updateUserQuery = 'UPDATE User SET pairingvalue = 1, pairingemail = ? WHERE email = ?';
        const updatePairQuery = 'UPDATE User SET pairingvalue = 1, pairingemail = ? WHERE email = ?';

        db.query(updateUserQuery, [pairingEmail, userEmail], (err1, result1) => {
            if (err1) {
                console.error('페어링 업데이트 중 오류 발생:', err1);
                res.status(500).json({ success: false });
            } else {
                db.query(updatePairQuery, [userEmail, pairingEmail], (err2, result2) => {
                    if (err2) {
                        console.error('페어링 업데이트 중 오류 발생:', err2);
                        res.status(500).json({ success: false });
                    } else {
                        res.json({ success: true });
                    }
                });
            }
        });
    });

    // 편지 작성 라우터
    router.post('/letterSend', (req, res) => {
        const Data = req.body; // 클라이언트에서 보낸 데이터 (이메일, 이름)

        // 여기에서 userData에 있는 이메일과 이름을 데이터베이스에 추가하는 쿼리를 실행
        db.query('INSERT INTO Letter (email, head, content, `check`) VALUES (?, ?, ?, ?)', [Data.email, Data.head, Data.content, 0], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('편지 작성에 실패했습니다..');
            } else {
                res.json({ message: '편지 작성 완료..' });
            }
        });
    });

    // 편지 가져오는 라우터
    router.get('/letters/:email', (req, res) => {
        const email = req.params.email;

        // 해당 이메일에 맞는 편지들을 가져오는 쿼리를 실행
        db.query('SELECT * FROM Letter WHERE email = ? ORDER BY `check` ASC, id DESC', [email], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('편지 가져오기 실패..');
            } else {
                if (results.length === 0) {
                    // 편지가 없는 경우
                    res.status(404).json({ message: '해당 이메일로 작성된 편지가 없습니다.' });
                } else {
                    // 편지가 있는 경우
                    res.json({ letters: results });
                }
            }
        });
    });

    // 편지 읽음 처리 라우터
    router.put('/letters/:id/markAsRead', (req, res) => {
        const letterId = req.params.id;

        db.query('UPDATE Letter SET `check` = 1 WHERE id = ?', [letterId], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('읽음 표시에 실패했습니다.');
            } else {
                res.status(200).send('편지를 읽음으로 표시했습니다.');
            }
        });
    });

    // 읽지 않은 편지 카운트 알려주는 라우터
    router.get('/unreadLetters/:email', (req, res) => {
        const email = req.params.email;

        db.query('SELECT COUNT(*) AS unreadCount FROM Letter WHERE email = ? AND `check` = 0', [email], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: '안 읽은 편지 수를 가져오는 데 실패했습니다.' });
            } else {
                const unreadCount = results[0].unreadCount || 0;
                res.json({ unreadCount });
            }
        });
    });


    module.exports = router;
