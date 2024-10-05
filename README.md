## 종합설계2 프로젝트

|프로젝트명|ME(My Emotion)
|:-----|:-------------
|프로젝트 선정 배경|최근 OpenAI에 대한 관심이 높아져 웹 애플리케이션과의 통합 가능성을 탐구했습니다.<br/>Ncloud의 CLOVA Sentiment API를 활용해 텍스트 분석을 통해 일기를 작성하면 감정 상태를 정확히 파악할 수 있었습니다.<br/>또한, 일기를 작성한 후 OpenAI API를 이용해 위로, 공감, 조언을 제공하면 심리 상담 효과가 있을 것으로 기대했습니다.<br/>이런 기능을 통해 누군가의 답변을 받는 재미를 느껴 일기 쓰는 습관을 형성할 수 있다고 생각했습니다.
|프로젝트 필요성|일기를 통해 자기 자신을 되돌아보는 시간을 가지면 자기 객관화와 자기 이해를 할 수 있습니다. <br/>최근 자신의 감정을 컨트롤하지 못해 발생하는 범죄가 많아지고 있는데, 일기에 감정을 작성하는 것은 정신 건강에 도움이 되고 우울증상<br/>개선 효과도 있다는 연구 결과가 있습니다.<br/>이러한 장점을 살려 웹 애플리케이션을 만들면 사용자의 정신 건강과 감정 조절에 도움이 될 것입니다.<br/>또한, 정신적인 문제로 인한 범죄 예방에도 기여할 수 있을 것입니다.
|프로젝트 목표|1. 사용자들이 일기작성에 대한 거부감을 덜어주고 재미를 느끼게 한다.<br/>2. 사용자들의 일기를 분석하여 그날의 감정들을 통계 내어 저장하여 자기이해를 할 수 있게 한다.<br/>3. 정신적인 건강에 도움이 되게하고 심리적인 불안함이 개선될 수 있도록 한다. <br/>4. 반응형 UI를 통하여 모바일에서도 쉽게 접근 가능하게 한다. <br/>5. 일기 작성 외에 사용자의 생활에 도움이 될 수 있는 요소를 추가한다.
|프로젝트 기대효과| 앞서 얘기한 과제의 필요성에 더불어 교육용으로 활용을 할 수 있다고 생각한다.<br/>어릴 때 일기를 작성하고 검사 받고 하는데, 일기 쓰는 것에 대한 거부감이 있는 친구들이 많은 걸로 기억 하고 있다. <br/>감정일기 작성 및 하루의 감정 통계를 보며 심리치료, 자기관리 등에 도움이 많이 될 수 있다는 기대효과를 예상하고 있다.
|프로젝트 예상 결과물| 일기를 통해 감정들을 기록하고 해당 일마다의 일기를 분석하여 감정 상태를 분석하고 월, 일단위 통계를 보여주어 사용자의 정신 건강 체크를 할 수 있습니다.<br/>부가적으로 감정일기를 쓰면서 감정을 표현하는 방법이나 컨트롤 할 수 있도록 도와 줄 수 있는 멘탈 헬스 케어 웹 어플리케이션이 될 것 같습니다.

## 개발 환경

클라이언트 : HTML, CSS, JS, BootStrap <br/>
서버 : Node.js, Exprees.js <br/>
API : OpenAI API, Kakao API, Ncloud API <br/>
DB : MySql <br/>
배포 및 관리 : GitHub, CloudType, Netlify <br/>
My-emotion 주소 : https://my-emotion.netlify.app/ <br/>

## 요구 사항
1. 기능 사항
   - 일기 작성 및 분석
     -  사용자는 하루에 한 번 일기 작성 가능하며, OpenAI API를 활용하여 일기를 분석하고 적절한 응답을 제공합니다.
     -  clovaSentimet API를 활용하여 일기의 감정을 긍정, 부정, 중립으로 분석하여 제공합니다.
   - 일기 목록 및 검색
     -  사용자는 작성한 일기 목록을 확인할 수 있습니다.
     -  특정한 날짜나 일기 내용을 통해 검색이 가능하며, 페이지 네이션을 통해 한 페이지 에 6개의 일기를 볼 수 있습니다.
     -  일기 리스트 목록을 클릭하면 해당 일기의 상세 내용을 볼 수 있습니다
   - 일정 관리
     -  일정을 추가, 수정, 삭제할 수 있습니다.
     -  중복된 시간대의 일정은 추가할 수 없고, 캘린더를 통해 상세한 일정 내용을 확인할 수 있습니다.
   - 유저 관리
     - 서비스 로그아웃 및 서비스 탈퇴가 가능합니다.
   - 감정 통계 분석
     - 월별 1주간의 감정 통계를 파이차트로 제공합니다.
   - 페어링 기능
     - 사용자들을 1:1 연결해주는 기능이 있으며, 상대방의 감정 통계를 확인할 수 있습니다. 페어링이 된 경우에만 상대방에게 메시지를 보낼 수 있는 편지 쓰기 기능을 제공합니다.
     - 페어링은 한명이랑만 가능하며 회원탈퇴를 하지 않는 이상 페어링은 끊을 수 없습니다.
   - 도움말
     - 사용자들이 더 쉽게 이용할 수 있도록 도움말을 제공합니다.
