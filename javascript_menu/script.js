(() => {
    const cursorEffectLoader = document.createElement("script");
    cursorEffectLoader.src = new URL("cursor-stars.js", document.currentScript.src).href;
    document.head.appendChild(cursorEffectLoader);
})();

function initializePageLoader() {
    if (window.pageLoaderInitialized || document.readyState === "complete") return;
    window.pageLoaderInitialized = true;

    const loader = document.createElement("div");
    loader.className = "page-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.innerHTML = '<span class="page-loader-orbit" aria-hidden="true"><span class="page-loader-star">✦</span></span><span class="page-loader-text">星空を読み込んでいます...</span>';

    let pageReady = false;
    const showTimer = window.setTimeout(() => {
        if (pageReady) return;
        document.body.appendChild(loader);
        requestAnimationFrame(() => {
            if (!pageReady) loader.classList.add("is-visible");
        });
    }, 280);

    const hideLoader = () => {
        pageReady = true;
        window.clearTimeout(showTimer);
        loader.classList.remove("is-visible");
        window.setTimeout(() => loader.remove(), 300);
    };

    window.addEventListener("load", hideLoader, { once: true });
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) hideLoader();
    });
}

initializePageLoader();

const btn = document.querySelector("#js-btn");
const nav = document.querySelector("#js-nav");
const introScreen = document.querySelector(".intro-screen");
const indexContent = document.querySelector(".index-content");
const backToTop = document.querySelector(".index-back-to-top");

