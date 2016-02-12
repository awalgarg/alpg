const vdom = require('virtual-dom');

function createBoard (render) {
	let tree, rootNode, state, hasRendered;
	return {
		render(newState, parent) {
			tree = render(newState, vdom.h);
			rootNode = vdom.create(tree);
			parent.appendChild(rootNode);
			hasRendered = true;
			state = newState; // trust me I know what I am doing (I think)
		},
		update(newState = state) {
			if (!hasRendered) {
				throw new Error("Can't update what isn't already rendered, you slacker!");
			}
			const newTree = render(newState, vdom.h);
			const patches = vdom.diff(tree, newTree);
			rootNode = vdom.patch(rootNode, patches);
			tree = newTree;
			state = newState; // HAHA THIS IS CRAP LMAO
		},
		swapRenderer(newRenderer) {
			render = newRenderer;
		}
	};
}

module.exports = createBoard;
