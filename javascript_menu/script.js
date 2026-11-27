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

const openingStory = document.querySelector(".opening-story");

if(openingStory){
    const photosLayer = openingStory.querySelector(".opening-story__photos");
    const destination = openingStory.querySelector(".opening-story__destination");
    const starsLayer = document.querySelector(".index-page .stars");
    const question = openingStory.querySelector(".opening-story__message--question");
    const discarded = openingStory.querySelector(".opening-story__message--discarded");
    const ending = openingStory.querySelector(".opening-story__message--ending");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const photoSources = [
        "images/picture/DSC05112.JPG",
        "images/picture/DJI_20260707193401_0047_D.JPG",
        "images/picture/DSC05109.JPG",
        "images/picture/DSC05092.JPG",
        "images/picture/DSC05090.JPG"
    ];
    const photoPositions = [
        { x: 30, y: 28, rotation: -8 },
        { x: 70, y: 28, rotation: 7 },
        { x: 30, y: 72, rotation: 6 },
        { x: 70, y: 72, rotation: -7 },
        { x: 50, y: 50, rotation: 4 }
    ];
    const photos = photoSources
        .map((src, index) => ({ src, ...photoPositions[index] }))
        .map((photo, index) => {
            const frame = document.createElement("span");
            const image = document.createElement("img");
            frame.className = "opening-story__photo";
            image.src = photo.src;
            image.alt = "";
            image.draggable = false;
            frame.style.left = `${photo.x}%`;
            frame.style.top = `${photo.y}%`;
            frame.style.setProperty("--photo-rotation", `${photo.rotation}deg`);
            frame.appendChild(image);
            photosLayer?.appendChild(frame);
            return { element: frame, index };
        });
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const fadeBetween = (value, start, end) => clamp((value - start) / (end - start));
    let openingStart = openingStory.getBoundingClientRect().top + window.scrollY;
    let updateRequested = false;

    const updateOpeningStory = () => {
        updateRequested = false;
        const scrollRange = Math.max(openingStory.offsetHeight - window.innerHeight, 1);
        const progress = clamp((window.scrollY - openingStart) / scrollRange);
        const cameraProgress = fadeBetween(progress, 0, 0.22);
        const zoomOutProgress = fadeBetween(progress, 0.94, 0.97);
        const backgroundZoom = 1.06 + cameraProgress * 0.82 * (1 - zoomOutProgress);
        starsLayer?.style.setProperty("--sky-zoom", `${backgroundZoom}`);
        if(destination){
            const arrival = fadeBetween(progress, 0.16, 0.22);
            const bloom = fadeBetween(progress, 0.17, 0.22) * (1 - fadeBetween(progress, 0.25, 0.33));
            destination.style.setProperty("--destination-scale", `${0.4 + cameraProgress * 2.6}`);
            destination.style.setProperty("--destination-blur", `${1 + cameraProgress * 4}px`);
            destination.style.setProperty("--destination-bloom", `${bloom}`);
            destination.style.setProperty("--destination-bloom-scale", `${0.3 + bloom * 1.4}`);
            destination.style.opacity = `${0.55 + arrival * 0.45}`;
        }
        const setMessage = (element, opacity, offset = 1 - opacity) => {
            if(!element) return;
            element.style.opacity = `${opacity}`;
            if(!prefersReducedMotion) element.style.transform = `translateY(${offset * 18}px)`;
        };

        setMessage(
            question,
            fadeBetween(progress, 0.18, 0.24) * (1 - fadeBetween(progress, 0.34, 0.4))
        );
        setMessage(
            discarded,
            fadeBetween(progress, 0.5, 0.57) * (1 - fadeBetween(progress, 0.8, 0.88))
        );
        setMessage(ending, fadeBetween(progress, 0.87, 0.94));

        photos.forEach(({ element, index }) => {
            const photoProgress = (progress - (0.5 + index * 0.025)) / 0.22;
            const visible = fadeBetween(photoProgress, 0, 0.18) * (1 - fadeBetween(progress, 0.69, 0.79));
            element.style.opacity = `${visible}`;
            if(prefersReducedMotion){
                element.style.transform = "translate(-50%, -50%)";
                return;
            }

            const scale = photoProgress < 0.2
                ? 0.55 + photoProgress * 2.25
                : 1 - fadeBetween(progress, 0.69, 0.79) * 0.2;
            const rotation = (Number.parseFloat(element.style.getPropertyValue("--photo-rotation")) || 0);
            element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
        });

        if(progress >= 0.97) indexContent?.classList.add("content-visible");
    };

    const requestOpeningUpdate = () => {
        if(updateRequested) return;
        updateRequested = true;
        window.requestAnimationFrame(updateOpeningStory);
    };

    window.addEventListener("scroll", requestOpeningUpdate, { passive: true });
    window.addEventListener("resize", () => {
        openingStart = openingStory.getBoundingClientRect().top + window.scrollY;
        requestOpeningUpdate();
    });
    requestOpeningUpdate();
}