if(backToTop){
    backToTop.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
    });

    const updateBackToTop = () => {
        const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;

        if(isAtBottom){
            backToTop.classList.remove("is-hiding");
            backToTop.classList.add("is-visible");
        } else if(backToTop.classList.contains("is-visible")){
            backToTop.classList.remove("is-visible");
            backToTop.classList.add("is-hiding");
        }
    };

    backToTop.addEventListener("animationend", (event) => {
        if(event.animationName === "goat-pop-up" && backToTop.classList.contains("is-hiding")){
            backToTop.classList.remove("is-hiding");
        }
    });
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    window.addEventListener("resize", updateBackToTop);
    updateBackToTop();
}

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
        setTimeout(showTitle, 0);
    };

    setTimeout(showPeek, 300);

    if(shootingStar){
        shootingStar.addEventListener("animationend", openSky, { once: true });
        setTimeout(openSky, 1300);
    } else {
        setTimeout(openSky, 700);
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

const starStory = document.querySelector(".star-story");

if(starStory){
    const storySections = [...starStory.querySelectorAll(".story-section")];
    const storyHeading = starStory.querySelector(".story-heading");
    const storyReveals = [...starStory.querySelectorAll(".story-reveal")];
    const route = starStory.querySelector(".story-route-progress");
    const routeLine = starStory.querySelector(".story-route-line");
    const guideStar = starStory.querySelector(".story-guide-star");
    const starsLayer = document.querySelector(".index-page .stars");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if(prefersReducedMotion){
        storyReveals.forEach((item) => item.classList.add("is-visible"));
    } else {
        document.documentElement.classList.add("scroll-reveals-ready");

        if("IntersectionObserver" in window){
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if(!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

            storyReveals.forEach((item) => revealObserver.observe(item));
        } else {
            storyReveals.forEach((item) => item.classList.add("is-visible"));
        }
    }

    let updateRequested = false;
    let routeLength = 0;
    let routeSections = [];
    let routeBoundaries = [];
    let animationRequested = false;
    let currentDistance = 0;
    let targetDistance = 0;
    let lastSparkleBoundary = null;

    const animateStarPosition = () => {
        animationRequested = false;
        currentDistance += (targetDistance - currentDistance) * 0.12;

        if(Math.abs(targetDistance - currentDistance) < 0.2){
            currentDistance = targetDistance;
        }

        const point = route.getPointAtLength(currentDistance);
        route.style.strokeDashoffset = `${routeLength - currentDistance}`;
        guideStar.style.left = `${point.x}%`;
        guideStar.style.top = `${point.y / 10}%`;

        const sparkleThreshold = Math.max(routeLength * 0.004, 2);
        const boundaryIndex = routeBoundaries.findIndex((boundary) =>
            Math.abs(currentDistance - boundary) <= sparkleThreshold
        );
        if(boundaryIndex !== lastSparkleBoundary){
            guideStar.classList.toggle("is-sparkling", boundaryIndex !== -1);
            lastSparkleBoundary = boundaryIndex;
        }

        if(currentDistance !== targetDistance){
            animationRequested = true;
            window.requestAnimationFrame(animateStarPosition);
        }
    };

    const updateStoryScroll = () => {
        updateRequested = false;

        if(!prefersReducedMotion){
            const bounds = starStory.getBoundingClientRect();
            const progress = Math.min(1, Math.max(
                0,
                (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
            ));
            starStory.style.setProperty("--story-parallax-y", `${(0.5 - progress) * 18}px`);
            starsLayer?.style.setProperty("--sky-parallax-y", `${(progress - 0.5) * 24}px`);

            const viewportHeight = window.innerHeight;
            const focusLine = viewportHeight * 0.56;
            storyReveals.forEach((item) => {
                const itemBounds = item.getBoundingClientRect();
                const currentOffset = Number.parseFloat(item.style.getPropertyValue("--story-offset-y")) || 0;
                const itemCenter = itemBounds.top + itemBounds.height / 2 - currentOffset;
                const itemProgress = (focusLine - itemCenter) / viewportHeight;
                const incoming = Math.min(1, Math.max(0, (itemProgress + 0.48) / 0.48));
                const outgoing = Math.min(1, Math.max(0, (itemProgress - 0.18) / 0.58));
                const opacity = Math.min(incoming, 1 - outgoing);
                const offset = (1 - incoming) * 36 + outgoing * 40;

                item.style.setProperty("--story-opacity", opacity.toFixed(3));
                item.style.setProperty("--story-offset-y", `${offset.toFixed(2)}px`);
            });
        }

        if(!prefersReducedMotion && route && guideStar){
                const storyBounds = starStory.getBoundingClientRect();
                const focusY = window.innerHeight * 0.62 - storyBounds.top;
                const firstSection = routeSections[0];
                const lastSection = routeSections[routeSections.length - 1];
                if(!firstSection || !lastSection) return;

                let distance = 0;
                if(focusY <= firstSection.top){
                    const progress = Math.min(1, Math.max(0, focusY / Math.max(firstSection.top, 1)));
                    distance = firstSection.startLength * progress;
                } else if(focusY >= lastSection.bottom){
                    distance = lastSection.endLength;
                } else {
                    for(let index = 0; index < routeSections.length; index++){
                        const section = routeSections[index];
                        const nextSection = routeSections[index + 1];

                        if(focusY <= section.bottom){
                            const progress = Math.min(1, Math.max(
                                0,
                                (focusY - section.top) / Math.max(section.bottom - section.top, 1)
                            ));
                            distance = section.startLength + (section.endLength - section.startLength) * progress;
                            break;
                        }

                        if(nextSection && focusY < nextSection.top){
                            const progress = (focusY - section.bottom) / Math.max(nextSection.top - section.bottom, 1);
                            distance = section.endLength + (nextSection.startLength - section.endLength) * progress;
                            break;
                        }
                    }
                }

                targetDistance = distance;
                if(!animationRequested){
                    animationRequested = true;
                    window.requestAnimationFrame(animateStarPosition);
                }
        }
    };

    const requestStoryUpdate = () => {
        if(updateRequested) return;

        updateRequested = true;
        window.requestAnimationFrame(updateStoryScroll);
    };

    const rebuildStoryRoute = () => {
        const storyBounds = starStory.getBoundingClientRect();
        const scaleX = 100 / Math.max(storyBounds.width, 1);
        const scaleY = 1000 / Math.max(storyBounds.height, 1);
        const sections = [];
        const headingBounds = storyHeading?.getBoundingClientRect();
        const headingBottom = headingBounds
            ? (headingBounds.bottom - storyBounds.top) * scaleY
            : 0;
        let previousX = 92;
        let previousY = 0;
        let pathData = `M ${previousX} ${previousY}`;

        pathData += ` C 95 ${headingBottom * 0.3}, 92 ${headingBottom * 0.7}, 88 ${headingBottom}`;
        previousX = 88;
        previousY = headingBottom;
        route?.setAttribute("d", pathData);

        storySections.forEach((section) => {
            const bounds = section.getBoundingClientRect();
            const top = (bounds.top - storyBounds.top) * scaleY;
            const bottom = (bounds.bottom - storyBounds.top) * scaleY;
            const height = bottom - top;
            const isMobile = window.matchMedia("(max-width: 700px)").matches;
            const edgeX = isMobile
                ? 4
                : section.classList.contains("story-section--left")
                    ? (bounds.right - storyBounds.left) * scaleX + 4
                    : (bounds.left - storyBounds.left) * scaleX - 4;
            const entryX = Math.min(96, Math.max(4, edgeX));
            const gap = Math.max(top - previousY, 1);
            const horizontalTravel = entryX - previousX;

            pathData += ` C ${previousX + horizontalTravel * 0.32} ${previousY + gap * 0.4}, ${entryX - horizontalTravel * 0.32} ${top - gap * 0.4}, ${entryX} ${top}`;
            route?.setAttribute("d", pathData);
            const startLength = route?.getTotalLength() ?? 0;

            pathData += ` C ${entryX + 2.5} ${top + height * 0.3}, ${entryX - 2.5} ${top + height * 0.7}, ${entryX} ${bottom}`;
            route?.setAttribute("d", pathData);

            sections.push({
                section,
                top: bounds.top - storyBounds.top,
                bottom: bounds.bottom - storyBounds.top,
                startLength,
                endLength: route?.getTotalLength() ?? startLength
            });
            previousX = entryX;
            previousY = bottom;
        });

        const remainingHeight = Math.max(1000 - previousY, 1);
        pathData += ` C ${previousX + 6} ${previousY + remainingHeight * 0.35}, 50 ${1000 - remainingHeight * 0.35}, 50 1000`;
        route?.setAttribute("d", pathData);
        routeLength = route?.getTotalLength() ?? 0;
        if(sections.length) sections[sections.length - 1].endLength = routeLength;
        if(routeLine) routeLine.setAttribute("d", pathData);
        if(route) route.style.strokeDasharray = `${routeLength}`;
        routeSections = sections;
        routeBoundaries = routeSections.flatMap((section) => [section.startLength, section.endLength]);
        currentDistance = Math.min(currentDistance, routeLength);
        targetDistance = Math.min(targetDistance, routeLength);

        if(prefersReducedMotion){
            if(route) route.style.strokeDashoffset = "0";
            if(guideStar){
                guideStar.style.left = "92%";
                guideStar.style.top = "0%";
                guideStar.classList.remove("is-sparkling");
            }
        } else {
            requestStoryUpdate();
        }
    };

    if(!prefersReducedMotion){
        window.addEventListener("scroll", requestStoryUpdate, { passive: true });
    }
    window.addEventListener("resize", rebuildStoryRoute);
    rebuildStoryRoute();
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