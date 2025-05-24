let pageid = 'page';
const pathname = window.location.pathname;
const pathSegments = pathname.split('/');
let pagename = pathSegments.pop();
let basePath = '';
const isRainbow = pathname.includes('rainbow');
const isIronMaiden = pathname.includes('iron_maiden');
const isSingles = pathname.includes('/singles');
const isBootlegs = pathname.includes('bootlegs');
const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !isRainbow && !isIronMaiden;
let records = 'records',
	boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format',
	spec = ' , not including those listed on specific pages',
	specCD = ' (not including those listed on specific pages)',
	updated = '. ' + `${collectionUpdateNote}`;
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
	const nav = document.getElementById('nav');
	const navb = document.getElementById('navb');
	const nav2 = document.getElementById('nav2');
	const ind = document.getElementById('ind');
	const clr = document.getElementById('clr');
	const msg = document.getElementById('msg');
	const msg2 = document.getElementById('msg2');
	const message = {msg:msg,msg2:msg2};
	const navt = document.getElementById('nav-toggle');
	const navtc = [navt, nav, navb];	
	const up = document.getElementById('up');
	const cached = {
		input: document.querySelector('input'),
		header: document.querySelector('header'),
		rows: Array.from(document.querySelectorAll('.tablesorter tbody tr')),
		tablas: Array.from(document.querySelectorAll('.tablesorter')),
		sections: Array.from(document.querySelectorAll('section')),
		s: Array.from(document.querySelectorAll('.s')),
		allHeaders: Array.from(document.querySelectorAll('section h3'))
	};
	cached.rows.forEach(row => {
		row._searchText = row.textContent.toLowerCase();
	});
	cached.sections.forEach(section => {
		section._sectionRows = Array.from(section.querySelectorAll('tbody tr'));
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
	if (isRainbow) {
		updateNavandVars('rainbow', 'page3');
		pagename = 'rainbow';
		pageid = 'page2';
		basePath = '../';
	} else if (isIronMaiden) {
		updateNavandVars('iron_maiden', isSingles || isBootlegs ? "page3" : "page4");
		pagename = 'iron_maiden';
		pageid = 'page2';
		basePath = '../';
	} else if (isRootCDorVinyl) {
		pageid = 'page2';
	}
	if (pathname.includes('CD') && !isRainbow) {records = 'CDs';}
	if (pathname.includes('cassette')) {records = 'cassettes';}
	function createSectionLink(name, rid) {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = `#${rid}`;
		a.textContent = name;
		li.appendChild(a);
		return li;
	}
	const mainMenuList = mainMenuItems.map(item => `<li><a href="${basePath}${item.href}">${item.text}</a></li>`).join('');
	const addSection = (name, rid) => nav2?.appendChild(createSectionLink(name, rid));
	function getRecordInfo(found, terms) {
		if (terms.length === 1 && terms[0].searchTerm === 'CD') {return '';}
		let columnIndex = 4;
		const searchTerms = terms.map(termObj => termObj.searchTerm);
		if (terms.length === 3 &&
			searchTerms.includes('7"') &&
			searchTerms.includes('12"') &&
			searchTerms.includes('LP')) {
			columnIndex = 5;
		}
		const counts = {};
		terms.forEach(termObj => {counts[termObj.searchTerm] = 0;});
		found.forEach(row => {
			const cell = row.querySelector(`td:nth-child(${columnIndex})`);
			const cellText = cell.textContent;
			terms.forEach(termObj => {if (cellText.includes(termObj.searchTerm)) {counts[termObj.searchTerm]++;}});
		});
		return ' (' + terms.map(termObj => `${termObj.label}: <span class="c">${counts[termObj.searchTerm]}</span>`).join('; ') + ')';
	}
	function getRecordInfoByPath(found, pathname) {
		const routeConfig = {
			'bootlegs': {terms: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
			'rainbow/vinyl': {terms: ['7"', 'LP', 'Box'], suffix: ''},
			'rainbow/CD': {terms: ['CD', 'DVD', 'Box'], suffix: ''},
			'rainbow': {terms: ['7"', '12"', 'LP', 'CD'], suffix: boot},
			'iron_maiden/singles': {terms: ['7"', '12"', 'Box'], suffix: ''},
			'vinyl': {terms: ['7"', '12"', 'LP'], suffix: spec + boot},
			'CD': {terms: ['CD'], suffix: specCD + boot},
			'default': {terms: ['7"', '12"', 'LP', 'CD'], suffix: boot}
		};
		let config = routeConfig.default;
		for (const pathPart in routeConfig) {
			if (pathname.includes(pathPart)) {
				config = routeConfig[pathPart];
				break;
			}
		}
		if (isIronMaiden && !isSingles && !isBootlegs) {return updated;}
		const filteredTerms = defaultTerms.filter(term => config.terms.includes(term.searchTerm));
		return getRecordInfo(found, filteredTerms) + config.suffix + updated;
	}
	const updateMsgText = (found, pathname, targetMsg, msgText) => {
		if (targetMsg === 'msg2') {boot = spec = specCD = updated = '';}
		const element = message[targetMsg];
		element.innerHTML = msgText + (found.length !== 0 ? getRecordInfoByPath(found, pathname) : '');
	};
	function createIndexLinks() {
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
		const fragment = document.createDocumentFragment();
		letters.forEach(letter => {
			const a = document.createElement('a');
			a.href = `#${letter}`;
			a.textContent = letter;
			fragment.appendChild(a);
			fragment.appendChild(document.createTextNode(' '));
		});
		const compilations = document.createElement('a');
		compilations.href = '#V/A';
		compilations.textContent = 'Compilations';
		fragment.appendChild(compilations);
		return fragment;
	}
	cached.tablas.forEach(tabla => {
		const rows = tabla.querySelectorAll('tbody tr');
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
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
	function toggleNav() {navtc.forEach(el => el.classList.toggle('collapsed'));}
	if (navt) {navt.addEventListener('click', toggleNav);}
	document.addEventListener('keyup', evt => {
		if (evt.key === 'Escape' && nav && nav.classList.contains('collapsed')) {toggleNav();}
	});
	nav.insertAdjacentHTML('beforeend', mainMenuList);
	updateNav(nav, pagename, pageid);
	if (nav2) {
		cached.allHeaders.forEach(h3 => {
			const section = h3.closest('section');
			if (section) addSection(h3.textContent, section.id);
		});
	}
	const totalRecords = cached.rows.length;
	updateMsgText(cached.rows, pathname, 'msg', `<span class="bo">${totalRecords}</span> ${records}`);
	cached.input.placeholder = `Type here to search in the ${totalRecords} items`;
	clr.addEventListener('click', () => {
		cached.input.value = '';
		cached.input.focus();
		cached.rows.forEach(row => row.hidden = false);
		msg2.innerHTML = '&nbsp;';
		cached.sections.forEach(section => section.hidden = false);		
		cached.tablas.forEach(tabla => tabla.hidden = false);
	});
	cached.input.addEventListener('keyup', function() {
		const filterValue = this.value.toLowerCase();
		const searchTerms = filterValue.split(/\s+/).filter(Boolean);
		let foundRows = [];
		if (searchTerms.length === 0) {
			cached.rows.forEach(row => row.hidden = false);
			foundRows = cached.rows;
		} else {
			cached.rows.forEach(row => {
				const matches = searchTerms.every(term => row._searchText.includes(term));
				row.hidden = !matches;
				if (matches) foundRows.push(row);
			});
		}
		cached.sections.forEach(section => {
			section.hidden = !section._sectionRows.some(row => !row.hidden);
		});
		if (foundRows.length === 0) {
			msg2.innerHTML = `No ${records} found`;
		} else {
			updateMsgText(foundRows, pathname, 'msg2', `<span class="bo">${foundRows.length}</span> ${records} found`);
		}
	});
	cached.s.forEach(el => {el.insertAdjacentHTML('beforeend', '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');});
	if (ind) {ind.appendChild(createIndexLinks());}
	up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');
	cached.header.id = 'toc';
});