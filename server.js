const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors'); // CORS 미들웨어 추가 외부 접근? 허용 하기 위해서 필요

const app = express();
const port = 3000;

// OpenAI API 키 설정
const openai = new OpenAI({
    apiKey: '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'
});
// clova API 키 설정
const clovaSentimentApiKey = "rq9g0mmbcb";
const clovaSentimentApiSecret = "IiB7JpPp39c8y6QeIREWLXh5aeuDYhZWl2ZDrSzF";
const clovaSentimentUrl = "https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze";

app.use(bodyParser.json());
app.use(cors()); // CORS 미들웨어를 사용하여 모든 도메인에서 요청을 허용
app.use(express.static('public'));

app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// 기본 경로('/')로 접근 시 Login.html 출력 젤 첫 로그인 화면을 보여주기 위함.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// '/user.routes' 라우트 파일을 연동 코드 간결화를 위해 라우트 파일 분리
const userRouter = require('./routes/user.routes');
app.use('/', userRouter);

// '/generateResponse' 라우트 파일을 연동
const aiRouter = require('./routes/ai.routes');
app.use('/', aiRouter);


app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
