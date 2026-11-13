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
