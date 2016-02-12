/**
 * ProTip: blackbox me in devtools
 */

function Logger(loggerName, element, timeStamps=true) {
	function log (logLevel, message) {
		let repr;
		if (typeof message !== 'string' || Number(message) !== message) {
			// probably an object
			try {
				repr = JSON.stringify(message, null, ' ');
			} catch (err) {
				repr = message.toString();
			}
		} else {
			repr = message;
		}

		const el = document.createElement('pre');
		el.classList.add('app-log-container', logLevel);

		if (timeStamps) {
			const ts = document.createElement('pre');
			ts.classList.add('log-timestamp');
			ts.textContent = (new Date()).toLocaleTimeString();
			el.appendChild(ts);
		}

		const logEl = document.createElement('pre');
		logEl.classList.add('app-log');
		logEl.textContent = repr;
		el.appendChild(logEl);

		element.appendChild(el);
//		el.scrollIntoView();
	}

	const logger = {};

	[
		'warning', 'info', 'error', 'debug', 'log'
	].forEach(function (level) {
		logger[level] = function (message) {
			setTimeout(function () {
				log(level, message);
			}, 10);
		};
	});

	logger.createNew = function createNew(newLoggerName, ts=timeStamps) {
		return Logger(`${loggerName}:${newLoggerName}`, element, ts);
	};

	return logger;
}

module.exports = Logger;
