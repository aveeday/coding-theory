/*
 * coding-theory :: block
 *
 * Copyright (c) 2012 Konstantyn Nesterenko
 * Email: kostya.nesterenko@gmail.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

/* Параметры кода */
function Code() {
	this.notation = $('#codeselect').val().split(':') // 7:4:3 => [7,4,3]
	this.n = Number(this.notation[0])  // Количество кодированных разрядов
	this.m = Number(this.notation[1])  // Количество информационных разрядов
	this.d = Number(this.notation[2])  // Межкодовое расстояние
	this.i = Math.ceil((this.d-1)/2)   // Количество исправляемых ошибок
	this.k = this.n-this.m             // Избыточность
	this.R = (this.m/this.n).toFixed(3) // Скорость кода
	/* Полиномы */
	if (this.k == 3) { this.polynom = [1,0,1,1] }
	if (this.k == 4) { this.polynom = [1,0,0,1,1] }
	if (this.k == 5) { this.polynom = [1,0,0,1,0,1] }
	if (this.k == 6) { this.polynom = [1,0,0,0,0,1,1] }
	if (this.k == 11) { this.polynom = [1,1,0,0,0,1,1,1,0,1,0,1] }
	this.p = "" // Полином в виде многочлена
	for (i=0; i<this.k+1; i++) {
		a = this.k-i
		if (this.polynom[i] == 1) {
			if (i<this.k-1) { this.p += 'X<sup>'+a+'</sup> + ' }
			if (i==this.k-1) { this.p += 'X + ' }
			if (i==this.k) { this.p += '1' }
		}
	}
	this.numwords = Math.pow(2,this.m) // Количество кодовых слов
}

/* Порождающая матрица */
/*function GenMatr() {
	for (i=0; i<newcode.m; i++) {
		this[i] = new Array(newcode.n)
		for (j=0; j<newcode.n; j++) this[i][j]=0
	}
	
	for (i=0; i<newcode.m; i++) {
		for (j=0; j<newcode.n; j++) {
			if (newcode.polynom[j]) {
				this[i][j+i]=1
			}
		}
	}
	// Приведение к систематическому виду
	for (i=0; i<newcode.m; i++) {
		for (j=0; j<newcode.m; j++) {
			if (i!=j && this[i][j]==1) {
				for (k=0; k<newcode.n; k++) {
					this[i][k] ^= this[j][k]
				}
			}
		}
	}
}*/

function GenMatr() {
	for (i=0; i<newcode.m; i++) {
		this[i] = new Array(newcode.n)
		for (j=0; j<newcode.n; j++) {
			if (!this[i][j]) this[i][j]=0
			if (newcode.polynom[j]) this[i][j+i]=1

		}
	}
	// Приведение к систематическому виду
	for (i=0; i<newcode.m; i++) {
		for (j=0; j<newcode.m; j++) {
			if (i!=j && this[i][j]==1) {
				for (k=0; k<newcode.n; k++) {
					this[i][k] ^= this[j][k]
				}
			}
		}
	}
}

/* Проверочная матрица */
function CheckMatr() {
	for (i=0; i<newcode.n; i++) {
		this[i] = new Array(newcode.k)
		for (j=0; j<newcode.k; j++) this[i][j]=0
	}
	for (i=0; i<newcode.m; i++) for (j=0; j<newcode.k; j++) {
		this[i][j]=newgenmatr[i][j+newcode.m]
		if (i==j) this[i+newcode.m][j]=1
	}
}

