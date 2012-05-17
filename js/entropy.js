/*
 * coding-theory :: entropy
 *
 * Copyright (c) 2012 Konstantyn Nesterenko
 * Email: kostya.nesterenko@gmail.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */


/* 
	Создает массив частот символов
	  [{name:a,     символ
		   f:1,     количество
		   v:0.1},  вероятность
		{name:s,
		   f:3,
		   v:0.1}]
*/
frequenciesBuild = function(text) {
	var frequencies = []
	for (i=0; i<text.length; i++) {
		var p = 0
		for (ch in frequencies) {
			if (frequencies[ch].name == text[i]) {
				p++
			}
		}
		if (p == 0) {
			frequencies.push({ name : text[i] , f : 1})
		}
		else {
			for (ch in frequencies) {
				if (frequencies[ch].name == text[i]) {
					frequencies[ch].f++
				}
			}
		}
	}
	
	// Вероятность
	for (ch in frequencies) {
		frequencies[ch].v = (frequencies[ch].f/text.length).toFixed(3)
	}
	return frequencies
}


/* Создает таблицу частот */
tabl_frequenciesBuild = function(mas) {
	t=$('<table class="sort"></table>')
	t.append('<thead><tr>\
				<td>Символ</td>\
				<td>Количество</td>\
				<td>Вероятность</td>\
			</tr></thead>')
	for (ch in mas) {
		t.append('<tr>\
					<td>'+mas[ch].name+'</td>\
					<td>'+mas[ch].f+'</td>\
					<td>'+mas[ch].v+'</td>\
				</tr>')
	}
	return t
}

/* Возвращает массив из двух минимальных вершин */
TwoMinimal = function(mas) {
	var min = []
	for (ch in mas) {
		if (!min[0]) {
			min[0] = mas[ch]
		}
		if (mas[ch].f <= min[0].f) {
			min[1] = min[0]
			min[0] = mas[ch]
		}
		if ( min[1] == min[0] ) {
			for (ch in mas) {
				if (mas[ch] != min[0]) {
					min[1] = mas[ch]
				}
			}
			for (ch in mas) {
				if (mas[ch].f <= min[1].f && mas[ch] != min[0]) {
					min[1] = mas[ch]
				}
			}
		}
		if (mas[ch].f < min[1].f && mas[ch].name != min[0].name) min[1] = mas[ch]
	}
	return min
}


/* Группировка вершин с найменьшими весами и добавление новой вершины */
function treeStep(tree) {
	var min = TwoMinimal(tree) // Массив вершин с минимальными весами
	var apex = {}              // Новая вершина
	
	// Удаление вершин с наименьшими весами из дерева
	for (ch in tree) {
		if (tree[ch].name == min[0].name) {
			delete tree[ch]
		}
		else if (tree[ch].name == min[1].name) {
			delete tree[ch]
		}
	}
	
	// Формирование новой вершины из двух наименьших
	apex.name = min[0].name+min[1].name
	apex.f = min[0].f+min[1].f
	apex.child = min
	
	// Удаление массива с минимальными вершинами
	delete min
	
	// Добавление новой вершины к дереву
	tree.push(apex)
	
	return tree
}


/* Возвращает имена вершин с наименьшими весами */
function Minapex(tree) {
	var minapex = []
	var min = TwoMinimal(tree)
	minapex.push(min[0].name)
	minapex.push(min[1].name)
	return minapex
}


/* Создание дерева Хаффмана (всего и сразу) */
treeBuild = function(mas) {
	var tree = mas
	var len = tree.length
	while (len > 1) {
		tree = treeStep(tree)
		len--
	}
	return tree
}


/* Делит массив на две примерно вероятные части (для алгоритма Шеннона-Фано) */
ChildMasTreeSha = function(mas) {
	var cmas = []
	cmas[0] = []
	cmas[1] = []
	var total_frequency = (0)     // Суммарная частота
	var half_frequency = (0)      // Половина суммарной частоты
	var first_ch_frequency = (0)  // Суммарная частота первой части
	var d = (0)                   // Модуль разницы между половиной суммарной частоты и первой частью
	var d_old = (0)
	var m = (0)                   // последний элемент первой части
	
	for (ch in mas) {
		total_frequency += mas[ch].f
	}
	
	half_frequency = (total_frequency/2)
	
	for (ch in mas) {
		first_ch_frequency += mas[ch].f
		d = Math.abs(half_frequency-first_ch_frequency)
		if (d < d_old) m = ch
		d_old = Math.abs(half_frequency-first_ch_frequency)
	}
	m++
	
	// Создаем первую часть
	cmas[0] = mas.slice(0, m)
	// Создаем вторую часть
	cmas[1] = mas.slice(m)
	
	return cmas
}


