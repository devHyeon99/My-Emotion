// DOMContentLoaded 될때 getUser() 함수를 호출함.
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash !== '#menu4') {
        window.location.hash = '#menu4';
    }
    getUser();
    renderCalendar();
    TimeDropdowns();
    populateMonthDropdown();
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
        const positivity = data.positivity;
        const negativity = data.negativity;
        const neutral = data.neutral;

        const diaryData = {
            email,
            date: formattedDate,
            content,
            answer,
            positivity,
            negativity,
            neutral
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
            openDiaryModal(diary.date, diary.content, diary.answer, diary.positivity, diary.negativity, diary.neutral);
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

// 일기목록 리스트 클릭스 활성화 되는 모달 
function openDiaryModal(date, content, answer, positivity, negativity, neutral) {
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
                    <hr>
                    <p><strong style="font-size: 1.2em;">일기답변<br></strong> ${answer}</p>
                    <hr>
                    <p><strong style="font-size: 1.2em;">일기감정<br></strong> 긍정: ${positivity} 부정: ${negativity} 중립: ${neutral}</p>
                </div>
            </div>
        </div>
    `;

    modalElement.innerHTML = modalContent;
    modal.show();
}

// 캘린더 관련 함수들
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

    // days를 순회하면서 클릭 이벤트를 추가
    days.forEach(day => {
        if (!day.classList.contains('inactive')) {
            day.addEventListener('click', () => {
                // 이전에 active 클래스가 있는 요소를 찾아서 모두 제거
                days.forEach(d => {
                    d.classList.remove('active');
                });

                // 클릭된 요소에 active 클래스를 추가
                day.classList.add('active');

                // 클릭한 날짜 정보 가져오기
                getDaily(parseInt(day.textContent));
            });
        }
    });
};

// 일정관리 함수 부분
// 일정작성하는 모달
function dailyadd() {
    const modalElement = document.getElementById('exampleModal');
    const modal = new bootstrap.Modal(modalElement)
    modal.show();
}

// 시간 관련 드롭박스 변환
function TimeDropdowns() {
    var startTimeSelect = document.getElementById("startTime");
    var endTimeSelect = document.getElementById("endTime");

    startTimeSelect.innerHTML = '<option value=""></option>';
    endTimeSelect.innerHTML = '<option value=""></option>';

    for (var i = 0; i <= 23; i++) {
        var hour = ('0' + i).slice(-2); // 시간을 2자리 형식으로 변환
        startTimeSelect.innerHTML += '<option value="' + hour + ':00">' + hour + ':00</option>';
    }

    for (var j = 1; j <= 24; j++) {
        var hour = ('0' + j).slice(-2); // 시간을 2자리 형식으로 변환
        endTimeSelect.innerHTML += '<option value="' + hour + ':00">' + hour + ':00</option>';
    }
}

// 날짜 클릭시에 일기 작성여부, 일정 작성목록 불러와서 모달 띄움.
function getDaily(date) {
    const modalElement = document.getElementById('exampleModal2');
    const modal = new bootstrap.Modal(modalElement)
    const modalTitle = document.getElementById('exampleModalLabel2');
    const modalbody = document.getElementById('diaryCehck');

    const strDate = `${currYear}-${(currMonth + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    modalTitle.textContent = strDate;
    fetchDiarycheck(modalbody, strDate);
    fetchgetSchedules(strDate);
    modal.show();
}

function fetchDiarycheck(modalbody, strDate) {
    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/checkDiary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, date: strDate }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                // 해당 날짜에 일기가 존재하는 경우
                modalbody.textContent = "일기 작성 여부 : O"
                console.log('해당 날짜의 일기가 있습니다.');
            } else {
                // 해당 날짜에 일기가 존재하지 않는 경우
                modalbody.textContent = "일기 작성 여부 : X"
                console.log('해당 날짜의 일기가 없습니다.');
            }
        })
        .catch(error => {
            console.error('서버 요청 중 에러 발생:', error);
            // 에러 처리
        });
}

