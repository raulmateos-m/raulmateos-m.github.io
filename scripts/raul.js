let pageid = 'page';
const pathname = window.location.pathname;
const pathSegments = pathname.split('/');
let pagename = pathSegments.pop();
let basepath = '';
const isRainbow = pathname.includes('rainbow');
const isIronMaiden = pathname.includes('iron_maiden');
const isSingles = pathname.includes('/singles');
const isBootlegs = pathname.includes('bootlegs');
const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !isRainbow && !isIronMaiden;
const boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format',
	spec = ' , not including those listed on specific pages',
	specCD = ' (not including those listed on specific pages)',
	updated = '. ' + collectionUpdateNote;
let records = 'records';
const formatList = [
	{format: '7"', label: '7" singles/EPs'},
	{format: '12"', label: '12" singles/EPs'},
	{format: 'LP', label: 'LPs'},
	{format: 'CD', label: 'CDs'},
	{format: 'DVD', label: 'DVDs'},
	{format: 'Box', label: 'Boxes'}
];
const mainMenuItems = [
	{text: 'Rainbow (Dio)', href: 'rainbow/vinyl.html'},
	{text: 'Iron Maiden', href: 'iron_maiden/singles.html'},
	{text: 'Deep Purple', href: 'deep_purple.html'},
	{text: 'Black Sabbath', href: 'black_sabbath.html'},
	{text: 'DIO', href: 'dio.html'},
	{text: 'Vinyl Collection', href: 'vinyl.html'},
	{text: 'CD Collection', href: 'CD.html'}
];
const menuItems = {
	'rainbow': [
		{text: 'Vinyl', href: 'vinyl.html'},
		{text: 'CD & DVD', href: 'CD.html'},
		{text: 'Bootlegs', href: 'bootlegs.html'},
		{text: 'Without Dio', href: 'others.html'}
	],
	'iron_maiden': [
		{text: 'Vinyl - Singles', href: 'singles.html'},
		{text: 'Vinyl - LP', href: 'LP.html' },
		{text: 'CD - Singles', href: 'CD_singles.html'},
		{text: 'CD', href: 'CD.html'},
		{text: 'Cassette', href: 'cassette.html'},
		{text: 'Bootlegs', href: 'bootlegs.html'}
	]
};	
document.addEventListener("DOMContentLoaded", function() {
	const nav = document.getElementById('nav'),
		navb = document.getElementById('navb'),
		nav2 = document.getElementById('nav2'),
		ind = document.getElementById('ind'),
		clr = document.getElementById('clr'),
		msg = document.getElementById('msg'),
		msg2 = document.getElementById('msg2'),
		navt = document.getElementById('nav-toggle'),
		up = document.getElementById('up');
	const message = {msg, msg2};
	const navtb = [nav, navt, navb];
	const cached = {
		input: document.querySelector('input'),
		header: document.querySelector('header'),
		rows: [],
		tablas: Array.from(document.querySelectorAll('.tablesorter')),
		sections: Array.from(document.querySelectorAll('section')),
		s: Array.from(document.querySelectorAll('.s')),
		allh3: Array.from(document.querySelectorAll('section h3'))
	};
	const formatConfigs = {	
		'bootlegs': {formats: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
		'rainbow/vinyl': {formats: ['7"', 'LP', 'Box'], suffix: ''},
		'rainbow/CD': {formats: ['CD', 'DVD', 'Box'], suffix: ''},
		'iron_maiden/singles': {formats: ['7"', '12"', 'Box'], suffix: ''},
		'vinyl': {formats: ['7"', '12"', 'LP', 'Box'], suffix: spec + boot},
		'CD': {formats: ['CD'], suffix: specCD + boot},
		'default': {formats: ['7"', '12"', 'LP', 'CD', 'Box'], suffix: boot}
	};
	const matchedPath = Object.keys(formatConfigs).find(pathPart => pathname.includes(pathPart));
	const config = matchedPath ? formatConfigs[matchedPath] : formatConfigs.default;
	const filteredTerms = formatList.filter(term => config.formats.includes(term.format));
	const columnIndex = (filteredTerms.length === 4 && filteredTerms.some(term => term.format === '12"')) ? 4 : 3;
	cached.tablas.forEach(tabla => {
		const rows = Array.from(tabla.querySelectorAll('tbody tr'));
		if (isRootCDorVinyl) {tabla.classList.add('is-root-cd-vinyl');}
		rows.forEach(row => {
			row._searchText = row.textContent.toLowerCase();
			const formatCell = row.children[columnIndex];
			row._formatText = formatCell ? formatCell.textContent : '';
		});
		cached.rows.push(...rows);
		new Tablesort(tabla);
	});
	const totalRecords = cached.rows.length;
	function createSubmenuItems(items) {
		return items.reduce((fragment, item) => {
			const li = document.createElement('li');
			li.innerHTML = `<a href="${item.href}">${item.text}</a>`;
			fragment.appendChild(li);
			return fragment;
		}, document.createDocumentFragment());
	}
	function updateNavigation(elem, page, id) {
		if (menuItems[page]) {elem.appendChild(createSubmenuItems(menuItems[page]));}
		const selector = pagename.includes('.html') ? `a[href='${pagename}']` : `a[href*='${pagename}']`;	
		const link = elem.querySelector(selector);
		if (link?.parentElement) {
			link.parentElement.id = id;
			link.parentElement.textContent = link.textContent;
		}
	}
	function setPageContext(page, id) {
		pagename = page;
		pageid = id;
		basepath = '../';
	}
	if (isRainbow) {
		updateNavigation(navb, 'rainbow', 'page3');
		setPageContext('rainbow', 'page2');
	} else if (isIronMaiden) {
		updateNavigation(navb, 'iron_maiden', isSingles || isBootlegs ? 'page3' : 'page4');
		setPageContext('iron_maiden', 'page2');
		records = pathname.includes('cassette') ? 'cassettes' : records;
	} else if (isRootCDorVinyl) {pageid = 'page2';}
	if (pathname.includes('CD') && !isRainbow) {records = 'CDs';}
	function createSectionLink(id, name) {
		const li = document.createElement('li');
		li.insertAdjacentHTML('beforeend', `<a href="#${id}">${name}</a>`);
		return li;
	}
	const mainMenu = mainMenuItems.map(item => `<li><a href="${basepath}${item.href}">${item.text}</a></li>`).join('');
	nav.insertAdjacentHTML('beforeend', mainMenu);
	updateNavigation(nav, null, pageid);
	if (nav2) {
		cached.allh3.forEach(h3 => {
			const section = h3.closest('section');
			if (section) nav2.appendChild(createSectionLink(section.id, h3.textContent));
		});
	}
	function toggleNav() {navtb.forEach(el => el.classList.toggle('collapsed'));}
	navt?.addEventListener('click', toggleNav);
	cached.input.placeholder = `Type here to search in the ${totalRecords} items`;
	function getRecordInfo(found, isSearchMessage = false) {
		if (isIronMaiden && !isSingles && !isBootlegs) {return isSearchMessage ? '' : updated;}
		if (filteredTerms.length === 1 && filteredTerms[0].format === 'CD') {return isSearchMessage ? '' : config.suffix + updated;}
		const counts = Object.fromEntries(filteredTerms.map(term => [term.format, 0]));
		found.forEach(row => {
			const formatText = row._formatText;
			filteredTerms.forEach(term => {if (formatText.includes(term.format)) {counts[term.format]++;}});
		});
		const countInfo = ` (${filteredTerms.map(term => `${term.label}: <span class="c">${counts[term.format]}</span>`).join('; ')})`;
		return isSearchMessage ? countInfo : countInfo + config.suffix + updated;
	}
	const updateMsgText = (found, targetMsg, msgText) => {
		const element = message[targetMsg];
		element.innerHTML = msgText + (found.length !== 0 ? getRecordInfo(found, targetMsg === 'msg2') : '');
	};
	updateMsgText(cached.rows, 'msg', `<span class="bo">${totalRecords}</span> ${records}`);
	function resetVisibility() {
		cached.rows.forEach(row => row.hidden = false);
		cached.sections.forEach(section => section.hidden = false);
		cached.tablas.forEach(tabla => tabla.hidden = false);
		msg2.innerHTML = '&nbsp;';
	}
	function filterRows(searchTerms) {
		const foundRows = [];
		const parents = new WeakSet();
		cached.rows.forEach(row => {
			const matches = searchTerms.every(term => row._searchText.includes(term));
			row.hidden = !matches;
			if (matches) {
				foundRows.push(row);
				parents.add(row._section ??= row.closest('section'));
				parents.add(row._tabla ??= row.closest('.tablesorter'));
			}
		});
		cached.sections?.forEach(s => s.hidden = !parents.has(s));
		cached.tablas?.forEach(t => t.hidden = !parents.has(t));
		return foundRows;
	}
	cached.input.addEventListener('input', function() {
		const searchTerms = this.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
		if (searchTerms.length === 0) {
			resetVisibility();
			return;
		}
		const foundRows = filterRows(searchTerms);
		updateMsgText(foundRows, 'msg2', foundRows.length === 0
			? `No ${records} found`
			: `<span class="bo">${foundRows.length}</span> ${records} found`
		);
	});
	clr.addEventListener('click', () => {
		cached.input.value = '';
		cached.input.focus();
		resetVisibility();
	});
	document.addEventListener('keyup', evt => {if (evt.key === 'Escape' && nav.classList.contains('collapsed')) {toggleNav();}});
	if (ind) {
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
		const links = [...letters.map(l => `<a href="#${l}">${l}</a>`), '<a href="#V/A">Compilations</a>'];
		ind.innerHTML = links.join(' ');
	}
	const tocLinkHtml = '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>';
	cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLinkHtml));
	up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');
	cached.header.id = 'toc';
});