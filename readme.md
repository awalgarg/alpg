# alpg

alpg is an in-browser algorithm playground to visualize your own custom algorithms and share them with others. it features a time-travelling inspector and hot-swapping view mechanism.
See an example with bubble sort at http://awal.js.org/alpg/?gist=1623086148080a297155

## How

Please read the [Getting Started](https://github.com/awalGarg/alpg/wiki/Writing-algorithms-for-the-app---%22Getting-Started%22) doc at the [wiki](https://github.com/awalGarg/alpg/wiki/).

If you are a JS developer familiar with function programming (and optionally virtual-dom) already, it would be very easy to understand what's happening just by looking at the example above.

## features

- provides ace editor to write algos in-app
- support for injecting custom css (the css is changed as you type, and is scoped to the render of your algo, so you can change it while an algorithm is running)
- sharing algorithms
	- this uses http://gist.github.com for saving
- swapping the renderer while the algorithm is running!
- media player style playback of rendered states
- custom logger (use the `logger` object in your algorithm code)

## Screenshots

![enter image description here](http://i.imgur.com/3kH3b1p.png "I know you want a gif. but.. I use linux. 'nuf said")

## why not provide awesome feature X as well?
Mostly because of UX issues. Providing lots of things at once often spoils everything.

Feel free to open an issue. If anyone can come up with a way to provide drastic features in a way that don't hamper usability of the current feature-set, I am happy to add that feature. Patches welcome as well, but please open an issue first.

## keyboard shortcuts

- `Ctrl+Enter` resets state and runs the algorithm from start
- `Left Arrow` switch to previous frame
- `Right Arrow` switch to next frame
- `Spacebar` toggle automatic play

## Author
Awal Garg

## License
WTFPL