const tbody = document.querySelector('tbody');
function fetchgetSchedules(strDate) {
    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/getSchedules', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, date: strDate }),
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.length > 0) {
                // 서버로부터 일정 데이터를 받아왔고, 데이터가 있는 경우
                addSchedulesToTable(data.data); // 테이블에 일정 데이터 추가
            } else {
                // 서버로부터 받은 데이터가 빈 배열인 경우 (일정이 없는 경우)
                tbody.innerHTML = '<tr style="text-align: center;"><td colspan="4">일정이 없습니다.</td></tr>';
            }
        })
        .catch(error => {
            console.error('서버 요청 중 에러 발생:', error);
            // 에러 처리
        });
}

// 서버에서 받은 일정 데이터를 기반으로 tbody에 각 일정을 추가
function addSchedulesToTable(data) {
    tbody.innerHTML = '';

    // 서버로부터 받은 일정 데이터(data)를 순회하며 각 일정을 테이블에 추가
    data.forEach((schedule, index) => {
        const row = document.createElement('tr'); // 새로운 <tr> 엘리먼트 생성

        // 일련번호 열 추가
        const sequence = document.createElement('th');
        sequence.setAttribute('scope', 'row');
        sequence.textContent = index + 1;
        row.appendChild(sequence);

        // 시작 시간 열 추가
        const startTime = document.createElement('td');
        startTime.textContent = schedule.start;
        row.appendChild(startTime);

        // 종료 시간 열 추가
        const endTime = document.createElement('td');
        endTime.textContent = schedule.end;
        row.appendChild(endTime);

        // 일정 내용 열 추가
        const content = document.createElement('td');
        content.textContent = schedule.content;
        row.appendChild(content);

        // 테이블에 행 추가
        tbody.appendChild(row);
    });
}

// 일정 작성하는 함수
function dailywritebtn() {
    const scheduleDateInput = document.getElementById('scheduleDate');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    const scheduleContentTextarea = document.getElementById('scheduleContent');
    console.log(scheduleDateInput.value, startTimeSelect.value, endTimeSelect.value, scheduleContentTextarea.value)
    if (scheduleDateInput.value == "" || startTimeSelect == "" ||
        endTimeSelect.value == "" || scheduleContentTextarea.value == "") {
        $('#exampleModal').modal('hide');
        openModal("알림", "일정 작성에 빈칸이 있거나 시간이 중복되지 않게 작성해주세요.");
        return
    }
    if (startTimeSelect.value == endTimeSelect.value) {
        $('#exampleModal').modal('hide');
        openModal("알림", "일정 시간 설정을 다시 확인 해주세요.");
        return
    }
    const scheduleData = {
        email: email,
        date: scheduleDateInput.value,
        startTime: startTimeSelect.value,
        endTime: endTimeSelect.value,
        content: scheduleContentTextarea.value
    };
    console.log(scheduleData);
    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/createSchedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('일정이 성공적으로 추가되었습니다.');
                $('#exampleModal').modal('hide');
                const toastElement = document.querySelector('#liveToast');
                const toast = new bootstrap.Toast(toastElement);
                toast.show();
            } else {
                console.log('일정이 추가되지 않았습니다.');
                $('#exampleModal').modal('hide');
                openModal("알림", "일정 시간 설정을 다시 확인 해주세요.");
            }
        })
        .catch(error => {
            console.error('일정 추가 중 에러 발생:', error);
            // 에러 처리
        });
}

// 차트 업데이트 함수
// 차트를 관리할 객체 생성
const myDoughnutCharts = {};

function updateChart(chartId, weekStats) {
    console.log(weekStats);
    const chartData = {
        labels: ["긍정", "부정", "중립"],
        datasets: [{
            data: [weekStats.avgPositivity, weekStats.avgNegativity, weekStats.avgNeutral],
            backgroundColor: ["#74bff7", "#ff695c", "#92f792"]
        }]
    };

    // 차트 요소 가져오기
    const doughnutChartElement = document.getElementById(chartId);
    doughnutChartElement.style.display = 'block';

    // 차트 초기화 또는 업데이트
    if (myDoughnutCharts[chartId]) {
        myDoughnutCharts[chartId].data = chartData;
        myDoughnutCharts[chartId].update();
    } else {
        myDoughnutCharts[chartId] = new Chart(doughnutChartElement, {
            type: 'doughnut',
            data: chartData,
            options: {
                title: {
                    display: true,
                    text: 'Predicted world population (millions) in 2050'
                }
            }
        });
    }
}