2. 비 기능 사항
   - 반응형 디자인
     - 데스크톱과 모바일 화면에서도 반응형 디자인을 적용하여 적합한 인터페이스를 제공합니다.
   - 사용자 친화적 환경
     - 부트스트랩을 활용하여 사용하기 쉬운 인터페이스를 구축했습니다

## 워크 플로우
<img width="677" alt="스크린샷 2024-10-05 15 59 41" src="https://github.com/user-attachments/assets/a878412b-3fce-44b9-9d9e-7b2bcc9ccc1c">

## 로그인 화면
| 데스크톱 | 모바일 |
| --- | --- |
| <img width="419" alt="스크린샷 2024-10-05 16 03 17" src="https://github.com/user-attachments/assets/b040d7dc-74e2-4d43-a488-9bcfae0c753e"> | <img width="182" alt="스크린샷 2024-10-05 16 03 48" src="https://github.com/user-attachments/assets/d5ab8d6c-a5d4-4d93-872a-f0d8b66bb49c"> |

## 일기작성 화면
| 데스크톱 | 모바일 |
| --- | --- |
| <img width="392" alt="스크린샷 2024-10-05 16 07 03" src="https://github.com/user-attachments/assets/425f0fb3-c024-40cd-a07a-7a0c750cfebd"> | <img width="188" alt="스크린샷 2024-10-05 16 07 21" src="https://github.com/user-attachments/assets/88332e0b-0c55-46ea-8d16-012689d9f27a"> |

## 일기 목록 화면 (데스크톱)
| 일기목록 | 일기 상세 다이얼로그 |
| --- | --- |
| <img width="394" alt="스크린샷 2024-10-05 16 08 15" src="https://github.com/user-attachments/assets/e530eed5-5e47-4998-86d2-9cf99929fadd"> | <img width="395" alt="스크린샷 2024-10-05 16 08 27" src="https://github.com/user-attachments/assets/5968bd3c-c8d6-4bea-a71a-da446af49a28"> |

## 일기 목록 화면 (모바일)
| 일기목록 | 일기 상세 다이얼로그 |
| --- | --- |
| <img width="193" alt="스크린샷 2024-10-05 16 09 58" src="https://github.com/user-attachments/assets/9097c8d2-0c7b-4cd7-8cb5-0be3da21ea34"> | <img width="195" alt="스크린샷 2024-10-05 16 10 11" src="https://github.com/user-attachments/assets/3be6f1b9-4de3-46db-86b4-dae6acbdb710"> |

## 일기 검색 화면
| 일기 검색 내용이 있는 경우 | 일기 검색 내용이 없는 경우 |
| --- | --- |
| <img width="390" alt="스크린샷 2024-10-05 16 10 52" src="https://github.com/user-attachments/assets/7d926122-bba5-4ecf-863b-a2f5113df5ff"> | <img width="394" alt="스크린샷 2024-10-05 16 11 01" src="https://github.com/user-attachments/assets/a4b51b0b-ce62-4dd0-9f82-f7a04fbb603e"> |

## 일정 관리 화면 (데스크톱)
| 캘린더 | 일정 작성 | 일정 작성 완료 알림 | 일정 상세 화면 |
| --- | --- | --- | --- |
| <img width="394" alt="스크린샷 2024-10-05 16 12 27" src="https://github.com/user-attachments/assets/fdcf7080-c711-49be-93b5-88469e5e8e1d"> | <img width="391" alt="스크린샷 2024-10-05 16 12 35" src="https://github.com/user-attachments/assets/c65b5b18-5e80-49a4-8105-eb364d769d98"> | <img width="771" alt="스크린샷 2024-10-05 16 12 50" src="https://github.com/user-attachments/assets/82ed9be8-a6c0-48d1-9013-dec34c077c33"> | <img width="394" alt="스크린샷 2024-10-05 16 14 16" src="https://github.com/user-attachments/assets/be5363b7-9aa2-4308-ac0c-0a303060bc02"> |

