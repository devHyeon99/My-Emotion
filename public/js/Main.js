// DOMContentLoaded 될때 getUser() 함수를 호출함.
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash !== '#menu4') {
        window.location.hash = '#menu4';
    }
    getUser();
    renderCalendar();
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
        fetchDiaryList();
    }
}

const itemsPerPage = 6; // 한 페이지당 표시될 아이템 수
let currentPage = 1; // 현재 페이지 설정
let currentSearchResult = []; // 검색 결과를 저장할 변수

// 서버에서 다이어리 목록 가져오는 부분.
function fetchDiaryList() {
    let diaryList = currentSearchResult; // 검색된 목록이 있으면 해당 목록을 사용

    if (diaryList.length === 0) {
        // 검색된 목록이 없을 경우 전체 목록을 가져옴
        const data = {
            email: email,
            content: '' // 검색어를 빈 문자열로 초기화하여 전체 목록 요청
        };

        fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/diaryList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((result) => {
                diaryList = result;
                renderDiaryList(diaryList);
                const totalPages = Math.ceil(diaryList.length / itemsPerPage);
                renderPagination(totalPages);
            })
            .catch((error) => {
                console.error('다이어리 목록을 가져오는 데 실패했습니다.', error);
            });
    } else {
        // 검색된 목록을 사용하여 페이지 렌더링
        renderDiaryList(diaryList);
        const totalPages = Math.ceil(diaryList.length / itemsPerPage);
        renderPagination(totalPages);
    }
}

// 다이어리 검색 함수
function diarysearch() {
    const content = document.getElementById("diarycontent").value;

    const data = {
        email: email,
        content: content // 검색어를 포함하여 서버에 전송
    };

    currentPage = 1; // 검색 시 페이지를 1페이지로 설정

    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/diaryList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((diaryList) => {
            if (diaryList.length === 0) {
                openModal("알림", "검색된 일기가 없습니다.");
                window.location.hash = '#1'; // 검색 결과가 없을 때 해시 값을 1로 설정
                currentSearchResult = [];
                fetchDiaryList(); // 검색 결과가 없으므로 전체 다이어리 목록을 보여줌
            } else {
                currentSearchResult = diaryList; // 검색된 결과를 저장
                renderDiaryList(diaryList);
                const totalPages = Math.ceil(diaryList.length / itemsPerPage);
                renderPagination(totalPages);
                window.location.hash = '#1'; // 검색 시 항상 해시 값을 1로 설정
            }
        })
        .catch((error) => {
            console.error('다이어리 목록을 가져오는 데 실패했습니다.', error);
        });
}



// 페이지 네이션 함수
function changePage(page) {
    currentPage = page;
    fetchDiaryList(); // 페이지를 변경할 때 목록을 다시 가져오도록 수정
}

// 메뉴 활성화시 데이터 추가하는 부분
function renderDiaryList(diaryList) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedDiaries = diaryList.slice(startIndex, endIndex);

    const listGroup = document.getElementById('diaryListContainer');
    listGroup.innerHTML = ''; // 기존 리스트 삭제

    slicedDiaries.forEach((diary) => {
        const listItem = document.createElement('a');
        listItem.classList.add('list-group-item', 'list-group-item-action');

        // 현재 날짜와 일기 쓴 날짜 차이 계산해서 사용자에게 알려줌
        const offset = 1000 * 60 * 60 * 9;
        const koreaNow = new Date((new Date()).getTime() + offset);
        const formattedDate = koreaNow.toISOString().split('T')[0];
        const currentDate = new Date(formattedDate);
        const diaryDate = new Date(diary.date);
        const timeDifference = Math.floor((currentDate - diaryDate) / (1000 * 60 * 60 * 24));

        listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${diary.date}</h5>
                <small>${timeDifference} days ago</small>
            </div>
            <p class="mb-1 text-start">${diary.content}</p>
        `;

        // 클릭 이벤트에서 모달 열기 함수 호출
        listItem.addEventListener('click', () => {
            openDiaryModal(diary.date, diary.content, diary.answer, diary.emotion);
        });

        listGroup.appendChild(listItem);
    });
}

// 페이지 네이션 동적 추가 부분
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');

    if (!pagination) {
        console.error('pagination 요소를 찾을 수 없습니다.');
        return;
    }

    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = `#${i}`; // 페이지 번호에 따라 각각의 고유한 href 설정
        pageLink.textContent = i;
        pageLink.id = `page${i}`;
        pageLink.addEventListener('click', () => changePage(i));
        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }

    const currentPageLink = document.getElementById(`page${currentPage}`);
    if (currentPageLink) {
        currentPageLink.classList.add('active');
    }
}

function openDiaryModal(date, content, answer, emotion) {
    const modalElement = document.getElementById('dynamicModal2');
    const modal = new bootstrap.Modal(modalElement);
    const modalContent = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${date}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong style="font-size: 1.2em;">작성일기<br></strong> ${content}</p>
                    <p><strong style="font-size: 1.2em;">일기답변<br></strong> ${answer}</p>
                    <p><strong style="font-size: 1.2em;">나의감정<br></strong> ${emotion}</p>
                </div>
            </div>
        </div>
    `;

    modalElement.innerHTML = modalContent;
    modal.show();
}

const date = new Date();
let currYear = date.getFullYear(),
    currMonth = date.getMonth();
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',];
const daysTag = document.querySelector('.days');
const currentDate = document.querySelector('.current-date');
currentDate.innerHTML = `${months[currMonth]} ${currYear}`;
const leftBtn = document.querySelector('.material-icons:nth-of-type(1)');
const rightBtn = document.querySelector('.material-icons:nth-of-type(2)');

leftBtn.addEventListener('click', showPrevMonth);
rightBtn.addEventListener('click', showNextMonth);

function showPrevMonth() {
    currMonth--;
    if (currMonth < 0) {
        currMonth = 11;
        currYear--;
    }
    renderCalendar();
}

function showNextMonth() {
    currMonth++;
    if (currMonth > 11) {
        currMonth = 0;
        currYear++;
    }
    renderCalendar();
}

const renderCalendar = () => {
    currentDate.innerHTML = `${months[currMonth]} ${currYear}`;
    let lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
    let firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
    let lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay();
    let lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = '';

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        liTag += `<li class="inactive">${lastDateOfLastMonth - i}</li>`;
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
        let isToday =
            i === date.getDate() &&
            currMonth === new Date().getMonth() &&
            currYear === new Date().getFullYear()
                ? 'active'
                : '';
        liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = 1; i < 7 - lastDayOfMonth; i++) {
        liTag += `<li class="inactive">${i}</li>`;
    }

    daysTag.innerHTML = liTag;

    const days = document.querySelectorAll('.days li');

    // days를 순회하면서 클릭 이벤트를 추가합니다.
    days.forEach(day => {
        day.addEventListener('click', () => {
            // 이전에 active 클래스가 있는 요소를 찾아서 모두 제거합니다.
            days.forEach(d => {
                d.classList.remove('active');
            });

            // 클릭된 요소에 active 클래스를 추가합니다.
            day.classList.add('active');
        });
    });
};