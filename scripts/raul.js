$(function() {
	let path='', n='', pathname=window.location.pathname, pagename=pathname.split('/').pop();
	const $nav = $('#nav'),
		$navb = $('#navb'),
		$nav2 = $('#nav2'),
		$navt = $('#nav-toggle'),
		$input = $('input'),
		$tabla = $('.tablesorter').tablesorter(),
		$total = $('.tablesorter tbody tr'),
		totalRecords = $total.length;
	let boot='. The dates of <span class="b">bootlegs</span> are dd/mm/yy.';
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
		const $link = elem.find(`a[href${elem.is($nav) ? '*' : ''}='${page}']`);
		$link.parent().attr("id", id).html($link.text());
	}
	function addSection(name,rid){$nav2.append(`<li><a href="#${rid}">${name}</a></li>`);}
	function getRecordInfo(found,terms){
		return '(' + terms.map(term => 
		`${term}: <span class="c">${found.find(`td:nth-child(4):contains(${term.replace('singles', '')})`).length}</span>`
		).join('; ') + ')';
	}
	function getRecordInfoByPath(found, pathname) {
		if (pathname.includes('bootlegs')) {
			return getRecordInfo(found, ['7" singles', 'LP', 'CD']) + boot;
		} else if (pathname.includes('rainbow')) {
			if (pathname.includes('vinyl')) {
		 		return getRecordInfo(found, ['7" singles', 'LP']);
			} else if (pathname.includes('CD')) {
				return getRecordInfo(found, ['CD', 'DVD']);
			} else {
				return getRecordInfo(found, ['7" singles', '12" singles', 'LP', 'CD']) + boot;
			}
		} else if (pathname.includes('iron_maiden')) {
			return pathname.includes('/singles') ? getRecordInfo(found, ['7" singles', '12" singles']) : "";
		} else {
			return getRecordInfo(found, ['7" singles', '12" singles', 'LP', 'CD']) + boot;
		}
	}
	function updateMsgText(found,pathname,targetMsg,msgText){
		if (targetMsg=='msg2'){boot=''}
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
	}
	$navt.on('click', () => $navt.add($nav).add($navb).toggleClass('collapsed'));
	$(document).on('keyup',evt => {
		if (evt.keyCode === 27 && $nav.hasClass('collapsed')) {
			$navt.add($nav).add($navb).toggleClass('collapsed');
		}
	});
	$nav.append(`
	<li><a href="${path}rainbow/vinyl.html">Rainbow (Dio)</a></li>
	<li><a href="${path}iron_maiden/singles.html">Iron Maiden</a></li>
	<li><a href="${path}deep_purple.html">Deep Purple</a></li>
	<li><a href="${path}black_sabbath.html">Black Sabbath</a></li>
	<li><a href="${path}dio.html">DIO</a></li>
	<li><a href="${path}index.html">Vinyl Collection</a></li>
	<li><a href="${path}CD.html">CD Collection</a></li>
 	`);
	updateNav($nav,pagename,'page'+n);
	$('section').each(function(){addSection($(this).find('h3').first().text(), $(this).attr('id'));});
	updateMsgText($total,pathname,'msg',`Total records: <span class="bo">${totalRecords}</span> `);
	$input.attr('placeholder',`Type here to search in the ${totalRecords} items`);
	$('#clr').on('click',function(){$input.val('').focus().trigger({type:'keyup',Code:'Backspace',keyCode:8});$('#msg2').html('&nbsp;');});
	$('.tablesorter td:nth-child(2)').addClass('n');
	$('.tablesorter td:nth-child(3)').addClass('c');
	$('.tablesorter tr:nth-child(odd)').addClass('even');
	$('#fil input').on('keyup',function(){
		$.uiTableFilter($tabla,this.value);
		$('section:hidden').show();
		let found=$('.tablesorter > tbody > tr:visible');
		let msg2Text=found.length===0 ? 'No records found' : `<span class="bo">${found.length}</span> record(s) found `;
		updateMsgText(found,pathname,'msg2',msg2Text);
		$('.tablesorter').each(function(){
			$(this).parent().toggle($('tbody > tr:visible', this).length > 0);
		});
	});
	const columnWidths={'Title':'170px','City':'110px','Country':'110px','Label':'185px'};
	$.each(columnWidths, (columnName, width) => $(`th.header:contains('${columnName}')`).css('width', width));
	$('c').replaceWith(function(){return `<span class="c">${$(this).html()}</span>; `;});
	$('w').replaceWith(function(){return `<span class="w">${$(this).html()}</span>`;});
	$('.s').append('<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');
	$('#up').prepend('<a href="#toc">Go Up</a>&nbsp;');
	$('header').attr('id','toc');
});
