const {pathname} = window.location;
let pagename = pathname.split('/').pop();
const isUnifiedView = pathname.endsWith('/all.html');
const includes = {
	rainbow: pathname.includes('rainbow'),
	maiden: pathname.includes('iron_maiden'),
	singles: pathname.endsWith('/singles.html'),
	CD: pathname.endsWith('/CD.html'),
	vinyl: pathname.endsWith('/vinyl.html'),
	bootlegs: pathname.endsWith('/bootlegs.html'),
	cassette: pathname.endsWith('/cassette.html'),
	others: pathname.endsWith('/others.html')
};
const isRootCDorVinyl = (includes.CD || includes.vinyl) && !includes.rainbow && !includes.maiden;
let columnIndex = isRootCDorVinyl ? 4 : 3;
const config = {
	suffix: () => {
		const boot = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format';
		if (isRootCDorVinyl) return ', not including those listed on specific pages' + boot;
		if (isUnifiedView || (includes.bootlegs || (!includes.rainbow && !includes.maiden)) || includes.others) return boot;
		return '';
	}
};
const formats = [
	{format: '7"', label: '7" single/EP', plural: '7" singles/EPs'},
	{format: '10"', label: '10" single', plural: '10" singles'},
	{format: '12"', label: '12" single/EP', plural: '12" singles/EPs'},
	{format: 'LP', plural: 'LPs'},
	{format: 'CD', plural: 'CDs'},
	{format: 'DVD', plural: 'DVDs'},
	{format: 'Box', plural: 'Boxes'}
];

const menuItems = {
	'main': [
		{text: 'Rainbow', href: 'rainbow/all.html'},
		{text: 'Iron Maiden', href: 'iron_maiden/all.html'},
		{text: 'Deep Purple', href: 'deep_purple.html'},
		{text: 'Black Sabbath', href: 'black_sabbath.html'},
		{text: 'Vinyl Collection', href: 'vinyl.html'},
		{text: 'CD Collection', href: 'CD.html'},
		{text: 'All', href: 'all.html'}
	],
	'rainbow': [
		{text: 'Vinyl (Dio)', href: 'vinyl.html'},
		{text: 'CD &amp; DVD (Dio)', href: 'CD.html'},
		{text: 'Bootlegs (Dio)', href: 'bootlegs.html'},
		{text: 'Without Dio', href: 'others.html'},
		{text: 'All', href: 'all.html'}
	],
	'iron_maiden': [
		{text: 'Vinyl - Singles', href: 'singles.html'},
		{text: 'Vinyl - LP', href: 'LP.html'},
		{text: 'CD - Singles', href: 'CD_singles.html'},
		{text: 'CD', href: 'CD.html'},
		{text: 'Cassette', href: 'cassette.html'},
		{text: 'Bootlegs', href: 'bootlegs.html'},
		{text: 'All', href: 'all.html'}
	]
};