// 감정 통계 내는 함수 부분
// 해당 월 주차별 통계 가져오는곳
const selectWeek = document.getElementById('selectWeek');
const selectWeek2 = document.getElementById('selectWeek2');
selectWeek.addEventListener('change', () => {
    getWeeklyStats();
});
selectWeek2.addEventListener('change', () => {
    PairgetWeeklyStats();
});

// 선택한 월, 주의 작성한 일기 데이터 감정을 서버에게 요청
async function getWeeklyStats() {
    try {
        const selectedMonth = document.getElementById('selectMonth').value;
        const selectedWeek = document.getElementById('selectWeek').value;

        const response = await fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/weekly-stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, month: selectedMonth, week: selectedWeek })
        });

        if (!response.ok) {
            if (response.status === 404) {
                openModal("알림", "불러올 데이터가 없습니다.");
                return
            } else {
                openModal("에러", "예기치 못한 오류가 발생했습니다. 관리자에게 문의 바랍니다.")
                throw new Error('Failed to fetch weekly stats');
            }
        }

        const stats = await response.json();
        const weekStats = stats[`Week ${selectedWeek}`];
        updateChart("doughnut-chart", weekStats);
    } catch (error) {
        openModal("에러", "불러올 데이터가 없거나 예기치 못한 오류가 발생했습니다. 관리자에게 문의 바랍니다.")
        console.error('Error fetching weekly stats:', error);
    }
}

async function PairgetWeeklyStats() {
    console.log(pairEmail)
    try {
        const selectedMonth = document.getElementById('selectMonth2').value;
        const selectedWeek = document.getElementById('selectWeek2').value;

        const response = await fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/weekly-stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: pairEmail, month: selectedMonth, week: selectedWeek })
        });

        if (!response.ok) {
            if (response.status === 404) {
                openModal("알림", "불러올 데이터가 없습니다.");
                return
            } else {
                openModal("에러", "예기치 못한 오류가 발생했습니다. 관리자에게 문의 바랍니다.")
                throw new Error('Failed to fetch weekly stats');
            }
        }

        const stats = await response.json();
        const weekStats = stats[`Week ${selectedWeek}`];
        updateChart("doughnut-chart2", weekStats);
    } catch (error) {
        openModal("에러", "불러올 데이터가 없거나 예기치 못한 오류가 발생했습니다. 관리자에게 문의 바랍니다.")
        console.error('Error fetching weekly stats:', error);
    }
}

// 주차 계산하는 함수
function calculateWeeksInMonth(month) {
    const currentYear = new Date().getFullYear(); // 현재 연도를 가져옴
    const daysInMonth = new Date(currentYear, month, 0).getDate(); // 해당 월의 일 수
    let weekNumber = 1; // 주차 번호 초기화
    let dayOfWeek = new Date(currentYear, month - 1, 1).getDay(); // 해당 월의 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)

    for (let day = 1; day <= daysInMonth; day++) {
        // 해당 날짜가 다음 주로 넘어갈 때마다 주차 번호 증가
        if (dayOfWeek === 0 && day !== 1) {
            weekNumber++;
        }
        dayOfWeek = (dayOfWeek + 1) % 7; // 다음 날의 요일
    }

    return weekNumber;
}