/* Делит массив на две примерно вероятные части (для алгоритма Шеннона-Фано) */
SearchChildSha = function(mas, count, dd, light) {
	var child = []        // Дочерние элементы
	var len = mas.length  // Длина массива
	if (len > 1) {		
		var cmas = ChildMasTreeSha(mas)
		child.push(BuildApexSha(cmas[0], count, dd, light))
		child.push(BuildApexSha(cmas[1], count, dd, light))
	}
	return child
}


/* Возвращает вершину (для алгоритма Шеннона-Фано) */
BuildApexSha = function(mas, count, d, light) {
	var apex = {}
	apex.name = ""     // Имя
	apex.f = (0)       // Вес
	apex.cont = ''
	count++
	for (ch in mas) {
		apex.name += mas[ch].name
		apex.f += mas[ch].f
	}
	if (light && mas.length > 1 && count == d) {
		var cmas = ChildMasTreeSha(mas)
		for (c in cmas[0]) apex.cont += '<span class="cont mas1">"'+cmas[0][c].name+'" : '+cmas[0][c].f+'</span>'
		for (c in cmas[1]) apex.cont += '<span class="cont mas2">"'+cmas[1][c].name+'" : '+cmas[1][c].f+'</span>'
	}
	else if (mas.length > 1 && count < d) {
		var cmas = ChildMasTreeSha(mas)
		for (c in cmas[0]) apex.cont += '<span class="cont mas1">"'+cmas[0][c].name+'" : '+cmas[0][c].f+'</span>'
		for (c in cmas[1]) apex.cont += '<span class="cont mas2">"'+cmas[1][c].name+'" : '+cmas[1][c].f+'</span>'
	}
	else {
		for (ch in mas) apex.cont += '<span class="cont">"'+mas[ch].name+'" : '+mas[ch].f+'</span>'
		treeshaend = 1
	}
	if (count < d && apex.name.length > 1) apex.child = SearchChildSha(mas, count, d, light) // Дочерние элементы
	return apex
}


/* Сортировка пузырьковым методом */
SortMas = function(mas) {
	var mass = mas
	var len = mass.length
	var t = (1)
	while (t) {
		t = (0)
		for (var j=0; j<(len-1); j++) {
			if (mas[j].f < mas[j+1].f) {
				var a = mas[j]
				var b = mas[j+1]
				mas.splice(j, 2, b, a)
				t = (1)
			}
		}
	}
	return mas
}


/* Создание дерева Шеннона-Фано (всего и сразу) */
treeShaBuild = function(mas, d, light) {
	var tree = []                   // Дерево
	
	// Упорядочивание по невозростанию
	var orderedmas = SortMas(mas)
	
	var apex = BuildApexSha(orderedmas, 0, d, light)  // Вершина
	tree.push(apex)
	return tree
}


/* Рендеринг дерева */
function recurs(a, apex1, apex2) {
	var r = ""
	for (ch in a) {
		if (a[ch].name.length == 1) {
			var p = '"'+a[ch].name+'" : '+a[ch].f
			var underap = ''
		}
		else {
			var p = a[ch].f
			var underap = '<div class="under"><div class="underap"></div><div class="underap2"></div></div>'
		}
		if (a[ch].child != "undefined") {
			var b = a[ch].child
		}
		if (ch == 0) var overap = '<div><div class="overaph_left"><span>0</span></div></div>'
		else overap = '<div><div class="overaph_right"><span>1</span></div></div>'
		if (a[ch].name == apex1 || a[ch].name == apex2) r += '<li>'+overap+'<span class="backlight">'+p+'</span>'+underap+recurs(b)+'</li>'
		else r += '<li>'+overap+'<span>'+p+'</span>'+underap+recurs(b)+'</li>'
	}
	if (r == "") return r
	if (r != "") return '<ul>'+r+'</ul>'
}
function Rendertree(tree, apex1, apex2) {
	var a = $('<ul id="black" class="treeview-black"></ul>')
	a.append(recurs(tree, apex1, apex2))
	return a
}


