---
date: 2022-10-31
type: 'page'
---

# Important Notes

## Code Style

- Follow the (Prettier)[https://prettier.io/] setup.
- camelCase for file names. (`longFileName.js`)
- No `index.js` or `index.jsx` files.
- As always: **when in Rome, do as the Romans do.**

You can run `npm run format` to format everything. Getting live feedback via integrating Prettier with your editor is helpful as well.

## Removal of YUI

The original client was implemented using Yahoo's user interface library [YUI2](http://yui.github.io/yui2/docs/yui_2.9.0/docs/) which has been [depreciated since 2011](http://yuiblog.com/blog/2011/04/13/announcing-yui-2-9-0/). Since April 2015 there has been an ongoing effort to eradicate the old (buggy) YUI code.

## jQuery Shim

Do **not** `require('jquery')` - instead `require('js/shims/jquery')`. `js/shims/jquery` is responsible for combining Semantic UI's jQuery plugins and other plugins all together into one object.
