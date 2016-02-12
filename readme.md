# alpg

alpg is an in-browser algorithm playground to visualize algorithms. it features a time-travelling inspector and hot-swapping view mechanism.
See an example with bubble sort at http://awal.js.org/alpg?19e6114a4dc265794d30.

## how
the algorithm it intakes is basically a script implementing atleast two functions: `algo` and `render`.

The `algo` function defines the runtime of the algorithm itself, and does computations on a state object passed to it. It calls a special function `transact` whenever an interesting state change occurs. This special function simply records the state at that point and stores it.

The `render` function is a pure function which gets a state object from one of the stored states, and returns a virtual DOM tree based on the [virtual-dom-hyperscript] function.

this is pretty much all the magic. the app does the part of providing a UI to do all this and showing the rendered tree and playback controls to travel between the different states.

I am not very good with algorithms, so I don't have many great examples right now. But if you make a cool one, please open a PR so I can include it here!

[virtual-dom-hyperscript]: https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript#virtual-hyperscript

## More documentation?
If you are a JS developer, the [example](http://awal.js.org/alpg?19e6114a4dc265794d30) above shall get you started very easily.

Meanwhile, I am working on "real" docs as well!

## features

- provides ace editor to write algos in-app
- support for injecting custom css (the css is changed as you type, and is scoped to the render of your algo, so you can change it while an algorithm is running)
- sharing algorithms
	- this uses http://gist.github.com for saving
- swapping the renderer while the algorithm is running!
- custom logger (use the `logger` object in your algorithm code)

## why not provide awesome feature X as well?
Mostly because of UX issues. Providing lots of things at once often spoils everything.

Feel free to open an issue. If anyone can come up with a way to provide drastic features in a way that don't hamper usability of the current feature-set, I am happy to add that feature. Patches welcome as well, but please open an issue first.

## keyboard shortcuts

- `Ctrl+Enter` resets state and runs the algorithm from start
- `Left Arrow` switch to previous frame
- `Right Arrow` switch to next frame

## Author
Awal Garg

## License
WTFPL