/* Представление */
view = {}
view.codeblock = function(dest, len, name, desc) {
	if (!name) { name = "" }
	$(dest).empty();
	t=$('<table class="sep"></table>')
	t.append('<caption>'+name+'</caption>')
	r=$('<tr></tr>')
	for (i=0; i<len; i++) {
		if (dest == '#encoded' || dest == '#received' || dest == '#inf') {
			if (i < newcode.m) r.append('<td class="ch ch_inf"></td>')
			else r.append('<td class="ch ch_check"></td>')
		}
		else r.append('<td class="ch"></td>')
	}
	t.append(r)
	r=$('<tr></tr>')
	for (i=0; i<len; i++) {
		r.append('<td class="ch ch_desc">'+desc+'<sub>'+i+'</sub></td>')
	}
	t.append(r)
	$(dest).append(t)
}
view.matr = function(dest, matr, a, b, name) {
	var t,r,c,i,j
	$(dest).empty()
	t=$('<table class="matr"></table>')
	t.append('<caption>'+name+'</caption>')
	for (i=0; i<a; i++) {
		r=$('<tr></tr>')
		for (j=0; j<b; j++) {
			if (matr[i][j] == 0) {
				c=$('<td>'+matr[i][j]+'</td>')
				r.append(c)
			}
			if (matr[i][j] == 1) {
				c=$('<td class="matr1">'+matr[i][j]+'</td>')
				r.append(c)
			}
		}
		t.append(r)
	}
	$(dest).append(t)
}
view.tabl = function(dest, arr, name, numbering, first, last) {
	var t,h,b,r,c,color
	if (!first) var first = 1
	if (!last) var last = 16
	$(dest).empty()
	t=$('<table class="table1"></table>')
	h='<thead><tr><td colspan="'+arr[0].length+1+'">'+name+'</td></tr></thead>'
	t.append(h)
	b=$('<tbody></tbody>')
	if (numbering > 1) {
		r1=$('<tr></tr>')
		r1.append('<td class="number"></td>')
		for (var k=0; k<arr[0].length; k++) {
			r1.append('<td class="number">'+(k+Number(first))+'</td>')
		}
		b.append(r1)
	}
	for (var i=0; i<arr.length; i++) {
		r=$('<tr></tr>')
		if (numbering > 0) r.append('<td class="number">'+(i+Number(first))+'</td>')
		var weight = 0
		for (var j=0; j<arr[0].length; j++) {
			if (dest == "#hamming_distance") {
				c='<td style="background:rgba(133,212,120,'+(arr[i][j]/10)+')"\
					 class="infcell">\
					 '+arr[i][j]+'\
					 </td>'
			}
			else c='<td class="infcell">'+arr[i][j]+'</td>'
			if (arr[i][j]) weight++
			r.append(c)
		}
		if (dest == "#codewords") {
			c='<td class="number">'+weight+'</td>'
			r.append(c)
		}
		b.append(r)
	}
	t.append(b)
	$(dest).append(t)
}

/* Сброс */
function Reset(){
	$("table.sep tr:even td.ch").text("")
	$("#steps_coding").text("")
	$("#steps_coding").css( "display", "none")
	$("#steps_decoding").text("")
	$("#steps_decoding").css( "display", "none")
	$("#received .ch").removeClass('ch_err')
	$('select.error').val('noerr')
	$('select.error').attr('disabled', 'disabled')
	$("#received .ch, #syndromelist tr").removeClass('ch_err')
	$('#steps').hide()
	$('#steps2').hide()
	$('#codewords_buttons').hide()
	$('#hamming_distance_buttons').hide()
	$('#gen-matr').hide()
	$('#check-matr').hide()
	$('#syndromelist').hide()
	$('#codewords').text("")
	$('#hamming_distance').text("")
}

/* Кодирование */
function Coded(inputarr, mode) {
	var codedarr = []
	var steps_coding = "";
	for (i=0; i<newcode.n; i++) {
		var t=0
		var step1_coding = "";
		var step2_coding = "";
		if (i==0) steps_coding += "c<sub>"+i+"</sub> = "
		else steps_coding += "<br />c<sub>"+i+"</sub> = "
		for (j=0; j<newcode.m; j++) {
			t ^= inputarr[j] * newgenmatr[j][i]
			if (j<newcode.m-1) {
				if (newgenmatr[j][i] == 0) { 
					step1_coding += inputarr[j]+'&times;'+newgenmatr[j][i]+' &#8853; '
				}
				else {
					step1_coding += '<span class="inf">\
										'+inputarr[j]+'\
									</span>&times;\
									<span class="matr1">\
										'+newgenmatr[j][i]+'\
									</span> &#8853; '
				}
				step2_coding += inputarr[j]*newgenmatr[j][i]+' &#8853; '
			}
			else {
				if (newgenmatr[j][i] == 0) {
					step1_coding += inputarr[j]+'&times;'+newgenmatr[j][i]
				}
				else {
					step1_coding += '<span class="inf">\
										'+inputarr[j]+'\
									</span>&times;\
									<span class="matr1">\
										'+newgenmatr[j][i]+'\
									</span>'
				}
				step2_coding += inputarr[j]*newgenmatr[j][i]
			}
		}
		codedarr[i] = t;
		steps_coding += step1_coding
		steps_coding += " = "
		steps_coding += step2_coding
		steps_coding += " = "+t
	}
	if (mode == "arr") return codedarr
	if (mode == "steps") return steps_coding
}

