// JavaScript Document

/* 
** -----------------------------------------
** text sizer State of NH, Web Services Division
** created: 02 Nov 2010
** ----------------------------------------- 
*/

/* 
** *********************************************************
** BEGIN user-variable section
** DO NOT change code outside of this section
** *********************************************************
*/

// Specify stylesheet elements to exclude from resizing
//   these should be identical to the individual elements specified in the stylesheet
//   ie., classes should be '.classname', id's '#idname', tags, such as div 'div'
// Note: if an element in the exclude list appears anywhere in a stylesheet definition 
//       the entire defition exluded; 
//       Example, excluding tag 'div' means the following stylesheet definition 
//       would be excluded from resizing:   body, div, p {font-size: 20px;} 
//        
var arrExcludeStyleSheetElements = new Array('.searchtext', '.searchBtntext');
//var arrExcludeStyleSheetElements = new Array('.searchtext', '#searchbox');

// maximum number of change requests
var maxSize = 2;
// minimum font size change, should be less than maxSize
var minSize = 0;
// magnitude of resizing (bigger number = larger font size increases per click)
// number should be 1 through 4, decimals allowed
var stepMagnitude = 2;


/* 
** *********************************************************
** END user-variable section
** DO NOT change code outside of the above section
** *********************************************************
**/

// merge the array into a string for faster matching
var strExcludeStyleSheetElements = arrExcludeStyleSheetElements.join('|');
strExcludeStyleSheetElements = '|' + strExcludeStyleSheetElements + '|';

// global cookie name
var strCookieName = new String("SIZEPREF");

/*
** setDefault performs the initial page load sizing when called onLoad
** it requires the global variables: intDefaultSize 
*/
function setDefault(){
	// enforce size restrictions, perform updates
	var intSize = sizeLimits(intDefaultSize);
	// perform size adjustment
	AdjustSizes(intSize);
}

/*
** this function enforces the max and min steps allowed
** currently, 3 steps up are all that are allowed
** 0 will result in clearing cookie size pref and reloading page
*/
function sizeLimits(stepSize){
	// confirm sizes are numbers
	if(isNaN(minSize) || isNaN(maxSize)){
		stepSize = 0;
	}else{
		// confirm numbers are correct
		if(minSize > maxSize){
			var tmpSize = minSize;
			minSize = maxSize;
			maxSize = tmpSize;
		}
		// confirm increment is within allowed range
		if(stepSize > maxSize){ stepSize = maxSize; }
		if(stepSize < minSize){ stepSize = minSize; }
	}
	return stepSize;
}

/*
** AdjustSizes checks the stylesheets and adjusts the font sizes
**
*/
function AdjustSizes(intSize){
	// variables to hold size changes
	var newFontSize = '';
	var currentFontSize = '';
	var SelectorText = '';
	
	// variable to hold document reference
	var doc = document;

	// loop through the stylesheet list
	for (x in doc.styleSheets) {
		// IE and Chrome
		var StyleRules = doc.styleSheets[x].rules;
		if(StyleRules == null){
			//Firefox/Mozilla and Chrome (Chrome suppots both; logic excludes here by match above)
			StyleRules = doc.styleSheets[x].cssRules;
		}
		// if have rules, attempt to modify fonts
		if(StyleRules != null){
			// loop through the stylesheet rule blocks
			for ( RuleNumber = 0 ; RuleNumber < StyleRules.length; RuleNumber++ ){
				if(typeof StyleRules[RuleNumber].style != 'undefined'){
					// retrieve font size for current style block
					currentFontSize = StyleRules[RuleNumber].style.fontSize;
					// retrieve the stylesheet selector text (the elements a given style applies to)
					SelectorText = StyleRules[RuleNumber].selectorText
					// if current block has a font size and none of the elements are excluded, continue with resize
					if(currentFontSize != '' && !isExcludedElement(SelectorText)){
						// get new size
						newFontSize = getNewSize(currentFontSize,intSize);
						// set new size
						StyleRules[RuleNumber].style.fontSize = newFontSize;
					}
				}
				
			}
		}
	}
}

function ts( legacy, tsIncrement ) {
	var currentIncrement = intDefaultSize; // the global default size to use on the page
	currentIncrement += tsIncrement; // increment the size as requested, this may be + or -
	intDefaultSize = sizeLimits(currentIncrement);
	
	// if tsIncrement is 0, reset to stylesheet definitions
	if(tsIncrement == 0 || intDefaultSize == 0){
		// remove cookie and reload page
		RemoveCookie(strCookieName);
		window.location.reload();
		return;
	} // else, continue

	// confirm request results in a change; ie., if already at max, no need to change size
	if(currentIncrement == intDefaultSize){
		// now, call the function that will set the font size
		AdjustSizes(tsIncrement);
		// reset cookie to the new incremented value
		SetCookie(intDefaultSize);
	}
	return;
}