/* Рендеринг дерева Шеннона-Фано */
function recursSha(a, apex1, apex2) {
	var r = ""
	for (ch in a) {
		//var p = '"'+a[ch].name+'" : '+a[ch].f
		var p = a[ch].cont
		if (a[ch].name.length == 1 || typeof(a[ch].child) == "undefined") var underap = ''
		else var underap = '<div class="under"><div class="underap"></div><div class="underap2"></div></div>'
		if (a[ch].child != "undefined") {
			var b = a[ch].child
		}
		if (ch == 0) var overap = '<div><div class="overaph_left"><span>0</span></div></div>'
		else overap = '<div><div class="overaph_right"><span>1</span></div></div>'
		if (a[ch].name == apex1 || a[ch].name == apex2) r += '<li>'+overap+'<span class="backlight">'+p+'</span>'+underap+recursSha(b)+'</li>'
		else r += '<li>'+overap+'<span>'+p+'</span>'+underap+recursSha(b)+'</li>'
	}
	if (r == "") return r
	if (r != "") return '<ul>'+r+'</ul>'
}
function RenderTreeSha(tree, apex1, apex2) {
	var a = $('<ul id="black" class="treeview-black"></ul>')
	a.append(recursSha(tree, apex1, apex2))
	return a
}


/* Инвертирует код */
Inverse = function(code) {
	var a = ""
	for (ch in code) {
		if (code[ch] == '0') a += '1'
		else a += '0'
	}
	return a
}


/* Создает массив кодовых слов из дерева */
CodeWords = function(a, parent, g) {
	var mas = []
	if (!parent) var parent = ""
	for (ch in a) {
		if (a[ch].child != "undefined") {
			var b = a[ch].child
		}
		if (a[ch].name.length > 1 && g) {
			var e = parent + ch
		}
		if (a[ch].name.length == 1) {
			var code = parent+ch
			mas.push({  'name' : a[ch].name,
					    'code1' : code,
						'code2' : Inverse(code) })
		}
		else {
			var t = CodeWords(b, e, 1)
			for (y in t) {
				mas.push(t[y])
			}
		}
	}
	return mas
}


/* Инвертирование кодовых слов */
function inverseCodewords() {
	$("#table_codewords .codeword").each(function(){
		var a = $(this).html()
		var len = $(this).html().length
		var invers = ""
		for (var i=0; i<len; i++) {
			if (a[i] == "0") invers += "1"
			else invers += "0"
		}
		$(this).html(invers)
	})
}


/* Вывод начального состояния дерева Хаффмана */
function ViewTreeStart() {
	$("#tree").empty()
	var text = $("#text").val()
	var a = $('input[name=tree_build_type]:checked').val()
	if ( a == 'steps' ) {
		$("#next_step_group").show()
		treeForSteps = frequenciesBuild(text)
		$("#tree").html(Rendertree(treeForSteps))
		
	}
	if ( a == 'quick' ) {
		$("#next_step_group").hide()
		$("#tree").html(Rendertree(treeBuild(frequenciesBuild(text))))
	}
	$("#black").treeview({
		control: "#treecontrol",
		persist: "cookie",
		cookieId: "treeview-black"
	});
}


/* Вывод начального состояния дерева Шеннона-Фано */
function ViewTreeShaStart() {
	$("#tree_shannone").empty()
	var text = $("#text").val()
	var a = $('input[name=tree_build_type_shannone]:checked').val()
	if ( a == 'steps' ) {
		$("#next_step_group_shannone").show()
		$("#tree_shannone").html(RenderTreeSha(treeShaBuild(frequenciesBuild(text), 1)))
		treeshastep = 1
	}
	if ( a == 'quick' ) {
		$("#next_step_group_shannone").hide()
		$("#tree_shannone").html(RenderTreeSha(treeShaBuild(frequenciesBuild(text), 99)))
	}
	$("#tree_shannone ul").treeview({
		control: "#treecontrol",
		persist: "cookie",
		cookieId: "treeview-black"
	});
	treeshastep = 1
}


/* Вставляет перевод строки каждые n символов */
Breakline = function(sline) {
	var n = (100)
	var tline = ""
	for (var i=0; i<sline.length; i++) {
		if (i%n==0 && i!=0) tline += "<br />"
		tline += sline[i]
	}
	return tline
}


