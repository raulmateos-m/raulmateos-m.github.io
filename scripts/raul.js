const {pathname} = window.location;
let pagename = pathname.split('/').pop();
const includes = {
	rainbow: pathname.includes('rainbow'),
	maiden: pathname.includes('iron_maiden'),
	singles: pathname.includes('/singles'),
	bootlegs: pathname.includes('bootlegs'),
	cassette: pathname.includes('cassette')
};
const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !/rainbow|iron_maiden/.test(pathname);
const formatList = [
	{format: '7"', label: '7" single/EP', plural: '7" singles/EPs'},
	{format: '10"', label: '10" single', plural: '10" singles'},	
	{format: '12"', label: '12" single/EP', plural: '12" singles/EPs'},
	{format: 'LP', plural: 'LPs'},
	{format: 'CD', plural: 'CDs'},
	{format: 'DVD', plural: 'DVDs'},
	{format: 'Box', plural: 'Boxes'}
];
const formatConfigs = {
	formats: ['7"', '10"', '12"', 'LP', 'CD', 'DVD', 'Box'],
	suffix: () => {
		const boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format';
		const spec = ', not including those listed on specific pages';
		if (includes.bootlegs) return boot;
		if (isRootCDorVinyl) return spec + boot;
		if (!includes.rainbow && !includes.maiden) return boot;
		return '';
	}
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
const config = matchedPath ? formatConfigs[matchedPath] : formatConfigs;
const filteredTerms = formatList.filter(term => config.formats.includes(term.format));
const columnIndex = isRootCDorVinyl  ? 4 : (filteredTerms.length === 4 && filteredTerms.some(term => term.format === '12"')) ? 4 : 3;

document.addEventListener("DOMContentLoaded", function() {
	let records = 'records', pageid = isRootCDorVinyl ? 'page2' : 'page', basepath = ''; 
	const $ = id => document.getElementById(id);
	const $$ = sel => document.querySelectorAll(sel);
	const cached = {
		nav: $('nav'), navb: $('navb'), nav2: $('nav2'), ind: $('ind'), clr: $('clr'),
		msg: $('msg'), msg2: $('msg2'), navt: $('nav-toggle'), up: $('up'), rows: [],
		input: document.querySelector('input'), tablas: Array.from($$('.tablesorter')),
		sections: Array.from($$('section')), s: Array.from($$('.s')), allh3: Array.from($$('section h3'))
	};
	const navtb = [cached.nav, cached.navt, cached.navb];
	if (includes.rainbow) {
		updateNavigation(cached.navb, 'rainbow', 'page3');
		setPageContext('rainbow', 'page2');
	}
	if (includes.maiden) {
		updateNavigation(cached.navb, 'iron_maiden', includes.singles || includes.bootlegs ? 'page3' : 'page4');
		setPageContext('iron_maiden', 'page2');
		if (includes.cassette) records = 'cassettes';
	}
	function initTables() {
		cached.tablas.forEach(tabla => {
			if (isRootCDorVinyl) tabla.classList.add('is-root-cd-vinyl');
			const rows = Array.from(tabla.tBodies[0].rows);
			rows.forEach(row => {
				row._searchText = row.textContent.toLowerCase();
				row._formatText = row.cells[columnIndex].textContent || '';
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
				if (section) acc.push({href: `#${section.id}`, text: h3.textContent});
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
			const inputValue = this.value.toLowerCase().trim();
			const regex = /"([^"]+)"|\S+/g;
			const matches = inputValue.matchAll(regex);
			const searchTerms = Array.from(matches, match => match[1] || match[0]);
			if (searchTerms.length === 0) {
				resetVisibility();
				return;
			}
			const visibleRows = filterAndShowRows(searchTerms);
			updateSearchResultMessage(visibleRows);
		});

		function toggleNav() {navtb.forEach(el => el?.classList.toggle('collapsed'));}
		cached.navt.addEventListener('click', toggleNav);
		cached.clr.addEventListener('click', () => {
			cached.input.value = '';
			cached.input.dispatchEvent(new Event('input'));
			cached.input.focus();
		});
		document.addEventListener('keyup', evt => {
			if (evt.key === 'Escape' && cached.nav.classList.contains('collapsed')) toggleNav();
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
		cached.sections.forEach(s => s.hidden = !parentsToShow.has(s));
		cached.tablas.forEach(t => t.hidden = !parentsToShow.has(t));
		return visibleRows;
	}
	function formatRecordInfo(isSearch = false, visibleRows = []) {
		if (includes.cassette) return isSearch ? '' : '. ' + collectionUpdateNote;
		const suffixUpdated = `${typeof config.suffix === 'function' ? config.suffix() : config.suffix || ''}${'. ' + collectionUpdateNote}`;
		const rowsToAnalyze = isSearch ? visibleRows : cached.rows;
		if (isSearch && rowsToAnalyze.length === 1) {
			const lastCellText = rowsToAnalyze[0].cells[columnIndex].textContent.trim();
			if (lastCellText) return `(${lastCellText})`;
		}
		const formatCount = Object.create(null);
		const vinylDetails = {
			'7"': {singles:0, EPs:0},
			'12"': {singles:0, EPs:0}
		};
		const singleRegex = /single/;
		const epRegex = /\bEP\b/;
		for (const row of rowsToAnalyze) {
			const cellText = row._formatText || '';
			for (const {format} of filteredTerms) {
				if (!cellText.includes(format)) continue;
				formatCount[format] = (formatCount[format] || 0) + 1;
				if (vinylDetails[format]) {
					if (singleRegex.test(cellText)) vinylDetails[format].singles++;
					if (epRegex.test(cellText)) vinylDetails[format].EPs++;
				}
			}
		}
		const activeFormats = Object.keys(formatCount);
		const parts = [];
		const formatDataCache = new Map(filteredTerms.map(item => [item.format, item]));
		for (const format of activeFormats) {
			const count = formatCount[format];
			const formatData = formatDataCache.get(format);
			let finalLabel = '';
			if (vinylDetails[format]) {
				const {singles, EPs} = vinylDetails[format];
				if (singles > 0 && EPs === 0) {
					finalLabel = `${format} single${count === 1 ? '' : 's'}`;
				} else if (EPs > 0 && singles === 0) {
					finalLabel = `${format} EP${count === 1 ? '' : 's'}`;
				}
			}
			const labelToShow = finalLabel || (count === 1 ? (formatData.label ?? format) : (formatData.plural ?? `${format}s`));
			parts.push(`${labelToShow}: <span class="c">${count}</span>`);
		}
		const countInfo = parts.join('; ');
		return isSearch ? `(${countInfo})` : ` (${countInfo})${suffixUpdated}`;
	}
	function updateInitialMessage() {
		const totalCount = cached.rows.length;
		const leadingText = `<span class="bo">${totalCount}</span> ${records}`;
		cached.msg.innerHTML = `${leadingText}${formatRecordInfo(false, cached.rows)}`;
	}
	function updateNavigation(elem, page, id) {
		if (menuItems[page]) elem.appendChild(createMenuItems(menuItems[page]));
		const selector = pagename.includes('.html') ? `a[href='${pagename}']` : `a[href*='${pagename}']`;
		const link = elem.querySelector(selector);
		if (link.parentElement) {
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
		const formattedInfo = formatRecordInfo(true, visibleRows);
		const recordLabel = visibleCount === 1 ? records.replace(/s$/, '') : records;
		cached.msg2.innerHTML = `<span class="bo">${visibleCount}</span> ${recordLabel} found ${formattedInfo}`;
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
		pagename = page; pageid = id; basepath = '../';
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