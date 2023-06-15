const allowed = ['dir','log','info','group','groupEnd']
const exclude = ['trace','error','warn']

function _console(fn)
{
  return !exclude.includes(fn)
    ? (log => (...args) => {
      args = args.filter(
        data => typeof data !== 'string' || ![
          /development mode/i,
          /vue[- ]?devtools/i,
          /background/i
        ].some(r => r.test(data))
      )

      if (args.length || fn === 'groupEnd') {
        log.apply(console, args)
      }

    })(console[fn])
    : function() {}
}

/**
* Disable console.info - "You are running Vue in development mode"
* while maintaining the ability to output to the console
*/
if (process.env.NODE_ENV === 'production') {
  allowed.concat(exclude).forEach(fn => console[fn] = _console(fn))
}

export default () => {
  // do something...
}