// 월과 해당 월의 주차를 설정하는 드롭다운 메뉴 업데이트
function updateWeekDropdown(month) {
    const weeksInMonth = calculateWeeksInMonth(month); // 해당 월의 주차 수 계산

    const selectWeek = document.getElementById('selectWeek');
    const selectWeek2 = document.getElementById('selectWeek2');

    const updateDropdown = (selectElement) => {
        selectElement.innerHTML = ''; // 기존 옵션 초기화

        // "선택" 옵션 추가
        const defaultOption = document.createElement('option');
        defaultOption.value = '0'; // 또는 비어 있는 값을 사용할 수 있습니다.
        defaultOption.textContent = '선택';
        selectElement.appendChild(defaultOption);

        // 주차 옵션 추가
        for (let i = 1; i <= weeksInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}주차`;
            selectElement.appendChild(option);
        }
    };

    updateDropdown(selectWeek);
    updateDropdown(selectWeek2);
}


// 월 선택 드롭다운 메뉴 생성
function populateMonthDropdown() {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    const populateDropdown = (selectElement) => {
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // 1부터 시작하는 월로 설정
            option.textContent = month;
            selectElement.appendChild(option);
        });

        selectElement.addEventListener('change', (event) => {
            const selectedMonth = event.target.value;
            updateWeekDropdown(selectedMonth);
        });
    };

    const selectMonth = document.getElementById('selectMonth');
    const selectMonth2 = document.getElementById('selectMonth2');

    populateDropdown(selectMonth);
    populateDropdown(selectMonth2);
}


// 페어링 관련 구현 부분
// 페어 통계 관리하는 부분
const collapseTwo = document.getElementById('collapseTwo');
const accordionBody = collapseTwo.querySelector('.accordion-body');
var pairEmail = "";

async function updateAccordionBody() {
    try {
        const response = await fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/checkPairing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.pairingValue === 1) {
            pairEmail = data.pairingEmail;
            accordionBody.innerHTML = `<strong>[ 페어 정보 ]</strong> <br>닉네임: ${data.pairingName} <br>이메일: ${pairEmail}`;
        } else if (data.pairingValue === 0) {
            accordionBody.innerHTML = '<button type="button" class="btn btn-outline-primary" ' +
                'onclick="pairingModal();">페어링</button>';
        }
    } catch (error) {
        console.error('Error updating accordion body:', error);
    }
}

function pairingModal() {
    const modalElement = document.getElementById('PairingModal');
    const modal = new bootstrap.Modal(modalElement)

    modal.show();
}

function pairingRegister() {
    const modalElement = document.getElementById('oneMoreMdoal');
    const modal = new bootstrap.Modal(modalElement)
    const pairingemail = document.getElementById('pairingemail').value;
    pairEmail = document.getElementById('pairingemail').value;

    if (email === pairingemail) {
        $('#PairingModal').modal('hide');
        openModal("알림", "자기 자신을 페어링할 수 없습니다.");
        return
    }

    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/checkPairing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: pairingemail }) // userEmail은 사용자 이메일 값
    })
        .then(response => {
            if (!response.ok) {
                console.error('User Not Found');
                $('#PairingModal').modal('hide');
                openModal("알림", "입력하신 이메일의 유저가 존재하지 않습니다.");
            }
            return response.json();
        })
        .then(data => {
            if (data.pairingValue === 1) {
                console.log("입력하신 이메일은 이미 다른 사용자와 페어링이 되어있습니다.")
                $('#PairingModal').modal('hide');
                openModal("알림", "입력하신 이메일은 이미 다른 사용자와 페어링이 되어있습니다.");
            } else if (data.pairingValue === 0) {
                console.log("입력하신 이메일은 다른 사용자와 페어링이 되어있지 않습니다.")
                $('#PairingModal').modal('hide');
                modal.show();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function pairingStart() {
    fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/pairing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, pairEmail })
    })
        .then(response => {
            if (!response.ok) {
                console.error('Network response was not ok');
                return Promise.reject('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('페어링이 완료되었습니다.');
                $('#oneMoreMdoal').modal('hide');
                const toastElement = document.querySelector('#liveToast');
                const toast = new bootstrap.Toast(toastElement);
                const toastbody = document.getElementById('toastbody');
                toastbody.textContent = "페어링이 완료되었습니다."

                toast.show();
            } else {
                console.log('페어링에 실패했습니다.');
                $('#oneMoreMdoal').modal('hide');
                openModal("알림", "페어링이 실패하셨습니다. 관리자에게 문의 해주세요.")
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
