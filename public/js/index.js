const fadeEls = document.querySelectorAll('.header__img img');
const footerElements = document.querySelectorAll('.sigin__footer > *');

gsap.to(fadeEls, {
    duration: 1,
    opacity: 1,
    stagger: 0.5, // 헤더 이미지 나타나는 간격 조절
    delay: 0.5, // 이미지들이 나타나기까지의 대기시간
    onComplete: () => {
        animateFooterElements();
    }
});

function animateFooterElements() {
    // 각 요소를 순회하며 opacity 애니메이션 적용
    footerElements.forEach((element, index) => {
        element.style.transition = `opacity 0.5s ease ${index * 0.3}s`;
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100);
    });
}


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
            fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
                .then(response => {
                    if (response.ok) { // 성공
                        window.location.href = "./Main.html"; // Main.html로 이동
                        return response.json();
                    } else {
                        if (response.status === 404) {
                            // 이메일이 없을 경우 회원가입 요청
                            return fetch('https://port-0-my-emotion-jvpb2mlogxbfxf.sel5.cloudtype.app/register', {
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
                    window.location.href = "./Main.html"; // Main.html로 이동
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