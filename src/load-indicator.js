let element = document.getElementById('load-indicator');
let percent = parseFloat(element.style.width);

let playId;

function setPercent(val) {
	if (typeof val === 'string') {
		percent = parseFloat(element.style.width);
		if (val.endsWith('%')) {
			element.style.width = val;
		} else {
			element.style.width = `${val}%`;
		}
	} else {
		percent = val;
		element.style.width = `${val}%`;
	}
	return percent;
}

function animate(from, to, timePerStep) {
	setPercent(from);
	playId = setTimeout(function fn() {
		if (percent >= to) {
			return;
		}
		setPercent(percent+=5);
		playId = setTimeout(fn, timePerStep);
	}, timePerStep);
}

function clear() {
	clearTimeout(playId);
	playId = undefined;
	element.style.width = '0%';
	percent = 0;
}

module.exports = {
	setPercent,
	animate,
	element,
	clear
};
