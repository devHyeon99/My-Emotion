// 로그인 헤더 이미지 애니메이션 처리
const fadeEls = document.querySelectorAll('.header__img img')
// 나타날 요소들을 하나씩 반복해서 처리!
fadeEls.forEach(function (fadeEl, index) {
    // 각 요소들을 순서대로(delay) 보여지게 함!
    gsap.to(fadeEl, 1, {
        delay: (index + 1) * .7,
        opacity: 1
    })
})

// 카카오 로그인 부분 처리
// 2. 카카오 초기화
Kakao.init('7168560f2aefd9e7c731e481723fcf25');
console.log(Kakao.isInitialized()); // 초기화 판단여부

// 3. 데모버전으로 들어가서 카카오로그인 코드를 확인.
function loginWithKakao() {
    Kakao.Auth.login({
        success: function (authObj) {
            console.log(authObj); // access토큰 값
            Kakao.Auth.setAccessToken(authObj.access_token); // access토큰값 저장
            getInfo();
        },
        fail: function (err) {
            console.log(err);
        }
    });
}

// 4. 엑세스 토큰을 발급받고, 아래 함수를 호출시켜서 사용자 정보를 받아옴.
function getInfo() {
    Kakao.API.request({
        url: '/v2/user/me',
        success: function (res) {
            console.log(res);
            // 이메일, 성별, 닉네임, 프로필이미지
            var email = res.kakao_account.email;
            var name = res.kakao_account.profile.nickname;

            console.log(email, name);

            // 클라이언트 측에서 이메일 확인 후 회원가입 요청
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
                .then(response => {
                    if (response.ok) { // 성공
                        window.location.href = "/Main.html"; // Main.html로 이동
                        return response.json();
                    } else {
                        if (response.status === 404) {
                            // 이메일이 없을 경우 회원가입 요청
                            return fetch('/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email: email, name: name })
                            });
                        } else {
                            throw new Error('로그인에 실패했습니다.');
                        }
                    }
                })
                .then(data => {
                    console.log(data); // 서버에서 받은 응답 데이터 (로그인 또는 회원가입 결과)
                })
                .catch(error => {
                    console.error(error);
                });
        },
        fail: function (error) {
            alert('카카오 로그인에 실패했습니다. 관리자에게 문의하세요.' + JSON.stringify(error));
        }
    });
}