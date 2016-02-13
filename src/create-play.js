const transactionable = require('./transactionable.js');
const createBoard = require('./create-board.js');

function createPlay({algo, render, initialState, clone},  parent) {
	// I have heard that long function signatures get you candy
	
	if (typeof initialState === 'undefined') {
		initialState = {};
	}
	if (typeof clone !== 'function') {
		clone = o => JSON.parse(JSON.stringify(o));
	}

	const state = transactionable(initialState, clone);
	const board = createBoard(render);

	let pointerListener;

	let playId;

	return {
		// FIXME: move all the clearInterval and playId=undefined calls into a separate function
		run() {
			algo(initialState, state.transact);
			board.render(state.current(), parent);

			pointerListener && pointerListener(state.pointer);
		},
		play({playspeed: time}) {
			clearInterval(playId);
			board.update(state.next());
			pointerListener && pointerListener(state.pointer);

			playId = setInterval(function () {
				board.update(state.next());
				pointerListener && pointerListener(state.pointer);
			}, time || 20);

			return state.current();
		},
		pause() {
			clearInterval(playId);
			playId = undefined;

			return state.current();
		},
		next() {
			clearInterval(playId);
			playId = undefined;

			const nextState = state.next();
			board.update(nextState);
			pointerListener && pointerListener(state.pointer);
			return nextState;
		},
		previous() {
			clearInterval(playId);
			playId = undefined;

			const prevState = state.previous();
			board.update(prevState);

			pointerListener && pointerListener(state.pointer);
			return prevState;
		},
		rewind({playspeed: time}) {
			clearInterval(playId);
			board.update(state.previous());
			pointerListener && pointerListener(state.pointer);

			playId = setInterval(function () {
				board.update(state.previous());
				pointerListener && pointerListener(state.pointer);
			}, time || 20);

			return state.current();
		},
		togglePlayState(settings) {
			if (playId) {
				this.pause(settings);
			} else {
				this.play(settings);
			}
		},
		seek({seekValue}) {
			state.pointer = Number(seekValue) || 0;
			board.update(state.current());
		},
		onPointerChange(fn) {
			if (typeof fn === 'function') {
				pointerListener = fn;
			} else {
				console.error('Non-callable passed to Play.onPointerChange');
			}
		},
		board,
		state
	};
}

module.exports = createPlay;
