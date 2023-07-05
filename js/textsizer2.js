// JavaScript Document

const max = 6
const min = 0

var size = 0

const adjustFontSize = (num) => {
	if((size < max && num == 1) || (size > min && num == -1) || pageLoad){
		var allElements = document.body.getElementsByTagName('*');

		for (var i = 0; i < allElements.length; i++) {
		  var element = allElements[i];
		  var currentFontSize = window.getComputedStyle(element).fontSize;
		  var currentFontSizeValue = parseFloat(currentFontSize);
		  var newFontSize = currentFontSizeValue + num;
		  element.style.fontSize = `${newFontSize}px`;
		}
		size += num
	}
}