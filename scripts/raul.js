$(function() {
	let n = '';
	let pathname = window.location.pathname
	let pathSegments = pathname.split('/');
	let pagename = pathSegments.pop();
	let basePath = pathSegments.length > 1 ? '../' : '';

	const $nav = $('#nav'),
		$navb = $('#navb'),
		$nav2 = $('#nav2'),
		$ind = $('#ind'),
		$clr = $('#clr'),
		$msg2 = $('#msg2'),
		$navt = $('#nav-toggle'),
		$navtc = $navt.add($nav).add($navb),
		$input = $('input'),
		$tabla = $('.tablesorter'),
		$total = $tabla.find('tbody tr'),
		$tableSorterInstance = $tabla.tablesorter();
	let records = 'records',
		boot = '. The dates of <span class="b">bootlegs</span> are dd/mm/yy',
		spec = '. The records listed on specific pages are not counted here',
		specCD = '. The CDs listed on specific pages are not counted here',
		updated = '. Record collection updated March 2025';
	const addSection = (name, rid) => {
		$nav2.append(`<li><a href="#${rid}">${name}</a></li>`);
	};
	const defaultTerms = [
		{ searchTerm: '7"', label: '7" singles/EPs' },
		{ searchTerm: '12"', label: '12" singles/EPs' },
		{ searchTerm: 'LP', label: 'LPs' },
		{ searchTerm: 'CD', label: 'CDs' },
		{ searchTerm: 'DVD', label: 'DVDs' },
		{ searchTerm: 'Box', label: 'Boxes' }
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
	const mainMenuList = mainMenuItems.map(item => `<li><a href="${basePath}${item.href}">${item.text}</a></li>`).join('');
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
		const $link = elem.find(selector);
		$link.parent().attr("id", id).html($link.text());
	};
	function updateNavandVars(page, id) {
		const submenuItems = menuItems[page];
		const submenuList = submenuItems.map(item => `<li><a href="${item.href}">${item.text}</a></li>`).join('');
		$navb.append(submenuList);
		updateNav($navb, pagename, id);
		n = '2';
	}
	function getRecordInfo(found, terms) {
		if (terms.length === 1 && terms[0].searchTerm === 'CD') {
			return '';
		} else {
			let columnIndex = 4;
			const searchTerms = terms.map(termObj => termObj.searchTerm);
			if (terms.length === 3 && searchTerms.includes('7"') && searchTerms.includes('12"') && searchTerms.includes('LP')) {
				columnIndex = 5;
			}
			const counts = {};
			terms.forEach(termObj => { counts[termObj.searchTerm] = 0; });
			found.each(function() {
				const $row = $(this);
				const $cell = $row.find(`td:nth-child(${columnIndex})`);
				if ($cell.length) {
					const cellText = $cell.text();
					for (const termObj of terms) {
						if (cellText.includes(termObj.searchTerm)) {counts[termObj.searchTerm]++;}
					}
				}
			});
			return ' (' + terms.map(termObj => `${termObj.label}: <span class="c">${counts[termObj.searchTerm]}</span>`).join('; ') + ')';
		}
	}
	function getRecordInfoByPath(found, pathname) {
		const routeConfig = {
			'bootlegs': { terms: ['7"', 'LP', 'CD', 'Box'], suffix: boot },
			'rainbow/vinyl': { terms: ['7"', 'LP', 'Box'], suffix: '' },
			'rainbow/CD': { terms: ['CD', 'DVD', 'Box'], suffix: '' },
			'rainbow': { terms: ['7"', '12"', 'LP', 'CD'], suffix: boot },
			'iron_maiden/singles': { terms: ['7"', '12"', 'Box'], suffix: '' },
			'vinyl': { terms: ['7"', '12"', 'LP'], suffix: spec + boot },
			'CD': { terms: ['CD'], suffix: specCD + boot },
			'default': { terms: ['7"', '12"', 'LP', 'CD'], suffix: boot }
		};
		let config = routeConfig.default;
		for (const pathPart in routeConfig) {
			if (pathname.includes(pathPart)) {
				config = routeConfig[pathPart];
				break;
			}
		}
		if (pathname.includes('iron_maiden') && !pathname.includes('/singles') && !pathname.includes('bootlegs')) {
			return updated;
		}
		const filteredTerms = defaultTerms.filter(term => config.terms.includes(term.searchTerm));
		return getRecordInfo(found, filteredTerms) + config.suffix + updated;
	}
	const updateMsgText = (found, pathname, targetMsg, msgText) => {
		if (targetMsg === 'msg2') { 
			boot = spec = specCD = updated = ''; 
		}
		$(`#${targetMsg}`).html(msgText + (found.length !== 0 ? getRecordInfoByPath(found, pathname) : ''));
	};
	if (pathname.includes('rainbow')) {
		updateNavandVars('rainbow', 'page3');
		pagename = 'rainbow';
		n = '2';
	} else if (pathname.includes('iron_maiden')) {
		updateNavandVars('iron_maiden', pathname.includes('/singles.html') || pathname.includes('bootlegs.') ? "page3" : "page4");
		pagename = 'iron_maiden';
		n ='2';
	} else if (pathname.includes('CD.html')) {
		records = 'CDs';
		$tabla.find('td:first-child').addClass('bo');
		n = '2b';
	} else if (pathname.includes('vinyl.html')) {
		$tabla.find('td:first-child').addClass('bo');
		n = '2b';
	}
	$navt.on('click', () => $navtc.toggleClass('collapsed'));
	$(document).on('keyup', evt => {
		if (evt.key === 'Escape' && $nav.hasClass('collapsed')) {
			$navtc.toggleClass('collapsed');
		}
	});
	$nav.append(mainMenuList);
	updateNav($nav, pagename, 'page' + n);
	$('section').each(function() {
		const $section = $(this);
		addSection($section.find('h3').first().text(), $section.attr('id'));
	});
	const totalRecords = $total.length;
	updateMsgText($total, pathname, 'msg', `Total ${records}: <span class="bo">${totalRecords}</span>`);
	$input.attr('placeholder', `Type here to search in the ${totalRecords} items`);
	$clr.on('click', function() {
		$input.val('').focus().trigger({ type: 'keyup', Code: 'Backspace', keyCode: 8 });
		$msg2.html('&nbsp;');
	});
	$tabla.find('td:nth-child(2)').addClass('n');
	$tabla.find('td:nth-child(3)').addClass('c');
	$tabla.find('tbody tr:nth-child(odd)').addClass('even');
	const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
	const indexHTML = letters.map(letter => `<a href="#${letter}">${letter}</a>`).join(' ') + ' <a href="#V/A">Compilations</a>';
	$ind.append(indexHTML);
	$('#fil input').on('keyup', function() {
		$.uiTableFilter($tableSorterInstance, this.value);
		$('section:hidden').show();
		const found = $tabla.find('tbody > tr:visible');
		const msg2Text = found.length === 0 ? `No ${records} found` : `<span class="bo">${found.length}</span> ${records} found `;
		updateMsgText(found, pathname, 'msg2', msg2Text);
		$tabla.each(function() {
			$(this).parent().toggle($('tbody > tr:visible', this).length > 0);
		});
	});
	function replaceElement(selector, className) {
		$(selector).replaceWith(function() {
			return `<span class="${className}">${$(this).html()}</span>${className === 'c' ? '; ' : ''}`;
		});
	}
	replaceElement('c', 'c');
	replaceElement('w', 'w');
	$('.s').append('<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');
	$('#up').prepend('<a href="#toc">Go Up</a>&nbsp;');
	$('header').attr('id', 'toc');
});