const eventSlideshow = document.querySelector(".event-slideshow");

if (eventSlideshow) {
    const photos = [
        "images/event/DSC05077.jpg",
        "images/event/C1257T01.JPG",
        "images/event/DSC05070.JPG",
        "images/event/DSC05104.JPG",
        "images/event/DSC05138.JPG",
        "images/event/DSC05139.JPG",
        "images/event/DSC05065.jpg",
        "images/event/DSC05113.JPG",
        "images/event/C0013T01.jpg",
        "images/event/DSC05142.JPG",
        "images/event/DSC05136.JPG",
        "images/event/DSC05079.JPG",
        "images/event/DSC05125.jpg",
        "images/event/DSC04601.JPG"
    ];
    const slides = eventSlideshow.querySelectorAll(".event-photo");
    const picker = document.querySelector(".event-photo-picker");
    const photoOptions = photos.map((_, index) => {
        const button = document.createElement("button");

        button.className = "event-photo-option";
        button.type = "button";
        button.setAttribute("aria-label", `写真 ${index + 1}を表示`);
        button.setAttribute("aria-pressed", String(index === 0));
        button.textContent = index === 0 ? "★" : "☆";
        button.addEventListener("click", () => showPhoto(index));
        picker.appendChild(button);
        return button;
    });
    let activeSlide = 0;
    let activePhoto = 0;
    let requestId = 0;
    let autoplayTimer;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scheduleNextPhoto = () => {
        window.clearTimeout(autoplayTimer);
        if (reducedMotion || picker.matches(":hover") || picker.contains(document.activeElement)) return;
        autoplayTimer = window.setTimeout(
            () => showPhoto((activePhoto + 1) % photos.length),
            2000
        );
    };

    const pauseAutoplay = () => window.clearTimeout(autoplayTimer);
    picker.addEventListener("pointerenter", pauseAutoplay);
    picker.addEventListener("focusin", pauseAutoplay);
    picker.addEventListener("pointerleave", scheduleNextPhoto);
    picker.addEventListener("focusout", (event) => {
        if (!picker.contains(event.relatedTarget)) scheduleNextPhoto();
    });

    function showPhoto(photoIndex) {
        if (photoIndex === activePhoto) {
            scheduleNextPhoto();
            return;
        }

        const currentRequestId = ++requestId;
        const preload = new Image();
        preload.onload = () => {
            if (currentRequestId !== requestId) return;

            const nextSlide = 1 - activeSlide;
            slides[nextSlide].src = photos[photoIndex];
            slides[nextSlide].alt = "七夕イベントの様子";
            slides[nextSlide].setAttribute("aria-hidden", "false");
            slides[activeSlide].setAttribute("aria-hidden", "true");
            slides[nextSlide].classList.add("is-visible");
            slides[activeSlide].classList.remove("is-visible");
            activeSlide = nextSlide;
            activePhoto = photoIndex;
            photoOptions.forEach((option, index) => {
                option.setAttribute("aria-pressed", String(index === activePhoto));
                option.textContent = index === activePhoto ? "★" : "☆";
            });
            scheduleNextPhoto();
        };
        preload.onerror = () => {
            if (currentRequestId !== requestId) return;
            console.error(`イベント写真を読み込めませんでした: ${photos[photoIndex]}`);
            scheduleNextPhoto();
        };
        preload.src = photos[photoIndex];
    }

    scheduleNextPhoto();
}
