const {pathname} = window.location;
let pagename = pathname.split('/').pop() || 'index.html';
const isUnifiedView = ['/index.html', '/all.html', '/'].some(route => pathname.endsWith(route));
const includes = Object.fromEntries([
	['rainbow', pathname.includes('rainbow')],
	['maiden', pathname.includes('iron_maiden')],
	...['singles', 'CD', 'vinyl', 'bootlegs', 'cassette', 'others'].map(key => [key, pathname.endsWith(`/${key}.html`)])
]);
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
		{text: 'All', href: '/'}
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
	const searchTermRegex = /"([^"]+)"|\S+/g;
	const section = includes.rainbow ? 'rainbow' : includes.maiden ? 'maiden' : null;
	const ctx = getArtistContext(section);

	if (isUnifiedView) {
		initUnifiedView();
	} else {
		initSingleView();
	}

	function initSingleView() {
		Object.assign(cached, {
			nav2: $('nav2'),
			ind: $('ind'),
			tablas: Array.from($$('.tablesorter')),
			sections: Array.from($$('section')),
			s: Array.from($$('.s')),
			allh3: Array.from($$('section h3'))
		});
		const {basePath, pageId, activeSectionPath, artist, navbId} = ctx;
		if (artist) updateNavigation(cached.navb, artist, navbId);
		initMenu(basePath, pageId, activeSectionPath);
		if (cached.nav2) {
			const items = cached.allh3.reduce((acc, h3) => {
				const section = h3.closest('section');
				if (section) acc.push({href: `#${section.id}`, text: h3.textContent});
				return acc;
			}, []);
			cached.nav2.append(createMenuItems(items));
		}
		cached.rows = processAndSortTables(cached.tablas);
		const records = (includes.maiden && includes.cassette) ? 'cassettes' : 'records';
		finalizeSetup(records);
		const tocLink = '<a href="#toc"><i class="icon-long-arrow-up"></i></a>';
		cached.s.forEach(el => el.insertAdjacentHTML('beforeend', tocLink));
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
		let {artist, basePath, pageId, activeSectionPath, sources, navbId} = ctx;
		if (!artist) {
			basePath = '';
			sources = [
				['vinyl', 'vinyl.html', true],
				['black_sabbath', 'black_sabbath.html'],
				['deep_purple', 'deep_purple.html'],
				...['vinyl', 'CD', 'bootlegs', 'others'].map(page => ['rainbow', `rainbow/${page}.html`]),
				...['singles', 'LP', 'CD_singles', 'CD', 'cassette', 'bootlegs'].map(page => ['iron_maiden', `iron_maiden/${page}.html`]),
				['CD', 'CD.html', true]
			];
		} else {
			updateNavigation(cached.navb, artist, pageId);
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
					const tdFormat = tr.cells[formatCellIndex - 1];
					const prefix = tdFormat.innerHTML.trim() ? '<span class="w">. </span>' : '';
					tdFormat.insertAdjacentHTML('beforeend', prefix + bootlegTag);
				}
				if (includes.rainbow || includes.iron_maiden) {
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
			updateProgress('Loading table...');
			cached.rows = processAndSortTables([cached.tabla]); 
			finalizeSetup();
			[cached.up, cached.tabla, cached.fil].forEach(el => el && (el.style.opacity = '1'));
		});
	}

	function initMenu(basePath = '', pageId = 'page2', activeSectionPath = '') {
		const mainMenuList = menuItems.main.map(item => ({
			...item, href: item.href.startsWith('/') ? item.href : `${basePath}${item.href}`
		}));
		cached.nav.append(createMenuItems(mainMenuList));
		const targetHref = activeSectionPath ? `${basePath}${activeSectionPath}` : `${basePath}${pagename}`;
		updateNavigation(cached.nav, null, pageId, targetHref);
	}
	function getArtistContext(section) {
		const bootSuffix = '. The dates on <span class="b">bootlegs</span> use the day/month/year (DD/MM/YY) format';
		const shared = {basePath: '../', pageId: 'page2', columnIndex:3};
		const configs = {
			rainbow: {
				...shared,
				artist: 'rainbow',
				activeSectionPath: 'rainbow/all.html',
				navbId: 'page3',
				sources: ['vinyl','CD','bootlegs','others'].map(page => ['rainbow', `${page}.html`, true]),
				suffix: (isUnifiedView || includes.bootlegs || includes.others) ? bootSuffix : ''
			},
			maiden: {
				...shared,
				artist: 'iron_maiden',
				activeSectionPath: 'iron_maiden/all.html',
				navbId: (includes.singles || includes.bootlegs) ? 'page3' : 'page4',
				sources: ['singles','LP','CD_singles','CD','cassette','bootlegs'].map(page => ['iron_maiden', `${page}.html`, true]),
				suffix: (isUnifiedView || includes.bootlegs) ? bootSuffix : ''
			}
		};
		if (configs[section]) return configs[section];
		const isRootCDorVinyl  = includes.CD || includes.vinyl;
		const isRootPage = isRootCDorVinyl || isUnifiedView;
		return {
			artist: null,
			basePath: '',
			pageId: isRootPage ? 'page2' : 'page',
			activeSectionPath: '',
			navbId: null,
			sources: [],
			columnIndex: isRootPage ? 4 : 3,
			suffix: isRootCDorVinyl ? ', not including those listed on specific pages' + bootSuffix : bootSuffix,
			isTableWithArtist: isRootPage
		};
	}
	function formatRecordInfo(isSearch = false, visibleRows = []) {
		const note = '. Record collection updated July 2025.';
		if (!isUnifiedView && includes.cassette) return isSearch ? '' : note;
		if (isSearch && visibleRows.length === 1) return `(${visibleRows[0].cells[ctx.columnIndex]?.textContent.trim()})`;	
		const formatCount = Object.create(null);
		const vinylDetails = {'7"': {singles: 0, EPs: 0}, '12"': {singles: 0, EPs: 0}};
		const singleRegex = /single/;
		const epRegex = /\bEP\b/;
		for (const row of visibleRows) {
			const cellText = row._formatText;
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
		const suffix = `${ctx.suffix}${note}`;
		return ` ${result}${suffix}`;
	}
	function toggleNav() {
		const navtb = [cached.nav, cached.navt, cached.navb].filter(Boolean);
		navtb.forEach(el => el.classList.toggle('collapsed'));
	}
	function setupEventListeners(recordsLabel = 'records') {
		cached.input.addEventListener('input', function () {
			const matches = this.value.toLowerCase().trim().matchAll(searchTermRegex);
			const searchTerms = Array.from(matches, match => match[1] || match[0]);
			if (searchTerms.length === 0) {
				resetVisibility();
				return;
			}
			const visibleRows = filterAndShowRows(searchTerms);
			updateRecordCountMessage(cached.msg2, visibleRows, recordsLabel, true);
		});
		document.body.addEventListener('click', (e) => {
			const target = e.target;
			if (target.closest('#clr')) {
				cached.input.value = '';
				cached.input.dispatchEvent(new Event('input'));
				cached.input.focus();
				return;
			}
			if (target.closest('#nav-toggle')) {
				toggleNav();
				return;
			}
		});
		document.addEventListener('keyup', (e) => {
			if (e.key === 'Escape' && cached.nav.classList.contains('collapsed')) toggleNav();
		});
	}
	function filterAndShowRows(searchTerms) {
		const allRows = cached.rows;
		const rowsToShow = new Set();
		const sectionsToShow = new Set()
		const tablesToShow = new Set()
		for (const row of allRows) {
			if (searchTerms.every(t => row._searchText.includes(t))) {
				rowsToShow.add(row);
				if (!isUnifiedView) {
					const sec = row.closest('section');
					const tbl = row.closest('table');
					if (sec) sectionsToShow.add(sec);
					if (tbl) tablesToShow.add(tbl);
				}
			}
		}
		requestAnimationFrame(() => {
			allRows.forEach(r=>r.classList.toggle('hide', !rowsToShow.has(r)));
			if (!isUnifiedView) {
				cached.sections.forEach(sec=>sec.classList.toggle('hide', !sectionsToShow.has(sec)));
				cached.tablas.forEach(tbl=>tbl.classList.toggle('hide', !tablesToShow.has(tbl)));
			}
		});
		return [...rowsToShow];
	}
	function updateRecordCountMessage(targetElement, rows, recordsLabel, isSearchContext) {
		const count = rows.length;
		let html = '';
		if (isSearchContext) {
			if (isUnifiedView) cached.thead.hidden = cached.tabla.hidden = (count === 0);
			if (count === 0) {
				html = `No ${recordsLabel} found`;
			} else {
				const label = count === 1 ? recordsLabel.replace(/s$/, '') : recordsLabel;
				const info = formatRecordInfo(true, rows);
				html = `<span class="bo">${count}</span> ${label} found ${info}`;
			}
		} else {
			const info = formatRecordInfo(false, rows);
			html = `<span class="bo">${count}</span> ${recordsLabel}${info}`;
		}
		targetElement.innerHTML = html;
	}
	function resetVisibility() {
		cached.rows.forEach(row => row.classList.remove('hide'));
		if (isUnifiedView) {
			cached.thead.classList.remove('hide');
			cached.tabla.classList.remove('hide');
		}
		else {
			cached.sections.forEach(sec => sec.classList.remove('hide'));
			cached.tablas.forEach(tbl => tbl.classList.remove('hide'));
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
		const alt = targetHref.replace(/index\.html$/, '');
		const selector = targetHref
			? `a[href='${targetHref}'], a[href='${alt || '/'}']`
			: `a[href$='${pagename}'], a[href='/']`;
		const link = elem.querySelector(selector);
		if (link?.parentElement) {
			link.parentElement.id = id;
			link.parentElement.textContent = link.textContent;
		}
	}
	function processAndSortTables(tables) {
		return tables.flatMap(tabla => {
			if (ctx.isTableWithArtist) tabla.classList.add('is-root-cd-vinyl');
			new Tablesort(tabla);
			return Array.from(tabla.tBodies[0].rows, row => {
				row._searchText = row.textContent.toLowerCase();
				row._formatText = row.cells[ctx.columnIndex]?.textContent || '';
				return row;
			});
		});
	};
	function finalizeSetup(records = 'records') {
		updateRecordCountMessage(cached.msg, cached.rows, records, false);
		cached.input.placeholder = `Type here to search in the ${cached.rows.length} items`;
		setupEventListeners(records);
		if (!isUnifiedView) createIndex();
	}
	function createIndex() {
		if (!cached.ind) return;
		const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).map(letter => `<a href="#${letter}">${letter}</a>`).join(' ');
		cached.ind.innerHTML = `${letters} <a href="#V/A">Compilations</a>`;
	}
	cached.up.insertAdjacentHTML('afterbegin', '<a href="#toc">Go Up</a>');
});