const starStory = document.querySelector(".star-story");

if(starStory){
    const storySections = [...starStory.querySelectorAll(".story-section")];
    const storyHeading = starStory.querySelector(".story-heading");
    const storyReveals = [...starStory.querySelectorAll(".story-reveal")];
    const route = starStory.querySelector(".story-route-progress");
    const routeLine = starStory.querySelector(".story-route-line");
    const constellation = starStory.querySelector(".story-constellation-stars");
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
    let constellationStars = [];
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
        constellationStars.forEach((star) => {
            star.element.classList.toggle("is-connected", currentDistance >= star.distance - 1);
        });

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
        const starDistances = [];
        const headingBounds = storyHeading?.getBoundingClientRect();
        const headingBottom = headingBounds
            ? (headingBounds.bottom - storyBounds.top) * scaleY
            : 0;
        let previousX = 92;
        let previousY = 0;
        let pathData = `M ${previousX} ${previousY}`;

        starDistances.push(0);
        pathData += ` L 88 ${headingBottom}`;
        previousX = 88;
        previousY = headingBottom;
        route?.setAttribute("d", pathData);
        starDistances.push(route?.getTotalLength() ?? 0);

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
            pathData += ` L ${entryX} ${top}`;
            route?.setAttribute("d", pathData);
            const startLength = route?.getTotalLength() ?? 0;
            starDistances.push(startLength);

            pathData += ` L ${entryX} ${bottom}`;
            route?.setAttribute("d", pathData);
            const endLength = route?.getTotalLength() ?? startLength;
            starDistances.push(endLength);

            sections.push({
                section,
                top: bounds.top - storyBounds.top,
                bottom: bounds.bottom - storyBounds.top,
                startLength,
                endLength
            });
            previousX = entryX;
            previousY = bottom;
        });

        pathData += " L 50 1000";
        route?.setAttribute("d", pathData);
        routeLength = route?.getTotalLength() ?? 0;
        if(sections.length) sections[sections.length - 1].endLength = routeLength;
        if(routeLine) routeLine.setAttribute("d", pathData);
        if(route) route.style.strokeDasharray = `${routeLength}`;
        routeSections = sections;
        routeBoundaries = routeSections.flatMap((section) => [section.startLength, section.endLength]);
        starDistances.push(routeLength);
        constellationStars = [];
        if(constellation && route){
            constellation.replaceChildren();
            const radiusX = 2.2 * 100 / Math.max(storyBounds.width, 1);
            const radiusY = 2.2 * 1000 / Math.max(storyBounds.height, 1);
            const glowRadiusX = 5.5 * 100 / Math.max(storyBounds.width, 1);
            const glowRadiusY = 5.5 * 1000 / Math.max(storyBounds.height, 1);

            starDistances.forEach((distance) => {
                const point = route.getPointAtLength(distance);
                const star = document.createElementNS("http://www.w3.org/2000/svg", "g");
                star.classList.add("story-constellation-star");

                const glow = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                glow.classList.add("story-constellation-star__glow");
                glow.setAttribute("cx", `${point.x}`);
                glow.setAttribute("cy", `${point.y}`);
                glow.setAttribute("rx", `${glowRadiusX}`);
                glow.setAttribute("ry", `${glowRadiusY}`);

                const core = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                core.classList.add("story-constellation-star__core");
                core.setAttribute("cx", `${point.x}`);
                core.setAttribute("cy", `${point.y}`);
                core.setAttribute("rx", `${radiusX}`);
                core.setAttribute("ry", `${radiusY}`);

                star.append(glow, core);
                constellation.appendChild(star);
                constellationStars.push({ element: star, distance });
            });
        }
        currentDistance = Math.min(currentDistance, routeLength);
        targetDistance = Math.min(targetDistance, routeLength);

        if(prefersReducedMotion){
            if(route) route.style.strokeDashoffset = "0";
            constellationStars.forEach((star) => star.element.classList.add("is-connected"));
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