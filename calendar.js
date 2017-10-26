/*
 Continuous Calendar (http://madebyevan.com/calendar/)
 License: MIT License (see below)

 Copyright (c) 2010 Evan Wallace

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

var todayDate;
var firstDate;
var lastDate;
var calendarTableElement;
//var itemPaddingBottom = (navigator.userAgent.indexOf('Firefox') != -1) ? 2 : 0;
var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

function idForDate(date)
{
	return date.getMonth() + '_' + date.getDate() + '_' + date.getFullYear();
}

function generateDay(day, date)
{
	var isShaded = (date.getMonth() % 2);
	var isToday = (date.getDate() == todayDate.getDate() && date.getMonth() == todayDate.getMonth() && date.getFullYear() == todayDate.getFullYear());

	if(isShaded) day.className += ' shaded';
	if(isToday) day.className += ' today';

	day.id = idForDate(date);
	day.innerHTML = '<span>' + date.getDate() + '</span>'; // generate calendar number

}

function prependWeek()
{
	var week = calendarTableElement.insertRow(0);
	var monthName = '';

	// move firstDate to the beginning of the previous week assuming it is already at the beginning of a week
	do
	{
		firstDate.setDate(firstDate.getDate() - 1);
		if(firstDate.getDate() == 1) monthName = months[firstDate.getMonth()] + '<br />' + firstDate.getFullYear();

		var day = week.insertCell(0);
		
		generateDay(day, firstDate);
	} while(firstDate.getDay() != 0);

/*	var extra = week.insertCell(-1);
	extra.className = 'extra';
	extra.innerHTML = monthName;*/
}

function appendWeek()
{
	var week = calendarTableElement.insertRow(-1);
	var monthName = '';

	// move lastDate to the end of the next week assuming it is already at the end of a week
	do
	{
		lastDate.setDate(lastDate.getDate() + 1);
		if(lastDate.getDate() == 1) monthName = months[lastDate.getMonth()] + '<br />' + lastDate.getFullYear();

		var day = week.insertCell(-1);
		generateDay(day, lastDate);
	} while(lastDate.getDay() != 6)

/*	var extra = week.insertCell(-1);
	extra.className = 'extra';
	extra.innerHTML = monthName;*/
}

function scrollPositionForElement(element)
{
	// find the y position by working up the DOM tree
	var clientHeight = element.clientHeight; // equals 123
	
	var y = element.offsetTop;
	while(element.offsetParent && element.offsetParent != document.body)
	{
		element = element.offsetParent;
		y += element.offsetTop;
	}

	// center the element in the window
	return y - (window.innerHeight - clientHeight) / 2;
}

function scrollToToday()
{
	window.scrollTo(0, scrollPositionForElement(document.getElementById(idForDate(todayDate))));
}

function documentScrollTop()
{
	var scrollTop = document.body.scrollTop;
	if(document.documentElement) scrollTop = Math.max(scrollTop, document.documentElement.scrollTop);
	
	return scrollTop;
}

function documentScrollHeight()
{
	var scrollHeight = document.body.scrollHeight; // 600
	if(document.documentElement) scrollHeight = Math.max(scrollHeight, document.documentElement.scrollHeight);
	
	return scrollHeight;
}

// TODO: when scrolling down, safari sometimes scrolls down by the exact height of content added
function poll()
{
	// add more weeks so you can always keep scrolling
	if(documentScrollTop() < 200)
	{
		var oldScrollHeight = documentScrollHeight();
		for(var i = 0; i < 8; i++) prependWeek();
		window.scrollBy(0, documentScrollHeight() - oldScrollHeight);
	}
	else if(documentScrollTop() > documentScrollHeight() - window.innerHeight - 200)
	{
		for(var i = 0; i < 8; i++) appendWeek();
	}

	// update today when the date changes
	var newTodayDate = new Date;
	if(newTodayDate.getDate() != todayDate.getDate() || newTodayDate.getMonth() != todayDate.getMonth() || newTodayDate.getFullYear() != todayDate.getFullYear())
	{

		var todayElement = document.getElementById(idForDate(todayDate));
		if(todayElement) todayElement.className = todayElement.className.replace('today', '');

		todayDate = newTodayDate;

		todayElement = document.getElementById(idForDate(todayDate));
		if(todayElement) todayElement.className += ' today';
	}
}

function loadCalendarAroundDate(seedDate)
{
	calendarTableElement.innerHTML = '';
	firstDate = new Date(seedDate);

	// move firstDate to the beginning of the week
	while(firstDate.getDay() != 0) firstDate.setDate(firstDate.getDate() - 1);
	
	console.log("firstDate.getDay() " + firstDate.getDay());
	
	// set lastDate to the day before firstDate
	lastDate = new Date(firstDate);
	lastDate.setDate(firstDate.getDate() - 1);

	// generate the current week (which is like appending to the current zero-length week)
	appendWeek();

	// fill up the entire window with weeks
	while(documentScrollHeight() <= window.innerHeight)
	{
		console.log("window.innerHeight " + window.innerHeight); // 655
		console.log("documentScrollHeight() " + documentScrollHeight()); // 655
		
		prependWeek();
		appendWeek();
	}

	// need to let safari recalculate heights before we start scrolling
	setTimeout('scrollToToday()', 50);
}

window.onload = function()
{
	calendarTableElement = document.getElementById('calendar');
	todayDate = new Date;

	loadCalendarAroundDate(todayDate);
	
	// sets interval of poll function
	setInterval('poll()', 100);
}