/* Декодирование */
function Decode(codedarr) {
	/* Нахождение синдрома */
	$('#steps2').css( "display", "inline-block");
	$("#steps_decoding").text("")
	var syndromearr = []
	var steps_decoding = "";
	for (i=0; i<newcode.k; i++) {
		var t=0
		var step1_decoding = "";
		var step2_decoding = "";
		if (i==0) steps_decoding += "s<sub>"+i+"</sub> = "
		else steps_decoding += "<br />s<sub>"+i+"</sub> = "
		for (j=0; j<newcode.n; j++) {
			t ^= codedarr[j] * newcheckmatr[j][i]
			if (j<newcode.n-1) {
				if (newcheckmatr[j][i] == 0) {
					step1_decoding += codedarr[j]+'&times;'+newcheckmatr[j][i]+' &#8853; '
				}
				if (newcheckmatr[j][i] == 1) {
					step1_decoding += '<span class="inf">\
										'+codedarr[j]+'\
									</span>&times;\
									<span class="matr1">\
										'+newcheckmatr[j][i]+'\
									</span> &#8853; '
				}
				step2_decoding += codedarr[j]*newcheckmatr[j][i]+' &#8853; '
			}
			else {
				if (newcheckmatr[j][i] == 0) {
					step1_decoding += codedarr[j]+'&times;'+newcheckmatr[j][i]
				}
				if (newcheckmatr[j][i] == 1) {
					step1_decoding += '<span class="inf">\
										'+codedarr[j]+'\
									</span>&times;\
									<span class="matr1">\
										'+newcheckmatr[j][i]+'\
									</span>'
				}
				step2_decoding += codedarr[j]*newcheckmatr[j][i]
			}
		}
		syndromearr[i] = t;
		steps_decoding += step1_decoding
		steps_decoding += " = "
		steps_decoding += step2_decoding
		steps_decoding += " = "+t
	}
	$("#steps_decoding").append(steps_decoding)
	
	/* Вывод синдрома */
	for (i=0;i<newcode.k;i++) $("#syndrome .ch").eq(i).text(syndromearr[i])
	
	/* Исправление ошибки */
	var decoded = []
	for (i=0; i<newcode.m; i++) decoded[i] = codedarr [i]
	
	for (i=0; i<newcode.n; i++) {
		var t = 0;
		for (j=0; j<newcode.k; j++) {
			if (newcheckmatr[i][j] == syndromearr[j]) t++
			if (t == newcode.k) {
				if (i<newcode.m) decoded[i] ^=1
			}
		}
	}
	/* Вывод декодированной информации */
	for (i=0;i<newcode.m;i++) $("#decoded .ch").eq(i).text(decoded[i])
}

/* Построение таблицы кодовых слов */
function Сodewords(first_word, last_word) {
	var words = [] // Массив кодируемых слов
	var codewords = [] // Массив кодовых слов
	if (!first_word) {
		var first_word = 1
	}
	first_word--
	if (!last_word) {
		if (newcode.numwords < 16) var last_word = newcode.numwords
		else var last_word = 16
	}

	// words = [[0,0,0],   |   codewords = [[0,0,0,0,0,0],
			 // [0,0,1],   |                [0,0,1,0,1,1],
			 // [0,1,0],   |                [0,1,0,1,1,0],
			 // [0,1,1],   |                [0,1,1,1,0,1],
			 // [1,0,0],   |                [1,0,0,1,1,1],
			 // [1,0,1],   |                [1,0,1,1,0,0],
			 // [1,1,0],   |                [1,1,0,0,0,1],
			 // [1,1,1]]   |                [1,1,1,0,1,0]]
	
	// Формируем words
	for (var i=0; i<(last_word-first_word); i++) {
		words[i] = new Array(newcode.m-1)
		for (var j=0; j<newcode.m; j++) words[i][j] = 0
	}
	for (var i=0; i<(last_word-first_word); i++) {
		for (k=0; k<(i+first_word).toString(2).length; k++) {
			words[i][newcode.m-k-1] = (i+first_word).toString(2)[(i+first_word).toString(2).length-k-1]
		}
	}
	// Формируем codewords
	for (var i=0; i<(last_word-first_word); i++) codewords[i] = Coded(words[i], "arr")
	// Дописываем вес слова
	/*for (var i=0; i<newcode.numwords; i++) {
		var p = 0
		for (var j=0; j<newcode.n; j++) {
			p += codewords[i][j]
		}
		codewords[i][newcode.n] = p
	}*/
	return codewords
}

