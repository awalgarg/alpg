const createPlay = require('./create-play.js');

function runner (algo, render, initialState, clone) {
	const dom = {
		root: document.createElement('div'),
		controls: {
			root: document.createElement('div')
		}
	};

	const play = createPlay(algo, render, dom.root, initialState, clone);
	
	['run', 'previous', 'rewind', 'pause', 'play', 'next'].forEach(function (control) {
		const el = dom.controls[control] = document.createElement('button');
		el.textContent = control;
		el.addEventListener('click', function () {
			play[control]();
		});
		dom.controls.root.appendChild(el);
	});

	dom.root.appendChild(dom.controls.root);

	document.body.appendChild(dom.root);

	return play;
}

module.exports = runner;
