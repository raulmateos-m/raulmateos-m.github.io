document.addEventListener("DOMContentLoaded", function() {
	let pageid = 'page';
	const pathname = window.location.pathname;
	const pathSegments = pathname.split('/');
	let pagename = pathSegments.pop();
	let basePath = pathSegments.length > 1 ? '../' : '';
	const nav    = document.getElementById('nav');
	const navb   = document.getElementById('navb');
	const nav2   = document.getElementById('nav2');
	const ind    = document.getElementById('ind');
	const clr    = document.getElementById('clr');
	const msg2   = document.getElementById('msg2');
	const navt   = document.getElementById('nav-toggle');
	const navtcElements = [navt, nav, navb];
	const inputs     = document.querySelectorAll('input');
	const filInput   = document.querySelector('#fil input');
	const tablas     = document.querySelectorAll('.tablesorter');
	tablas.forEach(tabla => {
		new Tablesort(tabla);
	});
	const totalRows  = document.querySelectorAll('.tablesorter tbody tr');
	let records = 'records',
		boot = '. The dates of <span class="b">bootlegs</span> are dd/mm/yy',
		spec = '. The records listed on specific pages are not counted here',
		specCD = '. The CDs listed on specific pages are not counted here',
		updated = '. Record collection updated March 2025';
	const addSection = (name, rid) => {
		nav2.insertAdjacentHTML('beforeend', `<li><a href="#${rid}">${name}</a></li>`);
	};
	const defaultTerms = [
		{searchTerm: '7"', label: '7" singles/EPs'},
		{searchTerm: '12"', label: '12" singles/EPs'},
		{searchTerm: 'LP', label: 'LPs'},
		{searchTerm: 'CD', label: 'CDs'},
		{searchTerm: 'DVD', label: 'DVDs'},
		{searchTerm: 'Box', label: 'Boxes'}
	];
	const mainMenuItems = [
		{text:'Rainbow (Dio)', href:'rainbow/vinyl.html'},
		{text:'Iron Maiden', href:'iron_maiden/singles.html'},
		{text:'Deep Purple', href:'deep_purple.html'},
		{text:'Black Sabbath', href:'black_sabbath.html'},
		{text:'DIO', href:'dio.html'},
		{text:'Vinyl Collection', href:'vinyl.html'},
		{text:'CD Collection', href:'CD.html'}
	];
	const mainMenuList = mainMenuItems
		.map(item => `<li><a href="${basePath}${item.href}">${item.text}</a></li>`)
		.join('');
	const menuItems = {
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
	const updateNav = (elem, page, id) => {
		const selector = page.includes('.html') ? `a[href='${page}']` : `a[href*='${page}']`;
		const link = elem.querySelector(selector);
		if (link && link.parentElement) {
			link.parentElement.id = id;
			link.parentElement.innerHTML = link.textContent;
		}
	};
	function updateNavandVars(page, id) {
		const submenuItems = menuItems[page];
		const submenuList = submenuItems
			.map(item => `<li><a href="${item.href}">${item.text}</a></li>`)
			.join('');
		navb.insertAdjacentHTML('beforeend', submenuList);
		updateNav(navb, pagename, id);
	}
	function getRecordInfo(found, terms) {
		if (terms.length === 1 && terms[0].searchTerm === 'CD') {
			return '';
		} else {
			let columnIndex = 4;
			const searchTerms = terms.map(termObj => termObj.searchTerm);
			if (terms.length === 3 &&
				searchTerms.includes('7"') &&
				searchTerms.includes('12"') &&
				searchTerms.includes('LP')) {
				columnIndex = 5;
			}
			const counts = {};
			const precompiledTerms = terms.map(termObj => ({
				...termObj,
				regexp: new RegExp(termObj.searchTerm)
			}));
			terms.forEach(termObj => { counts[termObj.searchTerm] = 0; });
			// Se asume que "found" es una lista de elementos <tr>
			found.forEach(row => {
				const cell = row.querySelector(`td:nth-child(${columnIndex})`);
				if (cell) {
					const cellText = cell.textContent;
					precompiledTerms.forEach(term => {
						if (term.regexp.test(cellText)) {
							counts[term.searchTerm]++;
						}
					});
				}
			});
			return ' (' + terms
				.map(termObj => `${termObj.label}: <span class="c">${counts[termObj.searchTerm]}</span>`)
				.join('; ') + ')';
		}
	}
	function getRecordInfoByPath(found, pathname) {
		const routeConfig = {
			'bootlegs': {terms: ['7"', 'LP', 'CD', 'Box'], suffix: boot},
			'rainbow/vinyl': {terms: ['7"', 'LP', 'Box'], suffix: ''},
			'rainbow/CD': {terms: ['CD', 'DVD', 'Box'], suffix: ''},
			'rainbow': {terms: ['7"', '12"', 'LP', 'CD'], suffix: boot},
			'iron_maiden/singles': {terms: ['7"', '12"', 'Box'], suffix: ''},
			'vinyl': {terms: ['7"', '12"', 'LP'], suffix: spec + boot},
			'CD': {terms: ['CD'], suffix: specCD + boot },
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
		if (targetMsg === 'msg2') {
			boot = spec = specCD = updated = '';
		}
		const element = document.getElementById(targetMsg);
		if (element) {
			element.innerHTML = msgText + (found.length !== 0 ? getRecordInfoByPath(found, pathname) : '');
		}
	};
	document.querySelectorAll('.tablesorter tbody tr:nth-child(odd)').forEach(row => {
		row.classList.add('even');
	});
	const isRainbow = pathname.includes('rainbow');
	const isIronMaiden = pathname.includes('iron_maiden');
	const isRootCDorVinyl = (pagename === 'CD.html' || pagename === 'vinyl.html') && !isRainbow && !isIronMaiden;
	if (isRootCDorVinyl) {
		tablas.forEach(tabla => {
			tabla.querySelectorAll('td:first-child').forEach(td => td.classList.add('bo'));
			tabla.querySelectorAll('td:nth-child(3)').forEach(td => td.classList.add('n'));
			tabla.querySelectorAll('td:nth-child(4)').forEach(td => td.classList.add('c'));
		});
		pageid = 'page2b';
	} else {
		tablas.forEach(tabla => {
			tabla.querySelectorAll('td:nth-child(2)').forEach(td => td.classList.add('n'));
			tabla.querySelectorAll('td:nth-child(3)').forEach(td => td.classList.add('c'));
		});
	}
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
	} else if (pathname.includes('CD.html')) {
		records = 'CDs';
	}
	navt.addEventListener('click', () => {
		navtcElements.forEach(el => el.classList.toggle('collapsed'));
	});
	document.addEventListener('keyup', evt => {
		if (evt.key === 'Escape' && nav.classList.contains('collapsed')) {
			navtcElements.forEach(el => el.classList.toggle('collapsed'));
		}
	});
	if (nav) {
		nav.insertAdjacentHTML('beforeend', mainMenuList);
		updateNav(nav, pagename, pageid);
	}
	document.querySelectorAll('section').forEach(section => {
		const h3 = section.querySelector('h3');
		if (h3) {
			addSection(h3.textContent, section.id);
		}
	});
	const totalRecords = totalRows.length;
	updateMsgText(Array.from(totalRows), pathname, 'msg', `Total ${records}: <span class="bo">${totalRecords}</span>`);
	inputs.forEach(input => {
		input.placeholder = `Type here to search in the ${totalRecords} items`;
	});
	if (clr) {
		clr.addEventListener('click', function() {
			inputs.forEach(input => {
				input.value = '';
				input.focus();
				const event = new KeyboardEvent('keyup', { key: 'Backspace', code: 'Backspace', keyCode: 8, bubbles: true });
				input.dispatchEvent(event);
			});
			if (msg2) msg2.innerHTML = '&nbsp;';
		});
	}
	const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
	const indexHTML = letters.map(letter => `<a href="#${letter}">${letter}</a>`).join(' ') + ' <a href="#V/A">Compilations</a>';
	if (ind) {
		ind.insertAdjacentHTML('beforeend', indexHTML);
	}
	if (filInput) {
		filInput.addEventListener('keyup', function() {
			const filterValue = this.value.toLowerCase();
			let foundRows = [];
			tablas.forEach(tabla => {
				const rows = tabla.querySelectorAll('tbody tr');
				rows.forEach(row => {
					if (row.textContent.toLowerCase().includes(filterValue)) {
						row.style.display = '';
						foundRows.push(row);
					} else {
						row.style.display = 'none';
					}
				});
				const thead = tabla.querySelector('thead');
				if (thead) {
					const visible = Array.from(rows).some(row => row.style.display !== 'none');
					thead.style.display = visible ? '' : 'none';
				}
			});
			document.querySelectorAll('section').forEach(section => {
			const table = section.querySelector('.tablesorter');
			if (table) {
				const rows = table.querySelectorAll('tbody tr');
				const anyVisible = Array.from(rows).some(row => row.style.display !== 'none');
				section.style.display = anyVisible ? '' : 'none';
			}
			});
			const msg2Text = foundRows.length === 0
				? `No ${records} found`
				: `<span class="bo">${foundRows.length}</span> ${records} found `;
			updateMsgText(foundRows, pathname, 'msg2', msg2Text);
		});
	}
	function replaceElement(selector, className) {
		document.querySelectorAll(selector).forEach(element => {
			const spanHtml = `<span class="${className}">${element.innerHTML}</span>${className === 'c' ? '; ' : ''}`;
			const tempContainer = document.createElement('div');
			tempContainer.innerHTML = spanHtml;
			const newNode = tempContainer.firstChild;
			element.parentNode.replaceChild(newNode, element);
		});
	}
	replaceElement('c', 'c');
	replaceElement('w', 'w');
	document.querySelectorAll('.s').forEach(element => {
		element.insertAdjacentHTML('beforeend', '<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');
	});
	const up = document.getElementById('up');
	if (up) {
		up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>&nbsp;');
	}
	document.querySelectorAll('header').forEach(header => {
		header.id = 'toc';
	});
});