/* Построение таблицы межкодовых расстояний */
function Hamming_distance(first_word, last_word) {
	codewords = Сodewords(first_word, last_word)
	if (!first_word) {
		var first_word = 1
	}
	first_word--
	if (!last_word) {
		if (newcode.numwords < 16) var last_word = newcode.numwords
		else var last_word = 16
	}
	var hamcalc = function(a,b) {
		var d = 0 // Межкодовое расстояние
		var len = a.length
		//for (var i=0; i<len; i++) if (a[i]^b[i] == 1) d++
		for (var i=0; i<len; i++) d += a[i]^b[i]
		return d
	}
	var hamming_distance = [] // Массив межкодовых расстояний
	for (var i=0; i<(last_word-first_word); i++) {
		hamming_distance[i] = new Array(last_word-first_word)
		for (var j=0; j<(last_word-first_word); j++) hamming_distance[i][j] = hamcalc(codewords[i], codewords[j])
	}
	return hamming_distance
}

$(document).ready(function(){	
	/* Построение таблицы кодовых слов в заданном диапазоне */
	$('#codewords_build').click(function (){
		var first = $('#codewords_first').val()
		var last = $('#codewords_last').val()
		codewords = Сodewords(first, last)
		view.tabl("#codewords", codewords, "", 1, first, last)

	})
	
	/* Построение таблицы межкодовых расстояний в заданном диапазоне */
	$('#hamming_distance_build').click(function (){
		var first = $('#hamming_distance_first').val()
		var last = $('#hamming_distance_last').val()
		hamming_distance = Hamming_distance(first, last)
		view.tabl("#hamming_distance", hamming_distance, "", 2, first, last)

	})
	
	/* Сброс введенных данных */
	$('#reset').click(function (){
		Reset()
	})
	
	/* Канал */
	$('#link').change(function (){
		var codedarr = []
		var err = []
		$("#received .ch, #syndromelist tr").removeClass('ch_err')
		
		// Считывание кодированного блока
		for (i=0;i<newcode.n;i++) codedarr[i] = $("#encoded .ch").eq(i).text()
			
		for (var k=0; k<newcode.i; k++) {
			err[k] = $('select.error').eq(k).val()
			
			/* Передача кодированного блока с канала на декодер и вывод на экран */
			if (err[k] != 'noerr') {
				var h = err[k]
				codedarr[h] ^= 1
				for (i=0;i<newcode.n;i++) {
					if (i == h) $("#received .ch").eq(i).addClass('ch_err')
					$("#received .ch").eq(i).text(codedarr[i])
				}
				errr = Number($('select.error').eq(k).val())+1
				$('#syndromelist tr').eq(errr).addClass('ch_err')
			}
		}
		Decode(codedarr)
	})
	
	/* Кодирование по действиям */
	$("#steps_coding").hide();
	$("#steps").click(function(){
        $("#steps_coding").slideToggle("slow")
    });
	
	/* Декодирование по действиям */
	$("#steps_decoding").hide();
	$("#steps2").click(function(){
        $("#steps_decoding").slideToggle("slow")
    });
	
	/* Таблица кодовых слов */
	$("#codewords_buttons").hide();
	$("#show_codewords").click(function(){
		
		// Выыод таблицы кодовых слов
		if (!$("#codewords table").length) {
			codewords = Сodewords()
			view.tabl("#codewords", codewords, "", "1")
		}
		
		$("#codewords_buttons").slideToggle("slow")
    });
	
	/* Таблица межкодовых расстояний */
	$("#hamming_distance_buttons").hide();
	$("#show_hamming_distance").click(function(){
		
		// Выыод таблицы межкодовых расстояний
		if (!$("#hamming_distance table").length) {
			hamming_distance = Hamming_distance()
			view.tabl("#hamming_distance", hamming_distance, "", "2")
		}
		
        $("#hamming_distance_buttons").slideToggle("slow")
    });
	
	/* Порождающая матрица */
	$("#show_gen_matr").click(function(){
        $("#gen-matr").slideToggle("slow")
    });
	
	/* Проверочная матрица */
	$("#show_check_matr").click(function(){
        $("#check-matr").slideToggle("slow")
    });
	
	/* Проверочная матрица */
	$("#show_syndromelist").click(function(){
        $("#syndromelist").slideToggle("slow")
    });
	
	/* Выбор кода и генерация всего необходимого для него */
	$('#codeselect').change(function (){
		Reset()
		newcode = new Code()
		newgenmatr = new GenMatr()
		newcheckmatr = new CheckMatr()
		$('#codetype').css( "display", "block");
		
		/* Вывод таблицы с характеристиками кода */
		$('#specifications').empty()
		t=$('<table></table>')
		t.append('<caption>Характеристики</caption>\
				<tr>\
					<th>Полином</th>\
					<th>n</th>\
					<th>m</th>\
					<th>d</th>\
					<th>i</th>\
					<th>k</th>\
					<th>R</th>\
				</tr>\
				<tr>\
					<td>'+newcode.p+'</td>\
					<td>'+newcode.n+'</td>\
					<td>'+newcode.m+'</td>\
					<td>'+newcode.d+'</td>\
					<td>'+newcode.i+'</td>\
					<td>'+newcode.k+'</td>\
					<td>'+newcode.R+'</td>\
				</tr>')
		$('#specifications').append(t);
		
		/* Информационный блок */
		view.codeblock('#inf', newcode.m, "Информационный блок", "a")
		
		/* Кодированный блок */
		view.codeblock('#encoded', newcode.n, "Кодированный блок", "c")
		
		/* Модель канала */
		$('#link').empty();
		for (var k=0; k<newcode.i; k++) {
			t=$('<select class="error" disabled></select>');
			t.append('<option value="noerr">Нет ошибки</option>');
			for (i=0; i<newcode.n; i++) { 
				var sub = "" // Unicode subscripts
				for (var j=0; j<i.toString().length; j++) sub += "&#"+(8320+parseInt(i.toString()[j]))+";"
				t.append('<option value="'+i+'">Ошибка в с'+sub+'</span></option>')
			}
			$('#link').append(t);
		}
		/* Принятый блок */
		view.codeblock('#received', newcode.n, "Принятый блок", "c")
		
		/* Синдром */
		view.codeblock('#syndrome', newcode.k, "Синдром", "s")
		
		/* Декодированный блок */
		view.codeblock('#decoded', newcode.m, "Декодированный блок", "e")
		
		/* Вывод порождающей матрицы */
		view.matr('#gen-matr', newgenmatr, newcode.m, newcode.n, '')
		
		/* Вывод проверочной матрицы */
		view.matr('#check-matr', newcheckmatr, newcode.n, newcode.k, '')
		
		/* Построение таблицы синдромов */
		t=$('<table></table>');
		for (i=0; i<newcode.n; i++) {
			if (i==0) {
				r=$('<tr></tr>');
				for (j=0; j<newcode.k+1; j++) {
					if (j==0){
						c=$('<td>Ошибка</td>');
						r.append(c)
					}
					else {
						c=$('<td>s<sub>'+(j-1)+'</sub></td>');
						r.append(c)
					}
				}
				t.append(r)
			}
			r=$('<tr></tr>');
			r.append('<td>с<sub>'+i+'</sub></td>')
			for (j=0; j<newcode.k; j++) {
				c=$('<td>'+newcheckmatr[i][j]+'</td>');
				r.append(c)
			}
			t.append(r)
		}
		$("#syndromelist").html(t)
		
	})
	
	/* Ввод данных */
	$('#input0, #input1').click(function (){
		var ch = Number($(this).val())
		if ($(".ch").eq(0).text() == "") inputarr = []
		for (i=0; i<newcode.m; i++) if ($(".ch").eq(i).text() == "") {
			$("#inf .ch").eq(i).append(ch);
			inputarr[i] = ch;
			break;
		}
		
		/* После введения последнего символа */
		if (($("#inf td.ch_inf:last").text() != "") && ($("#encoded td.ch_inf:last").text() == "")) {
			/* Передача на кодер */
			steps_coding = Coded(inputarr, "steps")
			codedarr = Coded(inputarr, "arr")
			$('#steps').css( "display", "inline-block");
			
			/* Вывод по действиям */
			$("#steps_coding").append(steps_coding)
			
			/* Вывод на экран */
			for (i=0;i<newcode.n;i++) $("#encoded .ch").eq(i).append(codedarr[i])
			for (i=0;i<newcode.n;i++) $("#received .ch").eq(i).append(codedarr[i])
			
			/* На декодер */
			Decode(codedarr)
			
			/* Разрешаем манипулировать каналом */
			$('select.error').removeAttr('disabled')
		}
	})
})