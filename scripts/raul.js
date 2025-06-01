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
	const navtc = [navt, nav, navb];
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
	const updateNav = (elem, page, id) => {
		const selector = page.includes('.html') ? `a[href='${page}']` : `a[href*='${page}']`;
		const link = elem.querySelector(selector);
		if (link?.parentElement) {
			const parent = link.parentElement;
			parent.id = id;
			parent.textContent = link.textContent; 
		}
	};
	function createSubmenuItems(items) {
		const fragment = document.createDocumentFragment();
		items.forEach(item => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = item.href;
			a.textContent = item.text;
			li.appendChild(a);
			fragment.appendChild(li);
		});
		return fragment;
	}
	function updateNavandVars(page, id) {
		const submenuItems = menuItems[page];
		if (navb && submenuItems) {
			navb.appendChild(createSubmenuItems(submenuItems));
			updateNav(navb, pagename, id);
		}
	}
	function setPageContext(pageName, pageId, basePath) {
		pagename = pageName;
		pageid = pageId;
		basepath = basePath;
	}
	if (isRainbow) {
		updateNavandVars('rainbow', 'page3');
		setPageContext('rainbow', 'page2', '../');
	} else if (isIronMaiden) {
		updateNavandVars('iron_maiden', isSingles || isBootlegs ? "page3" : "page4");
		setPageContext('iron_maiden', 'page2', '../');
		if (pathname.includes('cassette')) {records = 'cassettes';}
	} else if (isRootCDorVinyl) {
		pageid = 'page2';
	}
	if (pathname.includes('CD') && !isRainbow) {records = 'CDs';}
	function createSectionLink(name, rid) {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = `#${rid}`;
		a.textContent = name;
		li.appendChild(a);
		return li;
	}
	const mainMenuList = mainMenuItems.map(item => `<li><a href="${basepath}${item.href}">${item.text}</a></li>`).join('');
	const addSection = (name, rid) => nav2?.appendChild(createSectionLink(name, rid));
	function getRecordInfo(found, terms) {
		if (terms.length === 1 && terms[0].searchTerm === 'CD') return '';
		let columnIndex = 4;
		const searchTerms = terms.map(termObj => termObj.searchTerm);
		if (terms.length === 4 && searchTerms.includes('12"')) {columnIndex = 5;}
		const counts = terms.reduce((acc, termObj) => {
			acc[termObj.searchTerm] = 0;
			return acc;
		}, {});
		found.forEach(row => {
			const cell = row.querySelector(`td:nth-child(${columnIndex})`);
			if (!cell) return;	
			const cellText = cell.textContent;
			for (const term of searchTerms) {if (cellText.includes(term)) {counts[term]++;}}
		});
		return ' (' + terms.map(termObj => `${termObj.label}: <span class="c">${counts[termObj.searchTerm]}</span>`).join('; ') + ')';
	}
	function getRecordInfoByPath(found, path, isSearchMessage = false) {
		const pathTerms = {
			'bootlegs': {terms: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
			'rainbow/vinyl': {terms: ['7"', 'LP', 'Box'], suffix: ''},
			'rainbow/CD': {terms: ['CD', 'DVD', 'Box'], suffix: ''},
			'iron_maiden/singles': {terms: ['7"', '12"', 'Box'], suffix: ''},
			'vinyl': {terms: ['7"', '12"', 'LP', 'Box'], suffix: spec + boot},
			'CD': {terms: ['CD'], suffix: specCD + boot},
			'default': {terms: ['7"', '12"', 'LP', 'CD', 'Box'], suffix: boot}
		};
		const foundPathPart = Object.keys(pathTerms).find(pathPart => path.includes(pathPart));
		const config = foundPathPart ? pathTerms[foundPathPart] : pathTerms.default;
		if (isIronMaiden && !isSingles && !isBootlegs) {return isSearchMessage ? '' : updated;}
		const filteredTerms = defaultTerms.filter(term => config.terms.includes(term.searchTerm));
		return isSearchMessage 
			? getRecordInfo(found, filteredTerms)
			: getRecordInfo(found, filteredTerms) + config.suffix + updated;
	}
	const updateMsgText = (found, path, targetMsg, msgText) => {
		const element = message[targetMsg];
		element.innerHTML = msgText + (found.length !== 0 ? getRecordInfoByPath(found, path, targetMsg === 'msg2') : '');
	};
	function createIndexLinks() {
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
		let linksHtml = letters.map(letter => `<a href="#${letter}">${letter}</a>`).join(' ');
		linksHtml += ` <a href="#V/A">Compilations</a>`;
		const div = document.createElement('div');
		div.innerHTML = linksHtml;
		const fragment = document.createDocumentFragment();
		while (div.firstChild) {fragment.appendChild(div.firstChild);}
		return fragment;
	}
	function toggleNav() {navtc.forEach(el => el.classList.toggle('collapsed'));}
	if (navt) {navt.addEventListener('click', toggleNav);}
	document.addEventListener('keyup', evt => {
		if (evt.key === 'Escape' && nav && nav.classList.contains('collapsed')) {toggleNav();}
	});
	nav.insertAdjacentHTML('beforeend', mainMenuList);
	updateNav(nav, pagename, pageid);
	if (nav2) {
		cached.allh3.forEach(h3 => {
			const section = h3.closest('section');
			if (section) addSection(h3.textContent, section.id);
		});
	}
	const totalRecords = cached.rows.length;
	updateMsgText(cached.rows, pathname, 'msg', `<span class="bo">${totalRecords}</span> ${records}`);
	cached.input.placeholder = `Type here to search in the ${totalRecords} items`;
	function resetVisibility() {
		cached.rows.forEach(row => row.hidden = false);
		cached.sections.forEach(section => section.hidden = false);
		cached.tablas.forEach(tabla => tabla.hidden = false);
		msg2.innerHTML = '&nbsp;';
	}
	clr.addEventListener('click', () => {
		cached.input.value = '';
		cached.input.focus();
		resetVisibility();
	});
	cached.input.addEventListener('keyup', function() {
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
				if (section) visibleSections.add(section);
				const tabla = row.closest('.tablesorter');
				if (tabla) visibleTables.add(tabla);
			}
		});
		cached.sections.forEach(section => {section.hidden = !visibleSections.has(section);});
		cached.tablas.forEach(tabla => {tabla.hidden = !visibleTables.has(tabla);});
		if (foundRows.length === 0) {
			updateMsgText([], pathname, 'msg2', `No ${records} found`);
		} else {
			updateMsgText(foundRows, pathname, 'msg2', `<span class="bo">${foundRows.length}</span> ${records} found`);
		}
	});
	const tocLinkHtml = '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>';
	cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLinkHtml));
	if (ind) {ind.appendChild(createIndexLinks());}
	up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');
	cached.header.id = 'toc';
});