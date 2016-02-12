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

	let playId;

	return {
		// FIXME: move all the clearInterval and playId=undefined calls into a separate function
		run() {
			algo(initialState, state.transact);
			board.render(state.current(), parent);
		},
		play({playspeed: time}) {
			clearInterval(playId);
			board.update(state.next());

			playId = setInterval(function () {
				board.update(state.next());
			}, time);

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
			return nextState;
		},
		previous() {
			clearInterval(playId);
			playId = undefined;

			const prevState = state.previous();
			board.update(prevState);
			return prevState;
		},
		rewind({playspeed: time}) {
			clearInterval(playId);
			board.update(state.previous());

			playId = setInterval(function () {
				board.update(state.previous());
			}, time);

			return state.current();
		},
		board
	};
}

module.exports = createPlay;