/* 
	Возвращает код символа из словаря
		a    - Имя символа
		dic  - Словарь 
*/
CodeCh = function(a, dic) {
	for (ch in dic) {
		if (dic[ch].name == a) {
			var codech = dic[ch].code1
		}
	}
	return codech
}


/* Кодирует текст по словарю */
CodedDic = function(text, dic) {
	var code = ""
	for (ch in text) {
		code += CodeCh(text[ch], dic)
	}
	return code
}


/* Формирует таблицу кодовых слов */
TablCodeWords = function(a, b) {
	t = $('<table class="sort"></table>')
	t.append('<thead><tr>\
						<td>Символ</td>\
						<td>Код Хаффмана</td>\
						<td>Код Шеннона-Фано</td>\
					</tr></thead>')
	for (ch in a) {
		var name = a[ch].name
		var code_haf = a[ch].code1
		var code_sha = CodeCh(name, b)
		t.append('<tr>\
						<td>'+name+'</td>\
						<td>'+code_haf+'</td>\
						<td>'+code_sha+'</td>\
					</tr>')
	}
	return t
}


function Coded() {
	var text = $("#text").val() // Введенный текст
	
	if (!text) {
		$("#mainhide").hide()
	}
	else {
		var textlen = text.length                  // Длина введенного сообщения
		var frequencies = frequenciesBuild(text)   // Массив частот
		var frequencies2 = frequenciesBuild(text)  // Массив частот
		var text_abc = frequencies.length          // Длина словаря
		
		var unicodelen                             // Длина кодового слова при равномерном кодировании
		if (text_abc == 1) unicodelen = 1
		else unicodelen = Math.ceil(Math.log(text_abc)/Math.log(2))
		
		var unitextlen = textlen*unicodelen         // Длина сообщения при равномерном кодировании
		
		var statistics = "Длина сообщения (символов) : "+textlen+"<br />\
					  Количество символов алфавита : "+text_abc+"<br />\
					  Длина кодового слова при равномерном кодировании (бит) : "+unicodelen+"<br />\
					  Длина сообщения при равномерном кодировании (бит) : "+unitextlen
		
		// Таблица частот
		var tabl = tabl_frequenciesBuild(frequencies)
		
		// Деревья
		var tree = treeBuild(frequencies)           // Хаффмана
		var tree_sha = treeShaBuild(frequencies2, 99)   // Шеннона-Фано
		
		// Массивы кодовых слов
		var dic_haf = CodeWords(tree)       // Хаффмана
		var dic_sha = CodeWords(tree_sha)   // Шеннона-Фано
		
		// Вывод страницы
		$("#mainhide").show()
		
		// Вывод статистики по входному тексту
		$("#statistics").html(statistics)
		
		// Вывод таблицы частот
		$("#table_of_frequencies").html(tabl)
		
		// Вывод дерева Хаффмана
		ViewTreeStart()
		
		// Вывод дерева Шеннона-Фано
		ViewTreeShaStart()
		treeshastep = 1
		
		// Вывод таблицы кодовых слов
		$("#table_codewords_all").html(TablCodeWords(dic_haf, dic_sha))
		
		// Сортировка таблиц
		initial_sort_id = 0;
		initial_sort_up = 0;
		init()
		
		// Вывод кодированного сообщения по алгоритму Хаффмана
		var code = CodedDic(text, dic_haf)
		$("#code").html(Breakline(code))
		
		// Вывод статистики по алгоритму Хаффмана
		var codelen = code.length
		var koef = (codelen/unitextlen).toFixed(3)
		var statistics2 = "Длина кодированного сообщения (бит): "+codelen+"<br />\
						Коэфициент сжатия: "+koef
		$("#statistics2").html(statistics2)
		
		
		// Вывод кодированного сообщения по алгоритму Шеннона-Фано
		var code_sha = CodedDic(text, dic_sha)
		$("#code_shannone").html(Breakline(code_sha))
		
		// Вывод статистики по алгоритму Шеннона-Фано
		var codelen_sha = code_sha.length
		var koef_sha = (codelen_sha/unitextlen).toFixed(3)
		var statistics2_sha = "Длина кодированного сообщения (бит): "+codelen_sha+"<br />\
						Коэфициент сжатия: "+koef_sha
		$("#statistics2_shannone").html(statistics2_sha)
	}
}


