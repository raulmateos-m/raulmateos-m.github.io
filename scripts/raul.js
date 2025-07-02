const pathname = window.location.pathname;
let pagename = pathname.split('/').pop();
const isRainbow = pathname.includes('rainbow');
const isIronMaiden = pathname.includes('iron_maiden');
const isSingles = pathname.includes('/singles');
const isBootlegs = pathname.includes('bootlegs');
const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !/rainbow|iron_maiden/.test(pathname);
const boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format',
	spec = ' , not including those listed on specific pages',
	specCD = ' (not including those listed on specific pages)',
	updated = '. ' + collectionUpdateNote;
const formatList = [
	{format: '7"', label: '7" singles/EPs'},
	{format: '12"', label: '12" singles/EPs'},
	{format: 'LP', label: 'LPs'},
	{format: 'CD', label: 'CDs'},
	{format: 'DVD', label: 'DVDs'},
	{format: 'Box', label: 'Boxes'}
];
const formatConfigs = {
	'bootlegs': {formats: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
	'rainbow/vinyl': {formats: ['7"', 'LP', 'Box'], suffix: ''},
	'rainbow/CD': {formats: ['CD', 'DVD', 'Box'], suffix: ''},
	'iron_maiden/singles': {formats: ['7"', '12"', 'Box'], suffix: ''},
	'vinyl': {formats: ['7"', '12"', 'LP', 'Box'], suffix: spec + boot},
	'CD': {formats: ['CD'], suffix: specCD + boot},
	'default': {formats: ['7"', '12"', 'LP', 'CD', 'Box'], suffix: boot}
};
const menuItems = {
	'main': [
		{text: 'Rainbow (Dio)', href: 'rainbow/vinyl.html'},
		{text: 'Iron Maiden', href: 'iron_maiden/singles.html'},
		{text: 'Deep Purple', href: 'deep_purple.html'},
		{text: 'Black Sabbath', href: 'black_sabbath.html'},
		{text: 'DIO', href: 'dio.html'},
		{text: 'Vinyl Collection', href: 'vinyl.html'},
		{text: 'CD Collection', href: 'CD.html'}
	],
	'rainbow': [
		{text: 'Vinyl', href: 'vinyl.html'},
		{text: 'CD & DVD', href: 'CD.html'},
		{text: 'Bootlegs', href: 'bootlegs.html'},
		{text: 'Without Dio', href: 'others.html'}
	],
	'iron_maiden': [
		{text: 'Vinyl - Singles', href: 'singles.html'},
		{text: 'Vinyl - LP', href: 'LP.html'},
		{text: 'CD - Singles', href: 'CD_singles.html'},
		{text: 'CD', href: 'CD.html'},
		{text: 'Cassette', href: 'cassette.html'},
		{text: 'Bootlegs', href: 'bootlegs.html'}
	]
};
const matchedPath = Object.keys(formatConfigs).find(pathPart => pathname.includes(pathPart));
const config = matchedPath ? formatConfigs[matchedPath] : formatConfigs.default;
const filteredTerms = formatList.filter(term => config.formats.includes(term.format));
const columnIndex = (filteredTerms.length === 4 && filteredTerms.some(term => term.format === '12"')) ? 4 : 3;

document.addEventListener("DOMContentLoaded", function() {
	let records = 'records', pageid = 'page', basepath = '';
	const $ = id => document.getElementById(id);
	const $$ = sel => document.querySelectorAll(sel);
	const cached = {
		nav: $('nav'), navb: $('navb'), nav2: $('nav2'), ind: $('ind'), clr: $('clr'),
		msg: $('msg'), msg2: $('msg2'), navt: $('nav-toggle'), up: $('up'), rows: [],
		input: document.querySelector('input'), tablas: Array.from($$('.tablesorter')),
		sections: Array.from($$('section')), s: Array.from($$('.s')), allh3: Array.from($$('section h3'))
	};
	const navtb = [cached.nav, cached.navt, cached.navb];

	if (isRainbow) {
		updateNavigation(cached.navb, 'rainbow', 'page3');
		setPageContext('rainbow', 'page2');
	} else if (isIronMaiden) {
		updateNavigation(cached.navb, 'iron_maiden', isSingles || isBootlegs ? 'page3' : 'page4');
		setPageContext('iron_maiden', 'page2');
		records = pathname.includes('cassette') ? 'cassettes' : records;
	} else if (isRootCDorVinyl) {pageid = 'page2';}
	if (pathname.includes('CD') && !isRainbow) {records = 'CDs';}

	function initTables() {
		cached.tablas.forEach(tabla => {
			if (isRootCDorVinyl) {tabla.classList.add('is-root-cd-vinyl');}
			const rows = Array.from(tabla.tBodies[0].rows);
			rows.forEach(row => {
				row._searchText = row.textContent.toLowerCase();
				row._formatText = row.cells[columnIndex]?.textContent || '';
			});
			cached.rows.push(...rows);
			new Tablesort(tabla);
		});
	}
	function init() {
		const mainMenuList = menuItems.main.map(item => ({...item, href: `${basepath}${item.href}`}));
		cached.nav.append(createMenuItems(mainMenuList));
		updateNavigation(cached.nav, null, pageid);
		if (cached.nav2) {
			const items = cached.allh3.reduce((acc, h3) => {
				const section = h3.closest('section');
				if (section) {acc.push({href: `#${section.id}`, text: h3.textContent});}
				return acc;
			}, []);
			cached.nav2.append(createMenuItems(items));
		}
		cached.input.placeholder = `Type here to search in the ${cached.rows.length} items`;
		updateInitialMessage();
		const tocLink = '<a href="#toc"><i class="icon-long-arrow-up"></i></a>';
		cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLink));
		cached.up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>');
		createIndex();
	}
	function setupEventListeners() {
		cached.input.addEventListener('input', function() {
			const searchTerms = this.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
			if (searchTerms.length === 0) {
				resetVisibility();
				return;
			}
			const visibleRows = filterAndShowRows(searchTerms);
			updateSearchResultMessage(visibleRows);
		});

		function toggleNav() {navtb.forEach(el => el?.classList?.toggle('collapsed'));}
		cached.navt?.addEventListener('click', toggleNav);
		cached.clr.addEventListener('click', () => {
			cached.input.value = '';
			cached.input.dispatchEvent(new Event('input'));
			cached.input.focus();
		});
		document.addEventListener('keyup', evt => {
			if (evt.key === 'Escape' && cached.nav.classList.contains('collapsed')) {toggleNav();}
		});
	}
	function filterAndShowRows(searchTerms) {
		const visibleRows = [];
		const parentsToShow = new Set();
		for (const row of cached.rows) {
			const isMatch = searchTerms.every(term => row._searchText.includes(term));
			row.hidden = !isMatch;
			if (isMatch) {
				visibleRows.push(row);
				parentsToShow.add(row._section ??= row.closest('section'));
				parentsToShow.add(row._tabla ??= row.closest('.tablesorter'));
			}
		}
		cached.sections?.forEach(s => s.hidden = !parentsToShow.has(s));
		cached.tablas?.forEach(t => t.hidden = !parentsToShow.has(t));
		return visibleRows;
	}
	function getRecordCounts(visible) {
		const counts = Object.fromEntries(formatList.map(({format}) => [format, 0]));
		for (const row of visible) {
			for (const {format} of filteredTerms) {
				if (row._formatText.includes(format)) {counts[format]++;}
			}
		}
		return counts;
	}
	function formatRecordInfo(counts, isSearch = false) {
		if (isIronMaiden && !isSingles && !isBootlegs) return isSearch ? '' : updated;
		if (filteredTerms.length === 1 && filteredTerms[0].format === 'CD') {
			return isSearch ? '' : `${config.suffix}${updated}`;
		}
		const countInfo = filteredTerms
			.map(({format, label}) => `${label}: <span class="c">${counts[format]}</span>`)
			.join('; ');
		return isSearch ? `(${countInfo})` : ` (${countInfo})${config.suffix}${updated}`;
	}
	function updateInitialMessage() {
		const totalCount = cached.rows.length;
		const leadingText = `<span class="bo">${totalCount}</span> ${records} `;
		const counts = getRecordCounts(cached.rows);
		cached.msg.innerHTML = `${leadingText}${formatRecordInfo(counts, false)}`;
	}
	function updateNavigation(elem, page, id) {
		if (menuItems[page]) {elem.appendChild(createMenuItems(menuItems[page]));}
		const selector = pagename.includes('.html') ? `a[href='${pagename}']` : `a[href*='${pagename}']`;
		const link = elem.querySelector(selector);
		if (link?.parentElement) {
			link.parentElement.id = id;
			link.parentElement.textContent = link.textContent;
		}
	}
	function updateSearchResultMessage(visibleRows) {
		const visibleCount = visibleRows.length;
		if (visibleCount === 0) {
			cached.msg2.innerHTML = `No ${records} found`;
			return;
		}
		const counts = getRecordCounts(visibleRows);
		const formattedInfo = formatRecordInfo(counts, true);
		cached.msg2.innerHTML = `<span class="bo">${visibleCount}</span> ${records} found ${formattedInfo}`;
	}
	function resetVisibility() {
		cached.rows.forEach(row => row.hidden = false);
		cached.sections.forEach(section => section.hidden = false);
		cached.tablas.forEach(tabla => tabla.hidden = false);
		cached.msg2.innerHTML = '';
	}
	function createMenuItems(items) {
		const htmlString = items.map(item => `<li><a href="${item.href}">${item.text}</a></li>`).join('');
		const range = document.createRange();
		return range.createContextualFragment(htmlString);
	}
	function setPageContext(page, id) {
		pagename = page;
		pageid = id;
		basepath = '../';
	}
	function createIndex() {
		if (!cached.ind) return;
		const letters = Array.from({length: 26}, (_, i) => {
			const letter = String.fromCharCode(65 + i);
			return `<a href="#${letter}">${letter}</a>`;}).join(' ');
		cached.ind.innerHTML = `${letters} <a href="#V/A">Compilations</a>`;
	}

	initTables();
	init();
	setupEventListeners();
});