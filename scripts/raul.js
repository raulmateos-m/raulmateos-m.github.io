$(function() {
	let path='', n='', pathname=window.location.pathname, pagename=pathname.split('/').pop();
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
		boot='. The dates of <span class="b">bootlegs</span> are dd/mm/yy',
		spec='. The records listed on specific pages are not counted here',
		specCD='. The CD listed on specific pages are not counted here',
		updated='. Record collection updated March 2025';
	const menuItems={
		'rainbow':[
			'<li><a href="vinyl.html">Vinyl</a></li>',
			'<li><a href="CD.html">CD &amp; DVD</a></li>',
			'<li><a href="bootlegs.html">Bootlegs</a></li>',
			'<li><a href="others.html">Without Dio</a></li>'
			],
		'iron_maiden':[
			'<li><a href="singles.html">Vinyl - Singles</a></li>',
			'<li><a href="LP.html">Vinyl - LP</a></li>',
			'<li><a href="CD_singles.html">CD - Singles</a></li>',
			'<li><a href="CD.html">CD</a></li>',
			'<li><a href="cassette.html">Cassette</a></li>',
			'<li><a href="bootlegs.html">Bootlegs</a></li>'
		]
	};
	function updateNav(elem, page, id) {
		let selector = page.includes('.html') ? `a[href='${page}']` : `a[href*='${page}']`;
		const $link = elem.find(selector);
		$link.parent().attr("id", id).html($link.text());
	}
	function addSection(name,rid){$nav2.append(`<li><a href="#${rid}">${name}</a></li>`);}
	function getRecordInfo(found,terms){
		if (terms =='CD') {return '';
		} else {
			let columnIndex = 4;
			if (terms == '7" singles,12" singles,LP') {columnIndex = 5;}
			let cellTexts = [];
			found.each(function() {
				let cell = $(this).find(`td:nth-child(${columnIndex})`);
				if (cell.length) {
					cellTexts.push(cell.text());
				}
			});
			let counts = {};
			terms.forEach(term => {
				let searchTerm = term.replace('singles', '');
				counts[term] = 0;
				cellTexts.forEach(text => {
					if (text.indexOf(searchTerm) !== -1) {counts[term]++;}
				});
			});
			return '(' + terms.map(term => `${term}: <span class="c">${counts[term]}</span>`).join('; ') + ')';
		}
	}
	function getRecordInfoByPath(found, pathname) {
		if (pathname.includes('bootlegs')) {
			return getRecordInfo(found, ['7" singles', 'LP', 'CD']) + boot + updated;
		} else if (pathname.includes('rainbow')) {
			if (pathname.includes('vinyl')) {
				return getRecordInfo(found, ['7" singles', 'LP']) + updated;
			} else if (pathname.includes('CD')) {
				return getRecordInfo(found, ['CD', 'DVD']) + updated;
			} else {
				return getRecordInfo(found, ['7" singles', '12" singles', 'LP', 'CD']) + boot + updated;
			}
		} else if (pathname.includes('iron_maiden')) {
			return pathname.includes('/singles') ? getRecordInfo(found, ['7" singles', '12" singles']) : "";
		} else if (pathname.includes('vinyl')) {
			return getRecordInfo(found, ['7" singles', '12" singles', 'LP']) + spec + boot + updated;;
		} else if (pathname.includes('CD')) {
			return getRecordInfo(found, ['CD']) + specCD + boot + updated;
		} else {
			return getRecordInfo(found, ['7" singles', '12" singles', 'LP', 'CD']) + boot + updated;
		}
	}
	function updateMsgText(found,pathname,targetMsg,msgText){
		if (targetMsg=='msg2'){boot=spec=specCD=updated='';}
		$(`#${targetMsg}`).html(msgText + (found.length !== 0 ? getRecordInfoByPath(found, pathname) : ''))
	}
	function updateNavandVars(page,id){
		$navb.append(menuItems[page]);
		updateNav($navb,pagename,id);
		path='../';
		n='2';
	}
	if (pathname.includes('rainbow')){
		updateNavandVars('rainbow','page3');
		pagename='rainbow';
	} else if (pathname.includes('iron_maiden')){
		updateNavandVars('iron_maiden', pathname.includes('/singles.html') || pathname.includes('bootlegs.') ? "page3" : "page4");
		pagename = 'iron_maiden';
	} else if (pathname.includes('CD.html')){
		records = 'CD';
		$tabla.find('td:first-child').addClass('bo');
		n='2b';
	} else if (pathname.includes('vinyl.html')){
		$tabla.find('td:first-child').addClass('bo');
		n='2b';
	}
	$navt.on('click', () => $navtc.toggleClass('collapsed'));
	$(document).on('keyup',evt => {
		if (evt.key === 'Escape' && $nav.hasClass('collapsed')) {
			$navtc.toggleClass('collapsed');
		}
	});
	const mainMenuHTML =`
	<li><a href="${path}rainbow/vinyl.html">Rainbow (Dio)</a></li>
	<li><a href="${path}iron_maiden/singles.html">Iron Maiden</a></li>
	<li><a href="${path}deep_purple.html">Deep Purple</a></li>
	<li><a href="${path}black_sabbath.html">Black Sabbath</a></li>
	<li><a href="${path}dio.html">DIO</a></li>
	<li><a href="${path}vinyl.html">Vinyl Collection</a></li>
	<li><a href="${path}CD.html">CD Collection</a></li>
	`;
	$nav.append(mainMenuHTML);
	updateNav($nav,pagename,'page'+n);
	$('section').each(function(){addSection($(this).find('h3').first().text(), $(this).attr('id'));});
	const totalRecords = $total.length;
	updateMsgText($total,pathname,'msg',`Total ${records}: <span class="bo">${totalRecords}</span> `);
	$input.attr('placeholder',`Type here to search in the ${totalRecords} items`);
	$clr.on('click',function(){$input.val('').focus().trigger({type:'keyup',Code:'Backspace',keyCode:8});$msg2.html('&nbsp;');});
	$tabla.find('td:nth-child(2)').addClass('n');
	$tabla.find('td:nth-child(3)').addClass('c');
	$tabla.find('tbody tr:nth-child(odd)').addClass('even');
	let indexHTML = '';
	for (let i = 65; i <= 90; i++) {
		const letter = String.fromCharCode(i).toUpperCase();
		indexHTML += `<a href="#${letter}">${letter}</a> `;
	}
	indexHTML += '<a href="#V/A">Compilations</a>';
	$ind.append(indexHTML);
	$('#fil input').on('keyup',function(){
		$.uiTableFilter($tableSorterInstance,this.value);
		$('section:hidden').show();
		const found=$tabla.find('tbody > tr:visible');
		const msg2Text=found.length===0 ? `No ${records} found` : `<span class="bo">${found.length}</span> ${records} found `;
		updateMsgText(found,pathname,'msg2',msg2Text);
		$tabla.each(function(){
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
	$('header').attr('id','toc');
});