/* Формирование дерева Хаффмана 1-й шаг */
TreeHaf1step = function() {
	var len = 0
	for (ch in treeForSteps) len++
	if (len > 1) {
		var newap = Minapex(treeForSteps)
		$("#tree").html(Rendertree(treeForSteps, newap[0], newap[1]))
		$("#black").treeview({
			control: "#treecontrol",
			persist: "cookie",
			cookieId: "treeview-black"
		});
	}
	else clearInterval(interval1)	
}


/* Формирование дерева Хаффмана 2-й шаг */
TreeHaf2step = function() {
	var len = 0
	for (ch in treeForSteps) len++
	if (len > 1) {
		var newap = Minapex(treeForSteps)
		treeForSteps = treeStep(treeForSteps)
		$("#tree").html(Rendertree(treeForSteps, newap[0]+newap[1]))
		$("#black").treeview({
			control: "#treecontrol",
			persist: "cookie",
			cookieId: "treeview-black"
		});
	}
	else clearInterval(interval2)
}


/* Формирование дерева Шеннона-Фано 1-й шаг */
TreeSha1step = function() {
	if (treeshaend) {
		$("#tree_shannone").html(RenderTreeSha(treeShaBuild(frequenciesBuild($("#text").val()), treeshastep, 1)))
			$("#tree_shannone ul").treeview({
			control: "#treecontrol",
			persist: "cookie",
			cookieId: "treeview-black"
		});
	} 
	else clearInterval(interval3)
}


/* Формирование дерева Шеннона-Фано 2-й шаг */
TreeSha2step = function() {
	if (treeshaend) {
		treeshastep++
		$("#tree_shannone").html(RenderTreeSha(treeShaBuild(frequenciesBuild($("#text").val()), treeshastep)))
		$("#tree_shannone ul").treeview({
			control: "#treecontrol",
			persist: "cookie",
			cookieId: "treeview-black"
		});
	} 
	else clearInterval(interval4)
}


/* Проверка поля ввода на изменение */
function CheckTextArea() {
	if ( oldtext != $("#text").val() ) {
		Coded()
		oldtext = $("#text").val()
	}
}


$(document).ready(function(){	
	/* Инвертирование таблицы кодовых слов */
	$('input.tree_inverse:radio').change(function (){
		inverseCodewords()
	})
	
	
	/* Выбор режима построения деревва Хаффмана */
	$('input.tree_build_type').change(function (){
		ViewTreeStart()
	})
	
	/* Выбор режима построения деревва Шеннона-Фано */
	$('input.tree_build_type_shannone').change(function (){
		ViewTreeShaStart()
		treeshastep = 1
	})
	
	/* Сброс пошагового построения дерева Хаффмана */
	$('#tree_reset').click(function (){
		ViewTreeStart()
		clearInterval(interval1)
		clearInterval(interval2)
	})
	
	/* Сброс пошагового построения дерева Шеннона-Фано*/
	$('#tree_reset_shannone').click(function (){
		ViewTreeShaStart()
		clearInterval(interval3)
		clearInterval(interval4)
		treeshastep = 1
	})
	
	/* Автоматическое формирование дерева Хаффмана */
	$("#auto_haf").click(function (){
		TreeHaf1step()
		setTimeout(function() { TreeHaf2step() }, 1000)
		interval1 = setInterval(function() { TreeHaf1step() }, 2000)
		setTimeout(function() { interval2 = setInterval(function() { TreeHaf2step() }, 2000) }, 1000)
	})
	
	/* Формирование дерева Хаффмана пошагово */
	$("#next_step").toggle(function (){
		TreeHaf1step()
	}, function (){
		TreeHaf2step()
	})
	
	var treeshastep = 1
	/* Формирование дерева Шеннона-Фано пошагово */
	$("#next_step_shannone").toggle(function (){
		TreeSha1step()
	}, function (){
		TreeSha2step()
	})
	
	/* Автоматическое формирование дерева Хаффмана */
	$("#auto_sha").click(function (){
		TreeSha1step()
		setTimeout(function() { TreeSha2step() }, 1000)
		interval3 = setInterval(function() { TreeSha1step() }, 2000)
		setTimeout(function() { interval4 = setInterval(function() { TreeSha2step() }, 2000) }, 1000)
	})
	
	/* Действие при введении сообщения */
	$("#text").keyup(function (){
		Coded()
	})
	
	
	/* Проверка текстового поля каждые пол секунды и кодирование */
	oldtext = ""
	setInterval(function() { CheckTextArea() }, 500)
})