/*
 * coding-theory :: convolutional
 *
 * Copyright (c) 2012 Konstantyn Nesterenko
 * Email: kostya.nesterenko@gmail.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */


CodeBlock = function(text, mode, dist) {
	var t = $('<table></table>')
	var r = $('<tr></tr>')
	var a = text.length
	for (var i=0; i<dist; i++) {
		r.append('<td class="codech"></td>')
	}
	for (var i=0; i<a; i++) {
		var d = ""
		if (mode == 'check') {
			d += '<td class="codech"></td>'
			d += '<td class="codech checkch">'+text[i]+'</td>'
		}
		else if (mode == 'inf') d += '<td class="codech infch">'+text[i]+'</td>'
		else if (mode == 'coded') {
			if (i%2 == 0) {
				d += '<td class="codech infch">'+text[i]+'</td>'
			}
			else if (text[i] == 'r') d += '<td class="codech"></td>'
			else {
				d += '<td class="codech checkch">'+text[i]+'</td>'
			}
		}
		else if (mode == 'channel') {
			if (text[i] == '-') d += '<td class="codech channelch">'+text[i]+'</td>'
			else d += '<td class="codech"></td>'
		}
		else d += '<td class="codech">'+text[i]+'</td>'
		if (mode == 'inf' && i!=(a-1)) d += '<td class="codech"></td>'
		if (mode == 'check' && i==(a-1)) d += '<td class="codech"></td>'
		r.append(d)
	}
	for (var i=0; i<dist; i++) {
		r.append('<td class="codech"></td>')
	}
	t.append(r)
	return t
}


Inverse = function(a) {
	if (a == '1') var inv = "0"
	else var inv = "1"
	return inv
}

Send = function(code, dist) {
	// Выводим принятый блок
	var recived = ""
	var codelen = code.length
	for (var i=0; i<codelen; i++) {
		if ($('#channel td').eq(i).text() != 'X') {
			recived += code[i]
		}
		else {
			recived += Inverse(code[i])
		}
	}
	$('#recived').html(CodeBlock(recived, 'coded'))
	
	
	// Показываем ошибки
	for (var i=0; i<codelen; i++) {
		if (recived[i] != code[i]) $('#recived td').eq(i).addClass('err')
	}
	
	
	// Выводим проверочный блок (декодер)
	var check2 = ""
	var reslen = recived.length
	for (var i=0; i<reslen-1-2*dist; i+=2) {
		check2 += recived[i]^recived[i+2+2*dist]
	}
	$('#check2').html(CodeBlock(check2, 'check', dist))
	
	
	// Показываем ошибки
	var check2len = check2.length
	for (var i=0; i<check2len; i++) {
		if (check2[i] != recived[2*i+1+dist]) $('#check2 td').eq(2*i+1+dist).addClass('err')
	}
	
	
	// Выводим декодированный блок
	var decoded = []
	for (var i=0; i<reslen; i+=2) {
		var d = recived[i]
		decoded.push(d)
	}
	var buferr = [] // Буфер для номеров разрядов которые участвовали в декодировании
	for (var i=0; i<check2len-dist-1; i++) {
		if (check2[i] != recived[2*i+1+dist] && check2[i+1+dist] != recived[2*(i+1+dist)+1+dist]) {
			var checkbuf = 0
			for (k in buferr) {
				if (i == buferr[k]) checkbuf++ 
			}
			if (checkbuf == 0) {
				decoded[i+1+dist] = Inverse(recived[2*(i+1+dist)])
				buferr.push(i+1+dist)
			}
		}
	}
	$('#decoded').html(CodeBlock(decoded, 'inf'))
	
	
	// Показываем ошибки
	var decodelen = decoded.length
	var inf = $('#inf td').text()
	for (var i=0; i<decodelen; i++) {
		if (decoded[i] != inf[i]) {
			$('#decoded td').eq(2*i).addClass('err')
			var statuserr = 1
		}
	}
	
	/*if (statuserr == 1) {
		$('#status').html('<img height="100px" src="img/err.png" />')
	}
	else $('#status').html('<img height="100px" src="img/noerr.png" />')*/
	if (statuserr == 1) {
		$('#status').html('Декодировано неверно')
	}
	else $('#status').html('Декодировано верно')
}


// Фильтрует текст и возвращает только 0 и 1
FilterBul = function(text) {
	var f = ""
	var len = text.length
	for (var i=0; i<len; i++) {
		if (text[i] == "0" || text[i] == "1") f += text[i]
	}
	return f
}


// Находит проверочный блок
Check = function(input, dist) {
	var check = ""
	var l = input.length
	for (var i=0; i<l-1-dist; i++) {
		check += input[i]^input[i+1+dist]
	}
	return check
}


// Кодирует
Coded = function(input, dist) {
	
	var l = input.length
	
	// Выводим информационный блок
	$('#inf').html(CodeBlock(input, 'inf'))
	
	
	// Находим проверочнй блок (кодер)
	var check = Check(input, dist)

	// Выводим проверочный блок (кодер)
	$('#check').html(CodeBlock(check, 'check', dist))
	
	
	// Находим кодированный блок
	var code = ""
	for (var i=0; i<(dist/2); i++) {
		code += input[i]
		code += 'r'
	}
	for (var i=0; i<l-dist; i++) {
		code += input[i+dist/2] 
		if (typeof(check[i]) != 'undefined') code += check[i]
	}
	for (var i=0; i<(dist/2); i++) {
		code += 'r'
		code += input[i+l-dist/2]
	}
	
	
	// Выводим кодированный блок
	$('#code').html(CodeBlock(code, 'coded'))
	
	
	// Выводим канал
	var channel = []
	var codelen = code.length
	for (var i=0; i<codelen; i++) {
		channel.push('-')
	}
	for (var i=0; i<dist; i++) {
		if (i%2 != 0) {
			channel[i] = 'n'
			channel[codelen-i-1] = 'n'
		}
	}
	$('#channel').html(CodeBlock(channel, 'channel'))
	
	$('#channel td').click(function (){
		if ($(this).text() == '-') {
			$(this).text('X')
			$(this).addClass('err')
		}
		else {
			$(this).text('-')
			$(this).removeClass('err')
		}
		Send(code, dist)
	})
	
	
	// Отправляем кодированный блок
	Send(code, dist)
}


$(document).ready(function(){
	$('#stext').keyup(function (){
		// Получаем введенное сообщение
		var input = FilterBul($('#stext').val())
		var l = input.length
		if (l > 1) {
			$('#main').show()
			
			// Выводим select расстояний между проверяемыми символами
			if (l>3) {
				var dist = $('<select id="seldist"></select>')
				var distnum = Math.floor(l/2)
				for (var i=0; i<distnum; i++) {
					var disti = 2*i
					dist.append('<option value="'+disti+'">'+disti+'</option>')
				}
				$('#dist').html(' Сдвиг: ')
				$('#dist').append(dist)
			}
			else $('#dist').html('')
			
			// Кодируем
 			Coded(input, 0)
			
			$('#seldist').change(function () {
				var dist = Number($('#seldist option:selected').val())
				
				// Кодируем
				Coded(input, dist)
			})
		}
		else {
			$('#main').hide()
			$('#dist').html('')
		}
	})
})