const btn = document.querySelector("#js-btn");
const nav = document.querySelector("#js-nav");
const introScreen = document.querySelector(".intro-screen");
const indexContent = document.querySelector(".index-content");

if(btn && nav){
    btn.addEventListener("click",()=>{
        btn.classList.toggle("open");
        nav.classList.toggle("open");
    });
}

if(introScreen){
    const shootingStar = introScreen.querySelector(".shooting-star");
    const showPeek = () => introScreen.classList.add("iris-peek");
    const showTitle = () => introScreen.classList.add("title-visible");
    let skyOpeningStarted = false;

    const openSky = () => {
        if(skyOpeningStarted) return;

        skyOpeningStarted = true;
        setTimeout(showTitle, 1600);
    };

    setTimeout(showPeek, 300);

    if(shootingStar){
        shootingStar.addEventListener("animationend", openSky, { once: true });
        setTimeout(openSky, 2800);
    } else {
        setTimeout(openSky, 1200);
    }

    const spawnRandomShootingStar = () => {
        if (Math.random() > 0.18) return;

        const randomStar = document.createElement("span");
        randomStar.className = "shooting-star";

        const duration = Math.random() * 2.6 + 2.4;
        const width = Math.random() * 18 + 10;
        const left = Math.random() * 72 + 8;
        const top = Math.random() * 26 + 6;

        randomStar.style.left = left + "%";
        randomStar.style.top = top + "%";
        randomStar.style.width = width + "vw";
        randomStar.style.animationDuration = duration + "s";
        randomStar.style.opacity = "0.9";

        introScreen.appendChild(randomStar);
        setTimeout(() => randomStar.remove(), (duration + 0.8) * 1000);
    };

    const scheduleRandomStar = () => {
        spawnRandomShootingStar();
        const nextDelay = Math.random() * 12000 + 8000;
        setTimeout(scheduleRandomStar, nextDelay);
    };

    setTimeout(scheduleRandomStar, 5000);

    const updateScrollState = () => {
        const isScrolled = window.scrollY > 40;

        introScreen.classList.toggle("title-hidden", isScrolled);
        if(indexContent){
            indexContent.classList.toggle("content-visible", isScrolled);
        }
    };

    window.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
}

function generateStars(containerSelector=".stars",starCount=140){

    const stars = document.querySelector(containerSelector);
    if(!stars || stars.children.length > 0) return;

    for(let i=0;i<starCount;i++){
        const star = document.createElement("span");
        const size = Math.random()*2.5+1;

        star.className = "star";
        star.style.width = size + "px";
        star.style.height = size + "px";
        star.style.left = Math.random()*100 + "%";
        star.style.top = Math.random()*100 + "%";
        star.style.opacity = Math.random()*0.7+0.2;
        star.style.animationDuration = Math.random()*3+2+"s";
        star.style.animationDelay = Math.random()*5+"s";

        stars.appendChild(star);
    }
}

function startBackgroundVideos(containerSelector=".stars"){

    const container = document.querySelector(containerSelector);
    if(!container) return;

    function moviePath(name){
        const parts = location.pathname.split('/');
        const base = parts.includes('wishes') ? '../movie/' : 'movie/';
        return base + name;
    }

    const sources = [
        moviePath('starA.mov'),
        moviePath('starB.mov'),
        moviePath('starC.mov'),
        moviePath('starD.mov')
    ];

    const video = document.createElement("video");
    video.className = "bg-video";
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    video.loop = false;

    container.insertBefore(video, container.firstChild);

    function playRandom(){
        const src = sources[Math.floor(Math.random()*sources.length)];
        video.src = src;
        video.load();
        const topVh = 5 + Math.random() * 70;
        video.style.top = topVh + 'vh';
        video.style.left = '50%';
        video.style.transform = 'translateX(-50%)';

        const p = video.play();
        if(p && typeof p.catch === "function") p.catch(()=>{});
    }

    video.addEventListener("ended", ()=>{
        setTimeout(playRandom, 500);
    });

    playRandom();
}

document.addEventListener("DOMContentLoaded",()=>{

    const wishPage = document.querySelector(".wish-page");
    const wishFrame = wishPage?.querySelector(".wish-header");

    if(document.querySelector(".wish-breadcrumb") && wishPage && wishFrame && !document.querySelector(".wish-list-back")){
        const backLink = document.createElement("a");
        backLink.className = "wish-list-back";
        backLink.href = "../wishes.html";
        backLink.setAttribute("aria-label", "願い事一覧に戻る");
        backLink.title = "願い事一覧に戻る";
        backLink.textContent = "←";
        wishPage.appendChild(backLink);

        const alignBackLink = () => {
            const frameRect = wishFrame.getBoundingClientRect();
            const pageRect = wishPage.getBoundingClientRect();
            backLink.style.top = wishFrame.offsetTop + "px";
            backLink.style.left = (Math.max(0, frameRect.left - backLink.offsetWidth - 8) - pageRect.left) + "px";
        };

        alignBackLink();
        window.addEventListener("resize", alignBackLink);
    }

    generateStars();
    startBackgroundVideos();
});