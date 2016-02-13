function transactionable(o, clone) {
	const states = [];
	let pointer = 0;
	let transactionListener;

	function transact() {
		let newState = clone(o);
		states.push(newState);
		if (transactionListener) {
			setTimeout(listener, 0, states.length);
		}
		return o;
	}

	transact();

	function next() {
		pointer = clampPointer(+1); // why +, you ask
		return states[pointer]; // because it looks good!
	}

	function previous() {
		pointer = clampPointer(-1);
		return states[pointer];
	}

	function current() {
		pointer = clampPointer();
		return states[pointer];
	}

	function reset() {
		pointer = 0;
		return states[pointer];
	}

	return {
		states,
		transact,
		current,
		next,
		previous,
		reset,
		get pointer() {
			return pointer;
		},
		set pointer(val) {
			// TODO: see if we can read this better?
			if (Number(val)) {
				pointer = +val;
				pointer = clampPointer();
			}
			return pointer;
		},
		onTransact(fn) {
			transactionListener = fn;
			setTimeout(fn, 0, states.length);
		}
	};

	function clampPointer(change = 0) {
		// NOTE: I do *not* mutate the pointer itself
		// just return a new possible value
		if (!pointer && !change) return pointer;
		const max = states.length - 1;
		let newPointer = pointer + change;
		if (newPointer > max) {
			newPointer = max;
		} else if (newPointer < 0) {
			newPointer = 0;
		}
		return newPointer;
	}
}

module.exports = transactionable;
