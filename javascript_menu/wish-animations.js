(() => {
	const cursorEffectLoader = document.createElement('script');
	cursorEffectLoader.src = new URL('cursor-stars.js', document.currentScript.src).href;
	document.head.appendChild(cursorEffectLoader);
})();

function initializePageLoader() {
	if (window.pageLoaderInitialized || document.readyState === 'complete') return;
	window.pageLoaderInitialized = true;

	const loader = document.createElement('div');
	loader.className = 'page-loader';
	loader.setAttribute('role', 'status');
	loader.setAttribute('aria-live', 'polite');
	loader.innerHTML = '<span class="page-loader-orbit" aria-hidden="true"><span class="page-loader-star">✦</span></span><span class="page-loader-text">星空を読み込んでいます...</span>';

	let pageReady = false;
	const showTimer = window.setTimeout(() => {
		if (pageReady) return;
		document.body.appendChild(loader);
		requestAnimationFrame(() => {
			if (!pageReady) loader.classList.add('is-visible');
		});
	}, 280);

	const hideLoader = () => {
		pageReady = true;
		window.clearTimeout(showTimer);
		loader.classList.remove('is-visible');
		window.setTimeout(() => loader.remove(), 300);
	};

	window.addEventListener('load', hideLoader, { once: true });
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) hideLoader();
	});
}

initializePageLoader();

document.querySelectorAll('a[href$="../wishes.html"]').forEach((link) => {
	link.addEventListener('click', () => {
		sessionStorage.setItem('skip-wishes-intro', 'true');
	});
});

const wishHeader = document.querySelector('.wish-header');
const wishImage = wishHeader?.querySelector('.wish-image img');

if (wishHeader && wishImage) {
	const imagePath = decodeURIComponent(new URL(wishImage.src).pathname);
	const categoryFolder = imagePath.split('/').at(-2);
	const categoryByName = {
		'夢': 'dream',
		'家族': 'family',
		'友達': 'friend',
		'健康': 'health',
		'趣味': 'hobby',
		'恋愛': 'love',
		'お金': 'money',
		'その他': 'other',
		'勉強': 'study',
		'仕事': 'work'
	};
	const categoryByFolder = {
		dream: 'dream',
		family: 'family',
		friend: 'friend',
		health: 'health',
		hobby: 'hobby',
		love: 'love',
		money: 'money',
		other: 'other',
		study: 'study',
		'survey×': 'survey',
		work: 'work'
	};
	const pageNumber = window.location.pathname.match(/wish(\d+)\.html$/i)?.[1];
	const imageNumber = imagePath.match(/tanzaku(\d+)\.png$/i)?.[1];
	const imageMatchesPage = pageNumber && imageNumber && Number(pageNumber) === Number(imageNumber);
	const categoryName = wishHeader.querySelector('.wish-summary h2')?.textContent.trim();
	const categoryClass = imageMatchesPage
		? categoryByFolder[categoryFolder] || categoryByName[categoryName]
		: categoryByName[categoryName];

	if (categoryClass) wishHeader.classList.add(`wish-header--${categoryClass}`);
	const imageContainer = wishImage.closest('.wish-image');
	const hideMissingImage = () => {
		imageContainer.hidden = true;
	};

	wishImage.addEventListener('error', hideMissingImage, { once: true });
	if (!imageMatchesPage || (wishImage.complete && wishImage.naturalWidth === 0)) hideMissingImage();
}

const wishTextElements = document.querySelectorAll(
	'.wish-summary > h2, .wish-summary > h3, .wish-summary > p, .wish-summary > .wish-tags > .wish-tag, ' +
	'.wish-summary > .wish-rating, .wish-detail > h3, .wish-detail > p, ' +
	'.wish-detail > ul > li, .wish-actions > a'
);

wishTextElements.forEach((element, index) => {
	element.style.animationDelay = `${index * 100}ms`;
	element.classList.add('wish-slide-in');
});
