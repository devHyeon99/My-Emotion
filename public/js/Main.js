// DOMContentLoaded 될때 getUser() 함수를 호출함.
document.addEventListener('DOMContentLoaded', function () {
    getUser();
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
            userInfoElement.textContent = `사용자: ${name}, 이메일: ${email}`;
        }
    });
}

function logout() {
    const client_id = 'b976cc8aaac258149aeeae2150956032'; // 카카오 개발자 사이트에서 발급한 클라이언트 ID
    const logoutRedirectURI = 'https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/index.html'; // 로그아웃 후 리디렉션될 서비스 로그아웃 URL

    // 카카오 로그아웃 API 호출
    fetch(`https://kauth.kakao.com/oauth/logout?client_id=${client_id}&logout_redirect_uri=${logoutRedirectURI}`, {
        method: 'GET'
    })
        .then(response => response.text())
        .then(data => {
            window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${client_id}&logout_redirect_uri=${logoutRedirectURI}`;
            console.log(data); // 로그아웃 성공 시, 서버에서 반환한 응답 데이터
        })
        .catch(error => {
            console.error(error);
        });
}

// GPT, Clova API 응답 부분
async function generateResponse() {
    const userDiary = document.getElementById('userDiary').value;
    const DiaryWrite = document.getElementById('DiaryWrite');
    const DiaryWriteView = document.getElementById('DiaryWriteView');
    const DiaryWriteView2 = document.getElementById('DiaryWriteView2');

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