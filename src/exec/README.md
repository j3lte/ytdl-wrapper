This is a copy of the excellent [@gnome/exec](https://jsr.io/@gnome/exec), but it is slightly modified:

- `@gnome/fs` is removed, because it turns out to be problematic in Node.js packages
  - This `expand_glob` function errors under Node.js ([this line](https://github.com/gnomejs/sdk/blob/main/fs/src/expand_glob.ts#L9))
  - The FS library uses `npm:fs-ext@2.0.0` ([this line](https://github.com/gnomejs/sdk/blob/main/fs/src/node/file.ts#L51)) which is causing all kinds of issues in Node.js (needs to compile C++ code). For our purpose we don't need this library, so I'd like to leave it out.

I have replaced the bare minimum version of `@gnome/fs` with a simple `fs.ts` file that contains only a few methods

## License

[@gnome/exec](https://github.com/gnomejs/sdk) is licensed under the [MIT License](https://github.com/gnomejs/sdk/blob/main/LICENSE.md)
