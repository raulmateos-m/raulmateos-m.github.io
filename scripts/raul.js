$(function() {
	let path='', n='', pathname=window.location.pathname, pagename=pathname.split('/').pop();
	const nav=$('#nav'), navb=$('#navb'), nav2=$('#nav2'), input=$('input');
	const tabla=$('.tablesorter').tablesorter(), total=$('.tablesorter tbody tr'), totalRecords=total.length;
	const msgText=`Total records: <span class="bo">${totalRecords}</span> `;
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
	function updateNav(elem,pagename,id){
		let inpage=elem.find(`a[href='${pagename}']`);
		if (elem===nav){inpage=nav.find(`a[href*='${pagename}']`);}
		inpage.parent().attr("id",id).html(inpage.text());
		inpage.remove();
	}
	function addSection(name,rid){nav2.append(`<li><a href="#${rid}">${name}</a></li>`);}
	function getRecordInfo(found,pathname,terms){
		const result = terms.map(term => {
			const count = found.find(`td:nth-child(4):contains(${term.replace('singles', '')})`).length;
			return `${term}: <span class="c">${count}</span>`;
		}).join('; ');
		return `(${result})`;
	}
	function getRainbow(found,pathname){
		const vinylTerms = ['7" singles','LP'];
		const cdTerms = ['CD','DVD'];
		if (pathname.includes('vinyl')){return getRecordInfo(found,pathname,vinylTerms)}
		else if (pathname.includes('CD')){return getRecordInfo(found,pathname,cdTerms)}
		else {return getDefault(found);}
	}
	function getIronMaiden(found,pathname){
		const singlesTerms = ['7" singles', '12" singles'];
		if (pathname.includes('/singles')) {return getRecordInfo(found,pathname,singlesTerms)}
		else {return '';}
	}
	function getBootlegs(found,pathname){
		const bootlegsTerms = ['7" singles','LP','CD'];
		return getRecordInfo(found,pathname,bootlegsTerms)+boot;
	}
	function getDefault(found){
		const defaultTerms = ['7" singles','12" singles','LP','CD'];
		return getRecordInfo(found,'',defaultTerms)+boot;
	}
	function updateMsgText(found,pathname,targetMsg,msgText){
		if (targetMsg=='msg2'){boot=''}
		if (found.length!= 0){
			if (pathname.includes('bootlegs')) {msgText += getBootlegs(found, pathname);}
			else if (pathname.includes('rainbow')) {msgText += getRainbow(found, pathname);}
			else if (pathname.includes('iron_maiden')) {msgText += getIronMaiden(found, pathname);}
			else {msgText += getDefault(found);}
		}
		$(`#${targetMsg}`).html(msgText);
	}
	function updateNavandVars(page,id){
		navb.append(menuItems[page]);
		updateNav(navb,pagename,id);
		path='../';
		n='2';
	}
	if (pathname.includes('rainbow')){
		updateNavandVars('rainbow','page3');
		pagename='rainbow';
	}
	if (pathname.includes('iron_maiden')){
		const id=pathname.includes('/singles.html') || pathname.includes('bootlegs.') ? "page3" : "page4";
		updateNavandVars('iron_maiden',id);
		pagename='iron_maiden';
	}
	$('#nav-toggle').on('click',function(){$('#nav-toggle,#nav,#navb').toggleClass('collapsed');});
	$(document).on('keyup',function(evt){if (evt.keyCode === 27 && $('#nav').hasClass('collapsed')){$('#nav-toggle,#nav,#navb').toggleClass('collapsed');}});
	nav.append(`<li><a href="${path}rainbow/vinyl.html">Rainbow (Dio)</a></li><li><a href="${path}iron_maiden/singles.html">Iron Maiden</a></li><li><a href="${path}deep_purple.html">Deep Purple</a></li><li><a href="${path}black_sabbath.html">Black Sabbath</a></li><li><a href="${path}dio.html">DIO</a></li><li><a href="${path}index.html">Vinyl Collection</a></li><li><a href="${path}CD.html">CD Collection</a></li>`);
	updateNav(nav,pagename,'page'+n);
	$('section').each(function(){let rid=$(this).attr('id');addSection($(this).find('h3').first().html(),rid);});
	updateMsgText(total,pathname,'msg',msgText);
	input.attr('placeholder',`Type here to search in the ${totalRecords} items`);
	$('#clr').on('click',function(){input.val('').focus().trigger({type:'keyup',Code:'Backspace',keyCode:8});$('#msg2').html('&nbsp;');});
	$('.tablesorter td:nth-child(2)').addClass('n');
	$('.tablesorter td:nth-child(3)').addClass('c');
	$('.tablesorter tr:nth-child(odd)').addClass('even');
	$('#fil input').on('keyup',function(){
		$.uiTableFilter(tabla,this.value);
		$('section:hidden').show();
		let found=$('.tablesorter > tbody > tr:visible');
		let msg2Text=found.length===0 ? 'No records found' : `<span class="bo">${found.length}</span> record(s) found `;
		updateMsgText(found,pathname,'msg2',msg2Text);
		$('.tablesorter').each(function(){
			const visibleRows=$('tbody > tr:visible',this);
			if (visibleRows.length===0){$(this).parent().hide();};
		});
	});
	const columnWidths={'Title':'170px','City':'110px','Country':'110px','Label':'185px'};
	$.each(columnWidths,function(columnName, width) {$(`th.header:contains('${columnName}')`).attr('width',width);});
	$('c').each(function(){$(this).replaceWith(`<span class="c">${$(this).html()}</span>; `);});
	$('w').each(function(){$(this).replaceWith(`<span class="w">${$(this).html()}</span>`);});
	$('.s').append('<a href="#toc"> <i class="icon-long-arrow-up"></i></a>');
	$('#up').prepend('<a href="#toc">Go Up</a>&nbsp;');
	$('header').attr('id','toc');
});
