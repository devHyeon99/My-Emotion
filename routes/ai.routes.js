const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');

require('dotenv').config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const clovaSentimentApiKey = process.env.CLOVA_API_KEY;
const clovaSentimentApiSecret = process.env.CLOVA_API_SECRET;
const clovaSentimentUrl = process.env.CLOVA_API_URL;

router.use(bodyParser.json());

// '/generateResponse' 엔드포인트에 대한 라우트 정의
router.post('/generateResponse', async (req, res) => {
  const userDiary = req.body.userDiary;

  const clovaHeaders = {
    'X-NCP-APIGW-API-KEY-ID': clovaSentimentApiKey,
    'X-NCP-APIGW-API-KEY': clovaSentimentApiSecret,
    'Content-Type': 'application/json',
  };

  const clovaData = {
    content: userDiary,
  };

  try {
    const clovaResponse = await axios.post(clovaSentimentUrl, clovaData, {
      headers: clovaHeaders,
    });

    // 감정 및 감정 비율 추출
    const sentiment = clovaResponse.data.document.sentiment;
    const confidence = clovaResponse.data.document.confidence;

    // 감정을 한글로 변환
    let sentimentKorean;
    switch (sentiment) {
      case 'negative':
        sentimentKorean = '부정';
        break;
      case 'positive':
        sentimentKorean = '긍정';
        break;
      case 'neutral':
        sentimentKorean = '중립';
        break;
      default:
        sentimentKorean = '알 수 없음';
    }

    // 감정 비율을 백분율로 변환
    const negativePercent = confidence.negative.toFixed(2);
    const positivePercent = confidence.positive.toFixed(2);
    const neutralPercent = confidence.neutral.toFixed(2);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '너는 전문적인 심리상담사야. 반말로 답변해. 위로와 공감하는 역할이야.',
        },
        {
          role: 'user',
          content: userDiary,
        },
      ],
      temperature: 1,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const assistantResponse = response.choices[0].message.content;

    const formattedResult = `오늘의 일기 감정: ${sentimentKorean} 입니다. \n비율: 부정: ${negativePercent}%, 긍정: ${positivePercent}%, 중립: ${neutralPercent}%`;

    res.json({
      sentiment: sentimentKorean,
      confidence: formattedResult,
      positivity: positivePercent,
      negativity: negativePercent,
      neutral: neutralPercent,
      assistantResponse,
    });
  } catch (error) {
    // 오류 로깅 시 에러 객체 전체를 출력하여 더 자세한 정보를 얻도록 수정
    console.error('감정 분석 및 응답 생성 중 오류 발생:', error);
    res.status(500).json({ error: '감정 분석 및 응답 생성 중 오류 발생' });
  }
});

module.exports = router;
