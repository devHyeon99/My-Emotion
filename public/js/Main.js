// DOMContentLoaded 될때 getUser() 함수를 호출함.
document.addEventListener('DOMContentLoaded', function () {
    getUser();
});

// 로그인한 카카오 정보 Main 페이지에서 불러옴.
Kakao.init('7168560f2aefd9e7c731e481723fcf25');
function getUser() {
    Kakao.API.request({
        url: '/v2/user/me',
        success: function (res) {
            console.log(res);
            // 이메일, 이름
            var email = res.kakao_account.email;
            var name = res.kakao_account.profile.nickname;

            console.log(email, name);
            const userInfoElement = document.getElementById('user-info');
            userInfoElement.textContent = `사용자: ${name}, 이메일: ${email}`;
        }
    });
}

function logout() {
    const client_id = 'b976cc8aaac258149aeeae2150956032'; // 카카오 개발자 사이트에서 발급한 클라이언트 ID
    const logoutRedirectURI = 'http://localhost:3000/index.html'; // 로그아웃 후 리디렉션될 서비스 로그아웃 URL

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
