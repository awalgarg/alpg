const loadIndicator = require('./load-indicator.js');
const Logger = require('./dom-logger.js');

function compileAlgoFromSource(moduleSource, css) {
	moduleSource = `"use strict";\n${moduleSource}\n//# sourceURL=compiled-algo-${Date()}`;
	let module = {exports: {}};

	const logger = Logger('algo', document.getElementById('logs'));
	Function('module', 'exports', 'logger',  moduleSource)(module, module.exports, logger);
	// we assume that source is valid ES code
	// if it is not, caller must catch the error and deal with it
	const algo = {
		algoName: module.exports.algoName,
		algo: module.exports.algo,
		render: module.exports.render,
		initialState: module.exports.initialState,
		clone: module.exports.clone,
		css
	};
	return algo;
}

const compilerLogger = Logger('compiler', document.getElementById('logs'));
function compileAlgoFromEditor(algoEditor, cssEditor) {
	const moduleSource = algoEditor.getValue();
	const css = cssEditor.getValue();
	try {
		return compileAlgoFromSource(moduleSource, css);
	} catch (err) {
		compilerLogger.error('Unable to compile algo!');
		compilerLogger.error(err.message);
		throw err;
	}
}

/** DANGER! DOM HANDLING FUNCTIONS AHEAD! YOU HAVE BEEN WARNED! **/

function editorSetup() {
	const theme = 'ace/theme/tomorrow_night_eighties';
	const editors = {
		algo: ['algo-editor', theme, 'javascript'],
		css: ['css-editor', theme, 'css']
	};
	Object.keys(editors).forEach(function (type) {
		const [id, theme, mode] = editors[type];
		const el = document.getElementById(id);
		el.style.fontSize = '16px';
		const editor = editors[type] = ace.edit(id);
		editor.setTheme(theme);
		editor.getSession().setMode('ace/mode/' + mode);
	});
	return editors;
}

function domSnapshot() {
	const elById = id => document.getElementById(id);
	// I have found this way of representing dom in JS to be very easy to use
	// and reasonable to maintain in apps where we aren't using two-way binding
	// NOTE: the 'root' key at any sub-object represents the container element
	// for that sub-object, and rest of the elements are within that container
	const dom = {
		root: elById('wrapper'),
		editors: {
			root: elById('editors'),
			algo: elById('algo-editor'),
			css: elById('css-editor')
		},
		control: {
			root: elById('control'),
			toolbar: {
				root: elById('toolbar'),
				btnRunAlgo: elById('action-run'),
				btnSave: elById('action-save'),
				btnSwapRender: elById('action-swap-renderer'),
				permalink: elById('algo-permalink'),
				activeName: elById('algo-active-name')
			}
		},
		view: elById('view'),
		viewCss: elById('view-scoped-css'),
		playback: {
			root: elById('playback-controls'),
			previous: elById('playback-previous'),
			rewind: elById('playback-rewind'),
			pause: elById('playback-pause'),
			play: elById('playback-play'),
			next: elById('playback-next'),
			playspeed: elById('playback-speed')
		},
		logs: elById('logs')
	};
	return dom;
}

const getScopedCSSText = (function () {
	// so.... uhh, I didn't wanna use LESS for this
	// Dangerous stuff performed only by professionals
	// Readers are urged not to try this at home
	const doc = document.implementation.createHTMLDocument('');
	return function getScopedCSSText(cssText, scope) {
		const el = document.createElement('style');
		el.textContent = cssText;
		el.type = 'text/css';

		doc.head.appendChild(el);

		const scoped = Array.from(el.sheet.cssRules).map(function (rule) {
			const {selectorText: selector, cssText: css} = rule;
			const scopedSelector = scopeSelector(selector, scope);
			return css.replace(selector, scopedSelector);
		}).join('\n');

		doc.head.removeChild(el);

		return scoped;
	};

	function scopeSelector(selector, scope) {
		//TODO: sanity check this regex
		return selector.split(/\s*,\s*/).map(function (selector) {
			return `${scope} ${selector}`;
		}).join(', ');
	}
})();

function saveAlgoToGist(algo, css) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest(); // intentionally not using fetch here to keep form serialization consistent in older versions of chrome
		xhr.open('POST', 'https://api.github.com/gists');
		const data = {
			description: `Algorithm submitted via ${location.origin}${location.pathname}`,
			public: false,
			files: {
				'algo.js': {content: algo},
				'css.css': {content: css}
			}
		};
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
		xhr.addEventListener('load', function () {
			try {
				const data = JSON.parse(xhr.responseText); // I'd let you guess why I didn't use xhr.responseType = 'json'
				if (!data || !data.id) {
					reject(data);
				} else {
					resolve(data);
				}
			} catch (err) {
				reject(err);
			}
		});
		xhr.addEventListener('error', reject);
	});
}

