// DOMContentLoaded 될때 getUser() 함수를 호출함.
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash !== '#menu4') {
        window.location.hash = '#menu4';
    }
    getUser();
});

// 페이지 로드시와 해시 변경 시 함수 호출
window.addEventListener('load', function () {
    // 페이지 로드 시 호출
    checkHash();
});

window.addEventListener('hashchange', function () {
    // 해시 변경 시 호출
    checkHash();
});

// 로그인한 카카오 정보 Main 페이지에서 불러옴.
Kakao.init('7168560f2aefd9e7c731e481723fcf25');
var email = "";
var name = "";

function getUser() {
    Kakao.API.request({
        url: '/v2/user/me',
        success: function (res) {
            console.log(res);

            email = res.kakao_account.email;
            name = res.kakao_account.profile.nickname;

            console.log(email, name);
            const userInfoElement = document.getElementById('user-info');
            userInfoElement.innerHTML = `닉네임: ${name}<br>이메일: ${email}`;
        },
        fail: function (error) {
            const modal = document.getElementById('dynamicModal');
            openModal("로그인 필요", "로그인 페이지로 이동합니다.");
            // 모달의 'hidden.bs.modal' 이벤트 처리
            modal.addEventListener('hidden.bs.modal', function () {
                // 모달이 닫힌 후에 페이지 이동
                window.location.href = './index.html';
            });
        }
    });
}

// 카카오 계정 함께 로그아웃
function logout() {
    const client_id = 'b976cc8aaac258149aeeae2150956032'; // 카카오 개발자 사이트에서 발급한 클라이언트 ID
    const logoutRedirectURI = 'https://my-emotion.netlify.app/'; // 로그아웃 후 리디렉션될 서비스 로그아웃 URL
    localStorage.clear();
    window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${client_id}&logout_redirect_uri=${logoutRedirectURI}`;
}

// GPT, Clova API 응답 부분
async function generateResponse() {
    const userDiary = document.getElementById('userDiary').value;
    const DiaryWrite = document.getElementById('DiaryWrite');
    const DiaryWriteView = document.getElementById('DiaryWriteView');
    const DiaryWriteView2 = document.getElementById('DiaryWriteView2');

    if (userDiary == "") {
        openModal("알림", "일기 작성을 완료 후 시도하시길 바랍니다.");
        return;
    }

    showLoadingScreen(); // 로딩창 표시

    const response = await fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/generateResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userDiary })
    });

    if (response.ok) {
        const data = await response.json();

        const offset = 1000 * 60 * 60 * 9
        const koreaNow = new Date((new Date()).getTime() + offset)
        const formattedDate = koreaNow.toISOString().split('T')[0];
        const content = userDiary;
        const answer = data.assistantResponse;
        const emotion = data.confidence;

        const diaryData = {
            email,
            date: formattedDate,
            content,
            answer,
            emotion
        };

        // 데이터베이스에 저장하기 위한 API 엔드포인트 호출
        const saveDiaryResponse = await fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/saveDiary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(diaryData)
        });

        if (saveDiaryResponse.ok) {
            hideLoadingScreen(); // 로딩창 제거
            DiaryWrite.style.backgroundColor = '#DCF8C6';
            DiaryWrite.style.boxShadow = '2px 2px 20px rgba(0, 0, 0, 0.1)';
            DiaryWrite.textContent = userDiary;
            DiaryWriteView.style.backgroundColor = '#E5E5EA';
            DiaryWriteView.style.boxShadow = '2px 2px 20px rgba(0, 0, 0, 0.1)';
            DiaryWriteView.textContent = data.assistantResponse;
            DiaryWriteView2.style.backgroundColor = '#E5E5EA';
            DiaryWriteView2.style.boxShadow = '2px 2px 20px rgba(0, 0, 0, 0.1)';
            DiaryWriteView2.textContent = data.confidence;
            document.getElementById('userDiary').value = '';
        } else if (saveDiaryResponse.status === 400) {
            // 이미 일기를 작성한 경우
            hideLoadingScreen(); // 로딩창 제거
            openModal("알림", "오늘 일기를 이미 작성하셨습니다.");
        } else {
            hideLoadingScreen(); // 로딩창 제거
            DiaryWriteView.textContent = '오류';
        }
    } else {
        hideLoadingScreen(); // 로딩창 제거
        DiaryWriteView.textContent = '오류';
    }
}

// UI 컨트롤 부분
function changeTab(tabId, button) {
    // 모든 메뉴 버튼의 활성 클래스 제거
    document.querySelectorAll('.nav-link').forEach(function (tabButton) {
        tabButton.classList.remove('active');
    });

    // 클릭된 메뉴 버튼에 활성 클래스 추가
    button.classList.add('active');

    // 모든 탭 콘텐츠 숨김
    document.querySelectorAll('.tab-pane').forEach(function (tabPane) {
        tabPane.classList.remove('show', 'active');
    });

    // 클릭된 탭 콘텐츠 표시
    document.querySelector(`#${tabId}`).classList.add('show', 'active');
}

// 로딩 컨트롤 부분
// API 요청 전 로딩 화면 표시
function showLoadingScreen() {
    document.querySelector('.loading-screen').style.display = 'block';
}

// API 요청 후 로딩 화면 숨김
function hideLoadingScreen() {
    document.querySelector('.loading-screen').style.display = 'none';
}

// 모달 열기 부분 (이 함수 컴포넌트를 통해서 계속 활용해서 사용)
function openModal(title, body) {
    const modalElement = document.getElementById('dynamicModal');
    const modal = new bootstrap.Modal(modalElement)
    const modalTitle = document.getElementById('dynamicModalLabel');
    const modalBody = document.getElementById('dynamicModalBody');

    modalTitle.textContent = title;
    modalBody.textContent = body;

    modal.show();
}

// 메뉴 해시 변경때 마다 데이터 뿌리기 위한 부분
function checkHash() {
    // 현재 해시 가져오기 (예: '#menu2')
    const currentHash = window.location.hash;

    // 메뉴2 해시인 경우 함수 호출
    if (currentHash === '#menu2') {
        // menu2 활성화 시 실행할 함수 호출
        activateMenu2();
    }
}

// 메뉴 활성화시 데이터 추가하는 부분
function activateMenu2() {
    console.log('menu2가 활성화되었습니다.' + email);

    const data = {
        email: email
    };

    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/diaryList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((diaryList) => {
            const listGroup = document.querySelector('.list-group');

            // 기존 리스트 삭제
            listGroup.innerHTML = '';

            // 다이어리 목록을 리스트 그룹에 추가
            diaryList.forEach((diary) => {
                const listItem = document.createElement('a');
                listItem.classList.add('list-group-item', 'list-group-item-action');

                const currentDate = new Date();
                const diaryDate = new Date(diary.date);
                const timeDifference = Math.floor((currentDate - diaryDate) / (1000 * 60 * 60 * 24));


                listItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${diary.date}</h5>
                    <small>${timeDifference} days ago</small>
                </div>
                <p class="mb-1 text-start">${diary.content}</p>
            `;
                listGroup.appendChild(listItem);
            });
        })
        .catch((error) => {
            // 오류 처리
            console.error('다이어리 목록을 가져오는 데 실패했습니다.', error);
        });
}