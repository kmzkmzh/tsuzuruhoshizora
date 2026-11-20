(() => {
    if (window.cursorStarEffectInitialized) return;
    window.cursorStarEffectInitialized = true;

    if (
        window.matchMedia("(hover: hover) and (pointer: fine)").matches === false ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    const activeFragments = new Set();
    const fragmentLimit = 14;
    const fragments = ["✦", "✧"];
    let lastX = 0;
    let lastY = 0;
    let lastSpawnTime = 0;

    document.addEventListener("pointermove", (event) => {
        const now = performance.now();
        const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
        if (distance < 14 || now - lastSpawnTime < 28) return;

        lastX = event.clientX;
        lastY = event.clientY;
        lastSpawnTime = now;

        const fragment = document.createElement("span");
        fragment.className = "cursor-star-fragment";
        fragment.setAttribute("aria-hidden", "true");
        fragment.textContent = fragments[Math.floor(Math.random() * fragments.length)];
        fragment.style.left = `${event.clientX}px`;
        fragment.style.top = `${event.clientY}px`;
        fragment.style.setProperty("--fragment-size", `${Math.random() * 8 + 8}px`);
        fragment.style.setProperty("--fragment-x", `${Math.random() * 44 - 22}px`);
        fragment.style.setProperty("--fragment-y", `${Math.random() * 44 - 22}px`);

        if (activeFragments.size >= fragmentLimit) {
            const oldestFragment = activeFragments.values().next().value;
            activeFragments.delete(oldestFragment);
            oldestFragment.remove();
        }

        activeFragments.add(fragment);
        fragment.addEventListener("animationend", () => {
            activeFragments.delete(fragment);
            fragment.remove();
        }, { once: true });
        document.body.appendChild(fragment);
    }, { passive: true });
})();
