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
const defaultTerms = [
	{searchTerm: '7"', label: '7" singles/EPs'},
	{searchTerm: '12"', label: '12" singles/EPs'},
	{searchTerm: 'LP', label: 'LPs'},
	{searchTerm: 'CD', label: 'CDs'},
	{searchTerm: 'DVD', label: 'DVDs'},
	{searchTerm: 'Box', label: 'Boxes'}
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
	cached.tablas.forEach(tabla => {
		const rows = Array.from(tabla.querySelectorAll('tbody tr'));
		rows.forEach(row => {
			row._searchText = row.textContent.toLowerCase();
			cached.rows.push(row);
			const cells = Array.from(row.children);
			if (isRootCDorVinyl) {
				if (cells[0]) cells[0].classList.add('bo');
				if (cells[2]) cells[2].classList.add('n');
				if (cells[3]) cells[3].classList.add('c');
			} else {
				if (cells[1]) cells[1].classList.add('n');
				if (cells[2]) cells[2].classList.add('c');
			}
		});
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
	cached.input.placeholder = `Type here to search in the ${totalRecords} items`;
	function getRecordInfo(found, path, isSearchMessage = false) {
		const pathConfigs = {	
			'bootlegs': {terms: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
			'rainbow/vinyl': {terms: ['7"', 'LP', 'Box'], suffix: ''},
			'rainbow/CD': {terms: ['CD', 'DVD', 'Box'], suffix: ''},
			'iron_maiden/singles': {terms: ['7"', '12"', 'Box'], suffix: ''},
			'vinyl': {terms: ['7"', '12"', 'LP', 'Box'], suffix: spec + boot},
			'CD': {terms: ['CD'], suffix: specCD + boot},
			'default': {terms: ['7"', '12"', 'LP', 'CD', 'Box'], suffix: boot}
		};
		if (isIronMaiden && !isSingles && !isBootlegs) {return isSearchMessage ? '' : updated;}
		const matchedPath = Object.keys(pathConfigs).find(pathPart => path.includes(pathPart));
		const config = matchedPath ? pathConfigs[matchedPath] : pathConfigs.default;
		const filteredTerms = defaultTerms.filter(term => config.terms.includes(term.searchTerm));
		if (filteredTerms.length === 1 && filteredTerms[0].searchTerm === 'CD') {return isSearchMessage ? '' : config.suffix + updated;}
		const columnIndex = (filteredTerms.length === 4 && filteredTerms.some(t => t.searchTerm === '12"')) ? 5 : 4;
		const counts = Object.fromEntries(filteredTerms.map(term => [term.searchTerm, 0]));
		found.forEach(row => {
			const cell = row.querySelector(`td:nth-child(${columnIndex})`);
			if (!cell) return;
			const cellText = cell.textContent;
			filteredTerms.forEach(term => {if (cellText.includes(term.searchTerm)) counts[term.searchTerm]++;});
		});
		const countInfo = ` (${filteredTerms.map(term => `${term.label}: <span class="c">${counts[term.searchTerm]}</span>`).join('; ')})`;
		return isSearchMessage ? countInfo : countInfo + config.suffix + updated;
	}
	const updateMsgText = (found, path, targetMsg, msgText) => {
		const element = message[targetMsg];
		element.innerHTML = msgText + (found.length !== 0 ? getRecordInfo(found, path, targetMsg === 'msg2') : '');
	};
	updateMsgText(cached.rows, pathname, 'msg', `<span class="bo">${totalRecords}</span> ${records}`);
	if (ind) {
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
		const links = [...letters.map(l => `<a href="#${l}">${l}</a>`), '<a href="#V/A">Compilations</a>'];
		ind.innerHTML = links.join(' ');
	}
	function resetVisibility() {
		cached.rows.forEach(row => row.hidden = false);
		cached.sections.forEach(section => section.hidden = false);
		cached.tablas.forEach(tabla => tabla.hidden = false);
		msg2.innerHTML = '&nbsp;';
	}
	clr.addEventListener('click', () => {
		resetVisibility();
		cached.input.value = '';
		cached.input.focus();
	});
	cached.input.addEventListener('input', function() {
		const filterValue = this.value.toLowerCase();
		const searchTerms = filterValue.split(/\s+/).filter(Boolean);
		if (searchTerms.length === 0) {
			resetVisibility();
			updateMsgText(cached.rows, pathname, 'msg', `<span class="bo">${cached.rows.length}</span> ${records}`);
			cached.input.placeholder = `Type here to search in the ${cached.rows.length} items`;
			return;
		}
		const foundRows = [];
		const visibleSections = new Set();
		const visibleTables = new Set();
		cached.rows.forEach(row => {
			const shouldShow = searchTerms.every(term => row._searchText.includes(term));
			row.hidden = !shouldShow;
			if (shouldShow) {
				foundRows.push(row);
				const section = row.closest('section');
				const tabla = row.closest('.tablesorter');
				if (section) visibleSections.add(section);
				if (tabla) visibleTables.add(tabla);
			}
		});
		cached.sections.forEach(section => {section.hidden = !visibleSections.has(section);});
		cached.tablas.forEach(tabla => {tabla.hidden = !visibleTables.has(tabla);});
		updateMsgText(foundRows, pathname, 'msg2', foundRows.length === 0
			? `No ${records} found`
			: `<span class="bo">${foundRows.length}</span> ${records} found`
		);
	});
	function toggleNav() {navtb.forEach(el => el.classList.toggle('collapsed'));}
	navt?.addEventListener('click', toggleNav);
	document.addEventListener('keyup', evt => {if (evt.key === 'Escape' && nav.classList.contains('collapsed')) {toggleNav();}});
	const tocLinkHtml = '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>';
	cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLinkHtml));
	up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');
	cached.header.id = 'toc';
});