function isExcludedElement(strElementList){
	// variable to know if found a match
	var bolMatch = false;
	var strCompare = '';
	// prepare the string for comparison
	if(strElementList != ''){
		// remove whitespace
		strElementList = strElementList.replace(/\s/g,'');
		// create array based on commas in string
		arrElements = strElementList.split(',');
		// loop through the array
		for (var x = 0; x < arrElements.length; x++ ){
			// format element to match the formated exclusion list
			strCompare = '|' + arrElements[x] + '|';
			// if find a match, it is excluded
			if(strExcludeStyleSheetElements.indexOf(strCompare) >= 0){
				return true;
			}				
		}
	}
	return false;
}

// this function should never be called directly
function getNewSize(currentSize,Increment){
	// build expression to capture the units and the numbers
	// build logic to calculate where to go with it (how far max/min)
	var regUnits = /[^0-9]+$/
	var regNumber = /^[0-9]+/
	
	// now, ready to handle sizes and calculate them as needed
	var SizeUnits = regUnits.exec(currentSize);
	var SizeNumber = regNumber.exec(currentSize);

	// ensure variable is number
	var tmpSizeNumber = new Number(SizeNumber);
	if(!isNaN(tmpSizeNumber)){
	
		// confirm magnitude of step increases
		if(isNaN(stepMagnitude)){
			stepMagnitude = 1;
		}else{
			if(stepMagnitude < 1){
				stepMagnitude = 1;
			}else{
				if(stepMagnitude > 4){
					stepMagnitude = 4;
				}
			}
		}
	
		// if it is not pixels, scale it differently
		if(SizeUnits != "px"){
			// increase by number of increments * 1.25 * magnitude
			SizeNumber = Math.round(tmpSizeNumber + (1.25 * stepMagnitude * Increment));
		}else{
			// increase by 10% by increment * magnitude
			SizeNumber = Math.round((Increment * tmpSizeNumber * 0.1 * stepMagnitude) + tmpSizeNumber);
		}
		// convert back to number with units
		var getNewSize = SizeNumber.toString() + SizeUnits.toString();
		
		return getNewSize;
	}else{
		return '';
	}
}

/*---------------------------------
	cookie management
---------------------------------*/

// this function retreives the cookie font-size preference, if it is available
function GetCookie(){
	// pattern in which to find cookie
	var regExp = new RegExp(strCookieName + "=([^;]*)");
	// execute pattern against available cookies, returning what we need
	var sizePref = regExp.exec(document.cookie);
	// return the contents if present, else flag as "no cookie"
	sizePref = (sizePref) ? unescape(sizePref[1]) : "no cookie";

	// make sure we know that we're getting something valid
	if(!sizePref){
		sizePref = "no cookie";  // sizePref is undefined 
	}else{
		if(sizePref === null){
			sizePref = "no cookie";  // sizePref is null
		}
	}
	
	// attempt to convert it to a number
	sizePref = Number(sizePref);

	// make sure it converted, if not, flag as no cookie
	if(isNaN(sizePref)){
		sizePref = "no cookie";
	}
	return sizePref;
}

// this function sets the cookie for the user font size preference
function SetCookie(intSize){
	if(arguments.length < 1){
		return false;
	}
	// build cookie, we are not using expiration, domain, or secure for this 
	var strCookieString = escape(strCookieName) + "=" + escape(intSize) + "; path=/";

	// set the cookie
	document.cookie = strCookieString;
	return true;
}

// helper function for clearing the cookie
function RemoveCookie(strCookieName){
	document.cookie = strCookieName += "=; path=/";
}

// this implements the default behavior for the specified event
function addEvent(obj, evType, fn){ 
	if (obj.addEventListener){ 
		obj.addEventListener(evType, fn, false); 
		return true; 
	} else if (obj.attachEvent){ 
		var r = obj.attachEvent("on"+evType, fn); 
		return true; 
	} else { 
		return false; 
	} 
}


// default sizes
// default of 0 indicates "no change from the original stylesheet"
var intDefaultSize = 0;
var intSize = intDefaultSize;

// get stored size preference; sets to "no cookie" if it is not available
var startSz = GetCookie();

if(!isNaN(startSz)){
	//Specify the default size (position in the 0-based array of arrSizes+1)
	intDefaultSize = startSz;
	addEvent(window, 'load', setDefault);
}