document.addEventListener("DOMContentLoaded", function () {
	const $ = id => document.getElementById(id);
	const $$ = sel => document.querySelectorAll(sel);
	const cached = {
		nav: $('nav'),
		navb: $('navb'),
		navt: $('nav-toggle'),
		clr: $('clr'),
		msg: $('msg'),
		msg2: $('msg2'),
		up: $('up'),
		input: document.querySelector('input'),
		rows: []
	};
	function initMenu(basepath = '', pageid = 'page2', activeSectionPath = '') {
		const mainMenuList = menuItems.main.map(item => ({...item, href: `${basepath}${item.href}`}));
		cached.nav.append(createMenuItems(mainMenuList));
		const targetHref = activeSectionPath ? `${basepath}${activeSectionPath}` : `${basepath}${pagename}`;
		updateNavigation(cached.nav, null, pageid, targetHref);
	}
	if (isUnifiedView) {
		initUnifiedView();
	} else {
		initSingleView();
	}
	cached.up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>');

	function initSingleView() {
		Object.assign(cached, {
			nav2: $('nav2'),
			ind: $('ind'),
			tablas: Array.from($$('.tablesorter')),
			sections: Array.from($$('section')),
			s: Array.from($$('.s')),
			allh3: Array.from($$('section h3'))
		});
		const records = (includes.maiden && includes.cassette) ? 'cassettes' : 'records';
		let basepath = '';
		let pageid = isRootCDorVinyl ? 'page2' : 'page';
		let activeSectionPath = ''; 
		if (includes.rainbow) {
			basepath = '../';
			pageid = 'page2';
			activeSectionPath = 'rainbow/all.html';
			updateNavigation(cached.navb, 'rainbow', 'page3');
		}
		if (includes.maiden) {
			basepath = '../';
			pageid = 'page2';
			activeSectionPath = 'iron_maiden/all.html';
			updateNavigation(cached.navb, 'iron_maiden', includes.singles || includes.bootlegs ? 'page3' : 'page4');
		}
		initMenu(basepath, pageid, activeSectionPath);
		function initPageContent() {
			if (cached.nav2) {
				const items = cached.allh3.reduce((acc, h3) => {
					const section = h3.closest('section');
					if (section) acc.push({href: `#${section.id}`, text: h3.textContent});
					return acc;
				}, []);
				cached.nav2.append(createMenuItems(items));
			}
			cached.tablas.forEach(tabla => {
				if (isRootCDorVinyl) tabla.classList.add('is-root-cd-vinyl');
				const rows = Array.from(tabla.tBodies[0].rows);
				rows.forEach(row => {
					row._searchText = row.textContent.toLowerCase();
					row._formatText = row.cells[columnIndex]?.textContent || '';
				});
				cached.rows.push(...rows);
				new Tablesort(tabla);
			});
			cached.input.placeholder = `Type here to search in the ${cached.rows.length} items`;
			updateInitialMessage(records);
			const tocLink = '<a href="#toc"><i class="icon-long-arrow-up"></i></a>';
			cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLink));
			createIndex();
		}
        initPageContent();
        setupEventListeners(records);
	}

	function initUnifiedView() {
		Object.assign(cached, {
			unifiedTbody: document.querySelector('#unified_table tbody'),
			thead: document.querySelector('#unified_table thead'),
			tabla: document.getElementById('unified_table'),
			fil: document.getElementById('fil'),
			progressFill: document.getElementById('progress-fill'),
			progressText: document.getElementById('progress-text')
		});
		let sources = [];
		let basePath = '';
		let pageId = 'page2';
		let activeSectionPath = '';
		if (includes.rainbow) {
			columnIndex = 3;
			basePath = '../';
			activeSectionPath = 'rainbow/all.html';
			sources = ['vinyl', 'CD', 'bootlegs', 'others'].map(page => ['rainbow', `${page}.html`, true]);
			updateNavigation(cached.navb, 'rainbow', pageId);
		} else if (includes.maiden) {
			columnIndex = 3;
			basePath = '../';
			activeSectionPath = 'iron_maiden/all.html';
			sources = ['singles', 'LP', 'CD_singles', 'CD', 'cassette', 'bootlegs'].map(page => ['iron_maiden', `${page}.html`, true]);
			updateNavigation(cached.navb, 'iron_maiden', pageId);
		} else {
			columnIndex = 4;
			basePath = '';
			sources = [
				['vinyl', 'vinyl.html', true],
				['black_sabbath', 'black_sabbath.html'],
				['deep_purple', 'deep_purple.html'],
				...['vinyl', 'CD', 'bootlegs', 'others'].map(page => ['rainbow', `rainbow/${page}.html`]),
				...['singles', 'LP', 'CD_singles', 'CD', 'cassette', 'bootlegs'].map(page => ['iron_maiden', `iron_maiden/${page}.html`]),
				['CD', 'CD.html', true]
			];
		}
		initMenu(basePath, pageId, activeSectionPath);
		const loadingProgress = {total: sources.length, completed: 0};
		function updateProgress(message = null) {
			if (!cached.progressFill) return;
			const percentage = Math.round((loadingProgress.completed / loadingProgress.total) * 100);
			cached.progressFill.style.width = `${percentage}%`;
			cached.progressText.textContent = message || `Loading file ${loadingProgress.completed}/${loadingProgress.total} (${percentage}%)`;
		}
		const addRowsToUnifiedTable = async (artist, url, noArtistCol = false) => {
			const response = await fetch(url);
			const data = await response.text();
			const doc = new DOMParser().parseFromString(data, 'text/html');
			const fragment = document.createDocumentFragment();
			const isBootlegPage = url.endsWith('/bootlegs.html');
			const artistColumnText = !noArtistCol ? artist.toUpperCase().replace(/_/g, ' ') : null;
			const bootlegTag = '<span class="b">Bootleg</span>';
			const rows = Array.from(doc.querySelectorAll('.tablesorter tbody tr'));
			updateProgress(`Loading...`);
			rows.forEach(tr => {
				if (artistColumnText) {
					const tdArtist = document.createElement('td');
					tdArtist.textContent = artistColumnText;
					tr.insertBefore(tdArtist, tr.firstChild);
				}		
				const formatCellIndex = artistColumnText ? 4 : 3;
				const isBootlegRow = isBootlegPage || !!tr.closest('section[id^="Boots_"]');
				if (isBootlegRow) {
					const tdFormat = tr.querySelector(`td:nth-child(${formatCellIndex})`);
					const prefix = tdFormat.innerHTML.trim() ? '<span class="w">. </span>' : '';
					tdFormat.insertAdjacentHTML('beforeend', prefix + bootlegTag);
				}
				if (url.includes('rainbow/') || url.includes('iron_maiden/')) {
					tr.querySelectorAll('a[href^="los_tengo/"]').forEach(a => {
						a.href = `${artist}/${a.getAttribute('href')}`;
					});
				}
			});
			fragment.append(...rows);
			cached.unifiedTbody.appendChild(fragment);
			loadingProgress.completed++;
			updateProgress();
		};
		Promise.allSettled(
			sources.map(([artist, url, noArtistCol]) => addRowsToUnifiedTable(artist, url, noArtistCol))
		).then(() => {
			if (pathname === '/all.html' || pathname === '/CD.html' || pathname === '/vinyl.html') {
				 cached.tabla.classList.add('is-root-cd-vinyl');
			}
			cached.rows = Array.from(cached.tabla.tBodies[0].rows);
			cached.rows.forEach(tr => {
				tr._formatCell = tr.cells[columnIndex].textContent;
				tr._searchText = tr.textContent.toLowerCase();
			});
			new Tablesort(cached.tabla);
			updateProgress('Loading table...');
			const totalRecords = cached.rows.length;
			cached.msg.innerHTML = `<span class="bo">${totalRecords}</span> records ${formatRecordInfo(false, cached.rows)}`;
			cached.input.placeholder = `Type here to search in the ${totalRecords} items`;
			[cached.up, cached.tabla, cached.fil].forEach(el => el && (el.style.opacity = '1'));
			document.body.style.cursor = 'default';
			setupEventListeners();
		});
	}
	function formatRecordInfo(isSearch = false, visibleRows = []) {
		const note = `. ${collectionUpdateNote}`;
		if (!isUnifiedView && includes.cassette) return isSearch ? '' : note;
		if (isSearch && visibleRows.length === 1) return `(${visibleRows[0].cells[columnIndex]?.textContent.trim()})`;	
		const formatCount = Object.create(null);
		const vinylDetails = {'7"': {singles: 0, EPs: 0}, '12"': {singles: 0, EPs: 0}};
		const singleRegex = /single/;
		const epRegex = /\bEP\b/;
		for (const row of visibleRows) {
			const cellText = isUnifiedView ? row._formatCell : row._formatText;
			for (const {format} of formats) {
				if (!cellText.includes(format)) continue;
				formatCount[format] = (formatCount[format] || 0) + 1;
				if (vinylDetails[format]) {
					if (singleRegex.test(cellText)) vinylDetails[format].singles++;
					if (epRegex.test(cellText)) vinylDetails[format].EPs++;
				}
			}
		}	
		const info = [];
		for (const {format, label, plural} of formats) {
			const count = formatCount[format];
			if (!count) continue;
			let finalLabel = '';
			const vd = vinylDetails[format];
			if (vd) {
				if (vd.singles > 0 && vd.EPs === 0) finalLabel = `${format} single${count > 1 ? 's' : ''}`;
				else if (vd.EPs > 0 && vd.singles === 0) finalLabel = `${format} EP${count > 1 ? 's' : ''}`;
			}
			const labelToShow = finalLabel || (count === 1 ? (label || format) : (plural || `${format}s`));
			info.push(`${labelToShow}: <span class="c">${count}</span>`);
		}	
		const result = `(${info.join('; ')})`;
		if (isSearch) return info.length ? result : '';	
		const baseSuffix = typeof config.suffix === 'function' ? config.suffix() : (config.suffix || '');
		const suffix = `${baseSuffix}${note}`;
		return ` ${result}${suffix}`;
	}
	function setupEventListeners(recordsLabel = 'records') {
		cached.input.addEventListener('input', function () {
			const inputValue = this.value.toLowerCase().trim();
			const regex = /"([^"]+)"|\S+/g;
			const matches = inputValue.matchAll(regex);
			const searchTerms = Array.from(matches, match => match[1] || match[0]);
			if (searchTerms.length === 0) {
				resetVisibility();
				return;
			}
			const visibleRows = filterAndShowRows(searchTerms);
			updateSearchResultMessage(visibleRows, recordsLabel);
		});
		cached.clr.addEventListener('click', () => {
			cached.input.value = '';
			cached.input.dispatchEvent(new Event('input'));
			cached.input.focus();
		});
		const navtb = [cached.nav, cached.navt, cached.navb].filter(Boolean);
		function toggleNav() {navtb.forEach(el => el.classList.toggle('collapsed'));}
		cached.navt?.addEventListener('click', toggleNav);
		document.addEventListener('keyup', e => e.key === 'Escape' && cached.nav.classList.contains('collapsed') && toggleNav());
	}
	function filterAndShowRows(searchTerms) {
		const visibleRows = [];
		const sectionsToShow = new Set();
		const tablesToShow   = new Set();
		for (const row of cached.rows) {
			const isMatch = searchTerms.every(term => row._searchText.includes(term));
			row.hidden = !isMatch;
			if (!isMatch) continue;
			visibleRows.push(row);
			if (!isUnifiedView) {
				const section = row.closest('section');
				if (section) sectionsToShow.add(section);
				const table = row.closest('table');
				if (table) tablesToShow.add(table);
			}
		}
		if (!isUnifiedView) {
			cached.sections.forEach(sec => sec.hidden  = !sectionsToShow.has(sec));
			cached.tablas.forEach(tbl   => tbl.hidden = !tablesToShow.has(tbl));
		}
		return visibleRows;
	}
	function updateSearchResultMessage(visibleRows, records = 'records') {
		const visibleCount = visibleRows.length;
		if (isUnifiedView) {
			cached.thead.hidden = cached.tabla.hidden = visibleCount === 0;
		}
		if (visibleCount === 0) {
			cached.msg2.innerHTML = `No ${records} found`;
			return;
		}
		const formattedInfo = formatRecordInfo(true, visibleRows);
		const recordLabel = visibleCount === 1 ? records.replace(/s$/, '') : records;
		cached.msg2.innerHTML = `<span class="bo">${visibleCount}</span> ${recordLabel} found ${formattedInfo}`;
	}
	function updateInitialMessage(records = 'records') {
		const totalCount = cached.rows.length;
		const leadingText = `<span class="bo">${totalCount}</span> ${records}`;
		cached.msg.innerHTML = `${leadingText}${formatRecordInfo(false, cached.rows)}`;
	}
	function resetVisibility() {
		cached.rows.forEach(row => row.hidden = false);
		if (isUnifiedView) {
			cached.tabla.hidden = cached.thead.hidden = false;
		}
		else {
			cached.sections.forEach(section => section.hidden = false);
			cached.tablas.forEach(tabla => tabla.hidden = false);
		}
		cached.msg2.innerHTML = '';
	}
	function createMenuItems(items) {
		const htmlString = items.map(item => `<li><a href="${item.href}">${item.text}</a></li>`).join('');
		const range = document.createRange();
		return range.createContextualFragment(htmlString);
	}
	function updateNavigation(elem, page, id, targetHref = '') {
		if (menuItems[page]) elem.appendChild(createMenuItems(menuItems[page]));	
		const selector = targetHref 
			? `a[href='${targetHref}']`
			: `a[href$='${pagename}']`;
		const link = elem.querySelector(selector);
		if (link?.parentElement) {
			link.parentElement.id = id;
			link.parentElement.textContent = link.textContent;
		}
	}
	function createIndex() {
		if (!cached.ind) return;
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).map(letter => `<a href="#${letter}">${letter}</a>`).join(' ');
		cached.ind.innerHTML = `${letters} <a href="#V/A">Compilations</a>`;
	}
});