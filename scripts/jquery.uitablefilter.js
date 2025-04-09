$(function() {
	$.uiTableFilter = function($table, phrase, column, ifHidden) {
		var new_hidden = false;
		if ($.uiTableFilter.last_phrase === phrase) return false;
		var words = phrase.toLowerCase().split(" ");
		var hideElement = function($elem) { $elem.hide(); new_hidden = true; };
		var showElement = function($elem) { $elem.show(); };
		var getText;
		var columnIndex = null;
		var $theadLastRowTh = $table.find("thead > tr:last > th");
		if (column) {
			if (!$.uiTableFilter.columnIndices) {
				$.uiTableFilter.columnIndices = {};
			}
			if ($.uiTableFilter.columnIndices[column] === undefined) {
				$theadLastRowTh.each(function(i) {
					if ($.trim($(this).text()) === column) {
						$.uiTableFilter.columnIndices[column] = i;
						return false;
					}
				});
			}
			columnIndex = $.uiTableFilter.columnIndices[column];
			if (columnIndex === undefined) {
				throw "given column: " + column + " not found";
			}
			getText = function($row) {
				return $row.find("td").eq(columnIndex).text();
			};
		} else {
			getText = function($elem) { return $elem.text(); };
		}

		var $rows;
		if (words.length > 1 && phrase.slice(0, -1) === $.uiTableFilter.last_phrase) {
			if (phrase.slice(-1) === " ") {
				$.uiTableFilter.last_phrase = phrase;
				return false;
			}
			words = [words[words.length - 1]];
			showElement = function($elem) {};
			$rows = $table.find("tbody:first > tr:visible");
		} else {
			new_hidden = true;
			$rows = $table.find("tbody:first > tr");
		}
		$rows.each(function() {
			var $row = $(this);
			if ($.uiTableFilter.has_words(getText($row), words, false)) {
				showElement($row);
			} else {
				hideElement($row);
			}
		});
		$.uiTableFilter.last_phrase = phrase;
		if (ifHidden && new_hidden) {
			ifHidden();
		}
		return $table;
	};
	$.uiTableFilter.last_phrase = "";
	$.uiTableFilter.columnIndices = {};
	$.uiTableFilter.has_words = function(str, words, caseSensitive) {
		var text = caseSensitive ? str : str.toLowerCase();
		for (var i = 0; i < words.length; i++) {
			if (text.indexOf(words[i]) === -1) {
				return false;
			}
		}
		return true;
	};
});
