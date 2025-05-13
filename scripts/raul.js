let pageid = 'page';
const pathname = window.location.pathname;
const pathSegments = pathname.split('/');
let pagename = pathSegments.pop();
let basePath = pathSegments.length > 1 ? '../' : '';
let records = 'records',
	boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format',
	spec = '. The records listed on specific pages are not counted here',
	specCD = '. The CDs listed on specific pages are not counted here',
	updated = '. Record collection updated May 2025.';
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
	const messageElements = {msg:msg,msg2:msg2};
	const navt = document.getElementById('nav-toggle');
	const filInputContainer = document.getElementById('fil');
	const filInput = filInputContainer ? filInputContainer.querySelector('input') : null;
	const up = document.getElementById('up');
	const navtcElements = [navt, nav, navb];
	const cachedElements = {
		totalRows: Array.from(document.querySelectorAll('.tablesorter tbody tr')),
		allSections: Array.from(document.querySelectorAll('section')),
		inputs: Array.from(document.querySelectorAll('input')),
		tablas: Array.from(document.querySelectorAll('.tablesorter')),
		headers: Array.from(document.querySelectorAll('header')),
		sections: Array.from(document.querySelectorAll('section')),
		s: Array.from(document.querySelectorAll('.s'))
	};
	function createSectionLink(name, rid) {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = `#${rid}`;
		a.textContent = name;
		li.appendChild(a);
		return li;
	}
	const addSection = (name, rid) => {if (nav2) {nav2.appendChild(createSectionLink(name, rid));}};
	const mainMenuList = mainMenuItems
		.map(item => `<li><a href="${basePath}${item.href}">${item.text}</a></li>`)
		.join('');
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
		return ' (' + terms
			.map(termObj => `${termObj.label}: <span class="c">${counts[termObj.searchTerm]}</span>`)
			.join('; ') + ')';
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
		if (pathname.includes('iron_maiden') &&
			!pathname.includes('/singles') &&
			!pathname.includes('bootlegs')) {
			return updated;
		}
		const filteredTerms = defaultTerms.filter(term => config.terms.includes(term.searchTerm));
		return getRecordInfo(found, filteredTerms) + config.suffix + updated;
	}
	const updateMsgText = (found, pathname, targetMsg, msgText) => {
		if (targetMsg === 'msg2') {boot = spec = specCD = updated = '';}
		const element = messageElements[targetMsg];
		element.innerHTML = msgText + (found.length !== 0 ? getRecordInfoByPath(found, pathname) : '');
	};
	function createIndexLinks() {
		const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
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
	const isRainbow = pathname.includes('rainbow');
	const isIronMaiden = pathname.includes('iron_maiden');
	const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !isRainbow && !isIronMaiden;
	cachedElements.tablas.forEach(tabla => {
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
	if (isRainbow) {
		updateNavandVars('rainbow', 'page3');
		pagename = 'rainbow';
		pageid = 'page2';
	} else if (isIronMaiden) {
		updateNavandVars('iron_maiden',
			(pathname.includes('/singles.html') || pathname.includes('bootlegs.'))
				? "page3"
				: "page4"
		);
		pagename = 'iron_maiden';
		pageid = 'page2';
	} else if (isRootCDorVinyl) {
		pageid = 'page2';
		if (pathname.includes('CD.html')) {records = 'CDs';}
	}
	function toggleNav() {navtcElements.forEach(el => el.classList.toggle('collapsed'));}
	if (navt) {navt.addEventListener('click', toggleNav);}
	document.addEventListener('keyup', evt => {
		if (evt.key === 'Escape' && nav && nav.classList.contains('collapsed')) {toggleNav();}
	});
	nav.insertAdjacentHTML('beforeend', mainMenuList);
	updateNav(nav, pagename, pageid);
	if (nav2) {
		cachedElements.sections.forEach(section => {
			const h3 = section.querySelector('h3');
			if (h3) {addSection(h3.textContent, section.id);}
		});
	}
	const totalRecords = cachedElements.totalRows.length;
	updateMsgText(cachedElements.totalRows, pathname, 'msg', `Total ${records}: <span class="bo">${totalRecords}</span>`);
	cachedElements.inputs.forEach(input => {input.placeholder = `Type here to search in the ${totalRecords} items`;});
	clr.addEventListener('click', function() {
		cachedElements.inputs.forEach(input => {
			input.value = '';
			input.focus();
			const event = new KeyboardEvent('keyup', {key: 'Backspace', code: 'Backspace', keyCode: 8, bubbles: true});
			input.dispatchEvent(event);
		});
		if (msg2) msg2.innerHTML = '&nbsp;';
	});
	filInput.addEventListener('keyup', function() {
		const filterValue = this.value.toLowerCase();
		const searchTerms = filterValue.split(' ').filter(term => term !== '');
		let foundRows = [];
		cachedElements.tablas.forEach(tabla => {
			const rows = tabla.querySelectorAll('tbody tr');
			rows.forEach(row => {
				const textContent = row.textContent.toLowerCase();
				const allTermsFound = searchTerms.every(term => textContent.includes(term));
				row.style.display = allTermsFound ? '' : 'none';
				if (allTermsFound) {foundRows.push(row);}
			});
			const thead = tabla.querySelector('thead');
			const visible = Array.from(rows).some(row => row.style.display !== 'none');
			thead.style.display = visible ? '' : 'none';
		});
		cachedElements.sections.forEach(section => {
			const table = section.querySelector('.tablesorter');
			const rows = table.querySelectorAll('tbody tr');
			const anyVisible = Array.from(rows).some(row => row.style.display !== 'none');
			section.style.display = anyVisible ? '' : 'none';
		});
		const msg2Text = foundRows.length === 0
			? `No ${records} found`
			: `<span class="bo">${foundRows.length}</span> ${records} found `;
		updateMsgText(foundRows, pathname, 'msg2', msg2Text);
	});
	cachedElements.s.forEach(element => {
		element.insertAdjacentHTML('beforeend', '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');
	});
	if (ind) {ind.appendChild(createIndexLinks());}
	if (up) {up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');}
	cachedElements.headers.forEach(header => {header.id = 'toc';});
});