## 일정 관리 화면 (모바일)
| 캘린더 | 일정 작성 | 일정 작성 완료 알림 | 일정 상세 화면 |
| --- | --- | --- | --- |
| <img width="197" alt="스크린샷 2024-10-05 16 15 47" src="https://github.com/user-attachments/assets/1d3740a8-25b5-43c7-a16c-55427036a2e6"> | <img width="195" alt="스크린샷 2024-10-05 16 15 59" src="https://github.com/user-attachments/assets/9214cdbd-c7f6-486f-b1c9-3ea98917218d"> | <img width="198" alt="스크린샷 2024-10-05 16 16 07" src="https://github.com/user-attachments/assets/15c4613e-e444-4a85-8ee7-bc3d27e584dc"> | <img width="196" alt="스크린샷 2024-10-05 16 16 15" src="https://github.com/user-attachments/assets/04adf916-d127-4158-84b9-cae4782874ac"> |

## 일기 통계 (데스크톱)
| 마이페이지 | 일기 통계 |
| --- | --- |
| <img width="397" alt="스크린샷 2024-10-05 16 16 59" src="https://github.com/user-attachments/assets/b9f5bc83-7f53-4a05-a581-18d6b272d90a"> | <img width="394" alt="스크린샷 2024-10-05 16 17 08" src="https://github.com/user-attachments/assets/f75af061-5d20-441d-a590-d9ac983772f7"> |

## 페어링 (데스크톱)
| 페어링 신청 | 페어 일기 통계 |
| --- | --- |
| <img width="393" alt="스크린샷 2024-10-05 16 17 46" src="https://github.com/user-attachments/assets/cd1b29d9-1bb7-4859-bb9f-bbdf18f5a8f7"> | <img width="393" alt="스크린샷 2024-10-05 16 17 57" src="https://github.com/user-attachments/assets/c7d3cf56-7d16-4b72-b9ff-b13c681a7059"> |

## 일기 통계 및 페어링 (모바일)
| 마이페이지 | 일기 통계 | 페어 일기 통계 |
| --- | --- | --- |
| <img width="199" alt="스크린샷 2024-10-05 16 19 16" src="https://github.com/user-attachments/assets/577f5865-0c8b-42e3-aaef-9a77de3ddccc"> | <img width="206" alt="스크린샷 2024-10-05 16 19 24" src="https://github.com/user-attachments/assets/3510127d-0bfd-4c86-9cae-8dc7fe03a69b"> | <img width="207" alt="스크린샷 2024-10-05 16 19 32" src="https://github.com/user-attachments/assets/c705e9c1-1004-452e-b2ef-9b750e48fdec"> |

## 프로젝트를 진행하며 느낀점
1. 백엔드 개발 경험과 문제 해결 능력 향상<br/>Node.js와 Express.js를 사용하여 처음으로 서버를 구축해보았습니다. 이 과정에서 CORS 오류, API 연동 등 다양한 기술적 도전에 직면했지만, 문제 해결 능력을 키울 수 있었습니다. 특히 CloudType을 활용한 24시간 서버 운영은 실제 운영 환경에 대한 이해를 높이는 좋은 경험이었습니다. 이러한 경험을 바탕으로 프론트엔드 기술에 대한 학습 의지가 더욱 강해졌습니다.
2. API 통합 및 AI 기술 활용<br/>네이버 클라우드와 OpenAI API를 처음 사용해보면서, 외부 서비스 통합의 복잡성을 체감했습니다. 이 과정에서 공식 문서의 중요성을 깨달았고, API 활용 능력을 크게 향상시킬 수 있었습니다. 다만, OpenAI API의 무료 토큰 한계로 인해 더 깊이 있는 감정 분석 기능을 구현하지 못한 점은 아쉬웠습니다. 향후 프로젝트에서는 데이터 전처리와 커스텀 학습 데이터 생성 등을 통해 더 정교한 AI 기능을 구현해보고 싶습니다.
3. 웹 개발의 광범위성 인식과 사용자 경험 중요성<br/>이번 프로젝트를 통해 웹 개발 분야의 광범위성과 복잡성을 실감했습니다. 특히 접근성, 웹 표준, 반응형 디자인 등 사용자 경험(UX)에 직접적인 영향을 미치는 요소들의 중요성을 깊이 인식하게 되었습니다. Bootstrap과 같은 프론트엔드 프레임워크를 활용한 반응형 디자인 구현 경험은 매우 유익했습니다<br/>이를 통해 효율적인 UI/UX 설계의 중요성과 최신 웹 개발 트렌드에 대한 이해를 높일 수 있었습니다.
4. 지속적인 학습과 발전의 필요성: 이번 프로젝트는 제 현재 기술 수준을 객관적으로 평가하고, 앞으로의 학습 방향을 설정하는 데 큰 도움이 되었습니다. 특히 서버 사이드 렌더링, 최신 자바스크립트 프레임워크, 보안 관련 지식 등 더 깊이 있는 학습이 필요한 영역을 파악할 수 있었습니다. 