function loadAlgoFromGist(id) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.github.com/gists/${id}`);
		xhr.send();
		xhr.addEventListener('load', function () {
			try {
				const data = JSON.parse(xhr.responseText);
				if (!(data && data.files && data.files['algo.js'] && data.files['css.css'])) {
					reject(data);
				} else {
					resolve(data);
				}
			} catch (err) {
				reject(err);
			}
		});
		xhr.addEventListener('error', reject);
	});
}

function loadFromGistBasedOnLocation(editors, setEditState, logger) {
	const match = window.location.search.match(/\gist=(\w+)/);
	if (match && match[1]) {
		setEditState(false);
		loadIndicator.animate(0, 99, 10);
		loadAlgoFromGist(match[1])
			.then(function (resp) {
				editors.algo.setValue(resp.files['algo.js'].content);
				editors.css.setValue(resp.files['css.css'].content);
				logger.info('loaded algo based on url!');
				loadIndicator.clear();
				setEditState(true);
			})
			.catch(function () {
				setEditState(true);
				loadIndicator.clear();
				logger.warn('We tried finding an algo based on the gist id in the url, but couldn\'t find one!');
			});
	}
}

function init() {
	const editors = editorSetup();
	const dom = domSnapshot();
	
	const app = getAppControl(dom);

	const logger = Logger('app', dom.logs);

	{
		const toolbar = dom.control.toolbar;
		toolbar.btnRunAlgo.addEventListener('click', function () {
			// compile algo from editor
			// and initialize playback controls
			const algo = compileAlgoFromEditor(editors.algo, editors.css);
			app.loadAlgoInApp(algo);
		});

		function setEditState(condition) {
			editors.algo.setReadOnly(!condition);
			editors.css.setReadOnly(!condition);
		}

		loadFromGistBasedOnLocation(editors, setEditState, logger);

		toolbar.btnSave.addEventListener('click', function () {
			// set editors to readonly
			// attempt saving to gist
			// return shareable url to user (or error if any)
			// again leave playback state intact
			// make editors writable
			setEditState(false);
			loadIndicator.animate(0, 99, 10);
			saveAlgoToGist(editors.algo.getValue(), editors.css.getValue())
				.then(function (resp) {
					const url = `${location.origin}${location.pathname}?gist=${resp.id}`;
					logger.info(`Algorithm saved. Permalink: ${url}`);
					dom.control.toolbar.permalink.value = url;
					window.history.pushState({}, '', url);
					setEditState(true);
					loadIndicator.clear();
				})
				.catch(function (err) {
					logger.error(`Unable to save algo! We use Github Gists' public API for saving algos, which are limited to users. Apologies, but we can't do much about it :( Here is the error code from Github, if that helps: "${err.message}"`);
					setEditState(true);
					loadIndicator.clear();
				});
		});

		toolbar.btnSwapRender.addEventListener('click', function () {
			const algo = compileAlgoFromEditor(editors.algo, editors.css);
			app.hotSwapRenderer(algo.render);
		});

		editors.css.on('change', function () {
			dom.viewCss.textContent = getScopedCSSText(
				editors.css.getValue(),
				'#view'
			);
		});
	}

	logger.log('alpg initialized!');

	function getAppControl (dom) {
		const player = require('./create-play.js');

		let currentControl;

		function loadAlgoInApp(algo) {
			// here algo is the algo object ready to be fired off
			// unload any currently loaded algorithm
			// empty root node
			// call runner setting root node to root
			// enable playback controls
			unloadAlgorithm();
			currentControl = player(algo, dom.view);
			currentControl.run();
			dom.control.toolbar.activeName.textContent = `Currently Viewing: ${algo.algoName || 'untitled'}`;
			dom.view.classList.remove('unloaded');
			dom.view.classList.add('loaded');
		}
		function unloadAlgorithm() {
			// discard all local state (ensure no memory leakage)
			// disable playback controls

			while(dom.view.childElementCount) {
				dom.view.removeChild(dom.view.lastChild);
			}

			currentControl = undefined;
			dom.control.toolbar.activeName.textContent = '';
			dom.view.classList.remove('loaded');
			dom.view.classList.add('unloaded');
		}
		function hotSwapRenderer(renderer) {
			if (!currentControl) return;
			currentControl.board.swapRenderer(renderer);
		}

		function getSettings() {
			// currently only play speed implemented
			// more soon
			return {
				playspeed: Number(dom.playback.playspeed.value) || 500
			};
		}

		[
			'previous', 'rewind',
			'pause',
			'play', 'next'
		].forEach(function (control) {
			dom.playback[control].addEventListener('click', function () {
				if (!currentControl) {
					// log to app logger
					return;
				}
				currentControl[control](getSettings());
			});
		});

		const KEY_ENTER = 13;
		const KEY_ARROW_LEFT = 37;
		const KEY_ARROW_RIGHT = 39;

		document.addEventListener('keydown', function (ev) {
			// I agree this is not the best keyboard handler
			// but seriously, we have the API to read from Encrypted Media Devices in browsers
			// but we don't have a fucking API to register keyboard shortcuts sanely
			// seriously whatwg, wtf is really wrong with you
			if (ev.ctrlKey && ev.which === KEY_ENTER) {
				ev.preventDefault();
				const algo = compileAlgoFromEditor(editors.algo, editors.css);
				loadAlgoInApp(algo);
				return;
			}
			if (ev.which === KEY_ARROW_LEFT && currentControl && (ev.target.contains(dom.view) || dom.view.contains(ev.target))) {
				ev.preventDefault();
				currentControl.previous(getSettings());
				return;
			}
			if (ev.which === KEY_ARROW_RIGHT && currentControl && (ev.target.contains(dom.view) || dom.view.contains(ev.target))) {
				ev.preventDefault();
				currentControl.next(getSettings());
				return;
			}
		});

		return {loadAlgoInApp, unloadAlgorithm, hotSwapRenderer};
	}
}

window.addEventListener('load', init);
