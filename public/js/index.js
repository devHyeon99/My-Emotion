console.log("dd")
// 나타날 요소들(.fade-in) 찾기.
const fadeEls = document.querySelectorAll('.header__img img')
console.log(fadeEls[0])
// 나타날 요소들을 하나씩 반복해서 처리!
fadeEls.forEach(function (fadeEl, index) {
    // 각 요소들을 순서대로(delay) 보여지게 함!
    gsap.to(fadeEl, 1, {
        delay: (index + 1) * .7,
        opacity: 1
    })
})