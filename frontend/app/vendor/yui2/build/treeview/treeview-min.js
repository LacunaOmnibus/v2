(function () {
  var d = YAHOO.util.Dom,
    b = YAHOO.util.Event,
    f = YAHOO.lang,
    e = YAHOO.widget;
  YAHOO.widget.TreeView = function (h, g) {
    if (h) {
      this.init(h);
    }
    if (g) {
      this.buildTreeFromObject(g);
    } else {
      if (f.trim(this._el.innerHTML)) {
        this.buildTreeFromMarkup(h);
      }
    }
  };
  var c = e.TreeView;
  c.prototype = {
    id: null,
    _el: null,
    _nodes: null,
    locked: false,
    _expandAnim: null,
    _collapseAnim: null,
    _animCount: 0,
    maxAnim: 2,
    _hasDblClickSubscriber: false,
    _dblClickTimer: null,
    currentFocus: null,
    singleNodeHighlight: false,
    _currentlyHighlighted: null,
    setExpandAnim: function (g) {
      this._expandAnim = e.TVAnim.isValid(g) ? g : null;
    },
    setCollapseAnim: function (g) {
      this._collapseAnim = e.TVAnim.isValid(g) ? g : null;
    },
    animateExpand: function (i, j) {
      if (this._expandAnim && this._animCount < this.maxAnim) {
        var g = this;
        var h = e.TVAnim.getAnim(this._expandAnim, i, function () {
          g.expandComplete(j);
        });
        if (h) {
          ++this._animCount;
          this.fireEvent('animStart', { node: j, type: 'expand' });
          h.animate();
        }
        return true;
      }
      return false;
    },
    animateCollapse: function (i, j) {
      if (this._collapseAnim && this._animCount < this.maxAnim) {
        var g = this;
        var h = e.TVAnim.getAnim(this._collapseAnim, i, function () {
          g.collapseComplete(j);
        });
        if (h) {
          ++this._animCount;
          this.fireEvent('animStart', { node: j, type: 'collapse' });
          h.animate();
        }
        return true;
      }
      return false;
    },
    expandComplete: function (g) {
      --this._animCount;
      this.fireEvent('animComplete', { node: g, type: 'expand' });
    },
    collapseComplete: function (g) {
      --this._animCount;
      this.fireEvent('animComplete', { node: g, type: 'collapse' });
    },
    init: function (i) {
      this._el = d.get(i);
      this.id = d.generateId(this._el, 'yui-tv-auto-id-');
      this.createEvent('animStart', this);
      this.createEvent('animComplete', this);
      this.createEvent('collapse', this);
      this.createEvent('collapseComplete', this);
      this.createEvent('expand', this);
      this.createEvent('expandComplete', this);
      this.createEvent('enterKeyPressed', this);
      this.createEvent('clickEvent', this);
      this.createEvent('focusChanged', this);
      var g = this;
      this.createEvent('dblClickEvent', {
        scope: this,
        onSubscribeCallback: function () {
          g._hasDblClickSubscriber = true;
        },
      });
      this.createEvent('labelClick', this);
      this.createEvent('highlightEvent', this);
      this._nodes = [];
      c.trees[this.id] = this;
      this.root = new e.RootNode(this);
      var h = e.LogWriter;
      if (this._initEditor) {
        this._initEditor();
      }
    },
    buildTreeFromObject: function (g) {
      var h = function (q, n) {
        var m, r, l, k, p, j, o;
        for (m = 0; m < n.length; m++) {
          r = n[m];
          if (f.isString(r)) {
            l = new e.TextNode(r, q);
          } else {
            if (f.isObject(r)) {
              k = r.children;
              delete r.children;
              p = r.type || 'text';
              delete r.type;
              switch (f.isString(p) && p.toLowerCase()) {
                case 'text':
                  l = new e.TextNode(r, q);
                  break;
                case 'menu':
                  l = new e.MenuNode(r, q);
                  break;
                case 'html':
                  l = new e.HTMLNode(r, q);
                  break;
                default:
                  if (f.isString(p)) {
                    j = e[p];
                  } else {
                    j = p;
                  }
                  if (f.isObject(j)) {
                    for (o = j; o && o !== e.Node; o = o.superclass.constructor) {}
                    if (o) {
                      l = new j(r, q);
                    } else {
                    }
                  } else {
                  }
              }
              if (k) {
                h(l, k);
              }
            } else {
            }
          }
        }
      };
      if (!f.isArray(g)) {
        g = [g];
      }
      h(this.root, g);
    },
    buildTreeFromMarkup: function (i) {
      var h = function (j) {
        var n,
          q,
          m = [],
          l = {},
          k,
          o;
        for (n = d.getFirstChild(j); n; n = d.getNextSibling(n)) {
          switch (n.tagName.toUpperCase()) {
            case 'LI':
              k = '';
              l = {
                expanded: d.hasClass(n, 'expanded'),
                title: n.title || n.alt || null,
                className: f.trim(n.className.replace(/\bexpanded\b/, '')) || null,
              };
              q = n.firstChild;
              if (q.nodeType == 3) {
                k = f.trim(q.nodeValue.replace(/[\n\t\r]*/g, ''));
                if (k) {
                  l.type = 'text';
                  l.label = k;
                } else {
                  q = d.getNextSibling(q);
                }
              }
              if (!k) {
                if (q.tagName.toUpperCase() == 'A') {
                  l.type = 'text';
                  l.label = q.innerHTML;
                  l.href = q.href;
                  l.target = q.target;
                  l.title = q.title || q.alt || l.title;
                } else {
                  l.type = 'html';
                  var p = document.createElement('div');
                  p.appendChild(q.cloneNode(true));
                  l.html = p.innerHTML;
                  l.hasIcon = true;
                }
              }
              q = d.getNextSibling(q);
              switch (q && q.tagName.toUpperCase()) {
                case 'UL':
                case 'OL':
                  l.children = h(q);
                  break;
              }
              if (YAHOO.lang.JSON) {
                o = n.getAttribute('yuiConfig');
                if (o) {
                  o = YAHOO.lang.JSON.parse(o);
                  l = YAHOO.lang.merge(l, o);
                }
              }
              m.push(l);
              break;
            case 'UL':
            case 'OL':
              l = { type: 'text', label: '', children: h(q) };
              m.push(l);
              break;
          }
        }
        return m;
      };
      var g = d.getChildrenBy(d.get(i), function (k) {
        var j = k.tagName.toUpperCase();
        return j == 'UL' || j == 'OL';
      });
      if (g.length) {
        this.buildTreeFromObject(h(g[0]));
      } else {
      }
    },
    _getEventTargetTdEl: function (h) {
      var i = b.getTarget(h);
      while (i && !(i.tagName.toUpperCase() == 'TD' && d.hasClass(i.parentNode, 'ygtvrow'))) {
        i = d.getAncestorByTagName(i, 'td');
      }
      if (f.isNull(i)) {
        return null;
      }
      if (/\bygtv(blank)?depthcell/.test(i.className)) {
        return null;
      }
      if (i.id) {
        var g = i.id.match(/\bygtv([^\d]*)(.*)/);
        if (g && g[2] && this._nodes[g[2]]) {
          return i;
        }
      }
      return null;
    },
    _onClickEvent: function (j) {
      var h = this,
        l = this._getEventTargetTdEl(j),
        i,
        k,
        g = function (m) {
          i.focus();
          if (m || !i.href) {
            i.toggle();
            try {
              b.preventDefault(j);
            } catch (n) {}
          }
        };
      if (!l) {
        return;
      }
      i = this.getNodeByElement(l);
      if (!i) {
        return;
      }
      k = b.getTarget(j);
      if (d.hasClass(k, i.labelStyle) || d.getAncestorByClassName(k, i.labelStyle)) {
        this.fireEvent('labelClick', i);
      }
      if (this._closeEditor) {
        this._closeEditor(false);
      }
      if (/\bygtv[tl][mp]h?h?/.test(l.className)) {
        g(true);
      } else {
        if (this._dblClickTimer) {
          window.clearTimeout(this._dblClickTimer);
          this._dblClickTimer = null;
        } else {
          if (this._hasDblClickSubscriber) {
            this._dblClickTimer = window.setTimeout(function () {
              h._dblClickTimer = null;
              if (h.fireEvent('clickEvent', { event: j, node: i }) !== false) {
                g();
              }
            }, 200);
          } else {
            if (h.fireEvent('clickEvent', { event: j, node: i }) !== false) {
              g();
            }
          }
        }
      }
    },
    _onDblClickEvent: function (g) {
      if (!this._hasDblClickSubscriber) {
        return;
      }
      var h = this._getEventTargetTdEl(g);
      if (!h) {
        return;
      }
      if (!/\bygtv[tl][mp]h?h?/.test(h.className)) {
        this.fireEvent('dblClickEvent', { event: g, node: this.getNodeByElement(h) });
        if (this._dblClickTimer) {
          window.clearTimeout(this._dblClickTimer);
          this._dblClickTimer = null;
        }
      }
    },
    _onMouseOverEvent: function (g) {
      var h;
      if (
        (h = this._getEventTargetTdEl(g)) &&
        (h = this.getNodeByElement(h)) &&
        (h = h.getToggleEl())
      ) {
        h.className = h.className.replace(/\bygtv([lt])([mp])\b/gi, 'ygtv$1$2h');
      }
    },
    _onMouseOutEvent: function (g) {
      var h;
      if (
        (h = this._getEventTargetTdEl(g)) &&
        (h = this.getNodeByElement(h)) &&
        (h = h.getToggleEl())
      ) {
        h.className = h.className.replace(/\bygtv([lt])([mp])h\b/gi, 'ygtv$1$2');
      }
    },
    _onKeyDownEvent: function (l) {
      var n = b.getTarget(l),
        k = this.getNodeByElement(n),
        j = k,
        g = YAHOO.util.KeyListener.KEY;
      switch (l.keyCode) {
        case g.UP:
          do {
            if (j.previousSibling) {
              j = j.previousSibling;
            } else {
              j = j.parent;
            }
          } while (j && !j._canHaveFocus());
          if (j) {
            j.focus();
          }
          b.preventDefault(l);
          break;
        case g.DOWN:
          do {
            if (j.nextSibling) {
              j = j.nextSibling;
            } else {
              j.expand();
              j = (j.children.length || null) && j.children[0];
            }
          } while (j && !j._canHaveFocus);
          if (j) {
            j.focus();
          }
          b.preventDefault(l);
          break;
        case g.LEFT:
          do {
            if (j.parent) {
              j = j.parent;
            } else {
              j = j.previousSibling;
            }
          } while (j && !j._canHaveFocus());
          if (j) {
            j.focus();
          }
          b.preventDefault(l);
          break;
        case g.RIGHT:
          var i = this,
            m,
            h = function (o) {
              i.unsubscribe('expandComplete', h);
              m(o);
            };
          m = function (o) {
            do {
              if (o.isDynamic() && !o.childrenRendered) {
                i.subscribe('expandComplete', h);
                o.expand();
                o = null;
                break;
              } else {
                o.expand();
                if (o.children.length) {
                  o = o.children[0];
                } else {
                  o = o.nextSibling;
                }
              }
            } while (o && !o._canHaveFocus());
            if (o) {
              o.focus();
            }
          };
          m(j);
          b.preventDefault(l);
          break;
        case g.ENTER:
          if (k.href) {
            if (k.target) {
              window.open(k.href, k.target);
            } else {
              window.location(k.href);
            }
          } else {
            k.toggle();
          }
          this.fireEvent('enterKeyPressed', k);
          b.preventDefault(l);
          break;
        case g.HOME:
          j = this.getRoot();
          if (j.children.length) {
            j = j.children[0];
          }
          if (j._canHaveFocus()) {
            j.focus();
          }
          b.preventDefault(l);
          break;
        case g.END:
          j = j.parent.children;
          j = j[j.length - 1];
          if (j._canHaveFocus()) {
            j.focus();
          }
          b.preventDefault(l);
          break;
        case 107:
        case 187:
          if (l.shiftKey) {
            k.parent.expandAll();
          } else {
            k.expand();
          }
          break;
        case 109:
        case 189:
          if (l.shiftKey) {
            k.parent.collapseAll();
          } else {
            k.collapse();
          }
          break;
        default:
          break;
      }
    },
    render: function () {
      var g = this.root.getHtml(),
        h = this.getEl();
      h.innerHTML = g;
      if (!this._hasEvents) {
        b.on(h, 'click', this._onClickEvent, this, true);
        b.on(h, 'dblclick', this._onDblClickEvent, this, true);
        b.on(h, 'mouseover', this._onMouseOverEvent, this, true);
        b.on(h, 'mouseout', this._onMouseOutEvent, this, true);
        b.on(h, 'keydown', this._onKeyDownEvent, this, true);
      }
      this._hasEvents = true;
    },
    getEl: function () {
      if (!this._el) {
        this._el = d.get(this.id);
      }
      return this._el;
    },
    regNode: function (g) {
      this._nodes[g.index] = g;
    },
    getRoot: function () {
      return this.root;
    },
    setDynamicLoad: function (g, h) {
      this.root.setDynamicLoad(g, h);
    },
    expandAll: function () {
      if (!this.locked) {
        this.root.expandAll();
      }
    },
    collapseAll: function () {
      if (!this.locked) {
        this.root.collapseAll();
      }
    },
    getNodeByIndex: function (h) {
      var g = this._nodes[h];
      return g ? g : null;
    },
    getNodeByProperty: function (j, h) {
      for (var g in this._nodes) {
        if (this._nodes.hasOwnProperty(g)) {
          var k = this._nodes[g];
          if ((j in k && k[j] == h) || (k.data && h == k.data[j])) {
            return k;
          }
        }
      }
      return null;
    },
    getNodesByProperty: function (k, j) {
      var g = [];
      for (var h in this._nodes) {
        if (this._nodes.hasOwnProperty(h)) {
          var l = this._nodes[h];
          if ((k in l && l[k] == j) || (l.data && j == l.data[k])) {
            g.push(l);
          }
        }
      }
      return g.length ? g : null;
    },
    getNodesBy: function (j) {
      var g = [];
      for (var h in this._nodes) {
        if (this._nodes.hasOwnProperty(h)) {
          var k = this._nodes[h];
          if (j(k)) {
            g.push(k);
          }
        }
      }
      return g.length ? g : null;
    },
    getNodeByElement: function (i) {
      var j = i,
        g,
        h = /ygtv([^\d]*)(.*)/;
      do {
        if (j && j.id) {
          g = j.id.match(h);
          if (g && g[2]) {
            return this.getNodeByIndex(g[2]);
          }
        }
        j = j.parentNode;
        if (!j || !j.tagName) {
          break;
        }
      } while (j.id !== this.id && j.tagName.toLowerCase() !== 'body');
      return null;
    },
    getHighlightedNode: function () {
      return this._currentlyHighlighted;
    },
    removeNode: function (h, g) {
      if (h.isRoot()) {
        return false;
      }
      var i = h.parent;
      if (i.parent) {
        i = i.parent;
      }
      this._deleteNode(h);
      if (g && i && i.childrenRendered) {
        i.refresh();
      }
      return true;
    },
    _removeChildren_animComplete: function (g) {
      this.unsubscribe(this._removeChildren_animComplete);
      this.removeChildren(g.node);
    },
    removeChildren: function (g) {
      if (g.expanded) {
        if (this._collapseAnim) {
          this.subscribe('animComplete', this._removeChildren_animComplete, this, true);
          e.Node.prototype.collapse.call(g);
          return;
        }
        g.collapse();
      }
      while (g.children.length) {
        this._deleteNode(g.children[0]);
      }
      if (g.isRoot()) {
        e.Node.prototype.expand.call(g);
      }
      g.childrenRendered = false;
      g.dynamicLoadComplete = false;
      g.updateIcon();
    },
    _deleteNode: function (g) {
      this.removeChildren(g);
      this.popNode(g);
    },
    popNode: function (k) {
      var l = k.parent;
      var h = [];
      for (var j = 0, g = l.children.length; j < g; ++j) {
        if (l.children[j] != k) {
          h[h.length] = l.children[j];
        }
      }
      l.children = h;
      l.childrenRendered = false;
      if (k.previousSibling) {
        k.previousSibling.nextSibling = k.nextSibling;
      }
      if (k.nextSibling) {
        k.nextSibling.previousSibling = k.previousSibling;
      }
      if (this.currentFocus == k) {
        this.currentFocus = null;
      }
      if (this._currentlyHighlighted == k) {
        this._currentlyHighlighted = null;
      }
      k.parent = null;
      k.previousSibling = null;
      k.nextSibling = null;
      k.tree = null;
      delete this._nodes[k.index];
    },
    destroy: function () {
      if (this._destroyEditor) {
        this._destroyEditor();
      }
      var h = this.getEl();
      b.removeListener(h, 'click');
      b.removeListener(h, 'dblclick');
      b.removeListener(h, 'mouseover');
      b.removeListener(h, 'mouseout');
      b.removeListener(h, 'keydown');
      for (var g = 0; g < this._nodes.length; g++) {
        var j = this._nodes[g];
        if (j && j.destroy) {
          j.destroy();
        }
      }
      h.innerHTML = '';
      this._hasEvents = false;
    },
    toString: function () {
      return 'TreeView ' + this.id;
    },
    getNodeCount: function () {
      return this.getRoot().getNodeCount();
    },
    getTreeDefinition: function () {
      return this.getRoot().getNodeDefinition();
    },
    onExpand: function (g) {},
    onCollapse: function (g) {},
    setNodesProperty: function (g, i, h) {
      this.root.setNodesProperty(g, i);
      if (h) {
        this.root.refresh();
      }
    },
    onEventToggleHighlight: function (h) {
      var g;
      if ('node' in h && h.node instanceof e.Node) {
        g = h.node;
      } else {
        if (h instanceof e.Node) {
          g = h;
        } else {
          return false;
        }
      }
      g.toggleHighlight();
      return false;
    },
  };
  var a = c.prototype;
  a.draw = a.render;
  YAHOO.augment(c, YAHOO.util.EventProvider);
  c.nodeCount = 0;
  c.trees = [];
  c.getTree = function (h) {
    var g = c.trees[h];
    return g ? g : null;
  };
  c.getNode = function (h, i) {
    var g = c.getTree(h);
    return g ? g.getNodeByIndex(i) : null;
  };
  c.FOCUS_CLASS_NAME = 'ygtvfocus';
})();
(function () {
  var b = YAHOO.util.Dom,
    c = YAHOO.lang,
    a = YAHOO.util.Event;
  YAHOO.widget.Node = function (f, e, d) {
    if (f) {
      this.init(f, e, d);
    }
  };
  YAHOO.widget.Node.prototype = {
    index: 0,
    children: null,
    tree: null,
    data: null,
    parent: null,
    depth: -1,
    expanded: false,
    multiExpand: true,
    renderHidden: false,
    childrenRendered: false,
    dynamicLoadComplete: false,
    previousSibling: null,
    nextSibling: null,
    _dynLoad: false,
    dataLoader: null,
    isLoading: false,
    hasIcon: true,
    iconMode: 0,
    nowrap: false,
    isLeaf: false,
    contentStyle: '',
    contentElId: null,
    enableHighlight: true,
    highlightState: 0,
    propagateHighlightUp: false,
    propagateHighlightDown: false,
    className: null,
    _type: 'Node',
    init: function (g, f, d) {
      this.data = {};
      this.children = [];
      this.index = YAHOO.widget.TreeView.nodeCount;
      ++YAHOO.widget.TreeView.nodeCount;
      this.contentElId = 'ygtvcontentel' + this.index;
      if (c.isObject(g)) {
        for (var e in g) {
          if (g.hasOwnProperty(e)) {
            if (e.charAt(0) != '_' && !c.isUndefined(this[e]) && !c.isFunction(this[e])) {
              this[e] = g[e];
            } else {
              this.data[e] = g[e];
            }
          }
        }
      }
      if (!c.isUndefined(d)) {
        this.expanded = d;
      }
      this.createEvent('parentChange', this);
      if (f) {
        f.appendChild(this);
      }
    },
    applyParent: function (e) {
      if (!e) {
        return false;
      }
      this.tree = e.tree;
      this.parent = e;
      this.depth = e.depth + 1;
      this.tree.regNode(this);
      e.childrenRendered = false;
      for (var f = 0, d = this.children.length; f < d; ++f) {
        this.children[f].applyParent(this);
      }
      this.fireEvent('parentChange');
      return true;
    },
    appendChild: function (e) {
      if (this.hasChildren()) {
        var d = this.children[this.children.length - 1];
        d.nextSibling = e;
        e.previousSibling = d;
      }
      this.children[this.children.length] = e;
      e.applyParent(this);
      if (this.childrenRendered && this.expanded) {
        this.getChildrenEl().style.display = '';
      }
      return e;
    },
    appendTo: function (d) {
      return d.appendChild(this);
    },
    insertBefore: function (d) {
      var f = d.parent;
      if (f) {
        if (this.tree) {
          this.tree.popNode(this);
        }
        var e = d.isChildOf(f);
        f.children.splice(e, 0, this);
        if (d.previousSibling) {
          d.previousSibling.nextSibling = this;
        }
        this.previousSibling = d.previousSibling;
        this.nextSibling = d;
        d.previousSibling = this;
        this.applyParent(f);
      }
      return this;
    },
    insertAfter: function (d) {
      var f = d.parent;
      if (f) {
        if (this.tree) {
          this.tree.popNode(this);
        }
        var e = d.isChildOf(f);
        if (!d.nextSibling) {
          this.nextSibling = null;
          return this.appendTo(f);
        }
        f.children.splice(e + 1, 0, this);
        d.nextSibling.previousSibling = this;
        this.previousSibling = d;
        this.nextSibling = d.nextSibling;
        d.nextSibling = this;
        this.applyParent(f);
      }
      return this;
    },
    isChildOf: function (e) {
      if (e && e.children) {
        for (var f = 0, d = e.children.length; f < d; ++f) {
          if (e.children[f] === this) {
            return f;
          }
        }
      }
      return -1;
    },
    getSiblings: function () {
      var d = this.parent.children.slice(0);
      for (var e = 0; e < d.length && d[e] != this; e++) {}
      d.splice(e, 1);
      if (d.length) {
        return d;
      }
      return null;
    },
    showChildren: function () {
      if (!this.tree.animateExpand(this.getChildrenEl(), this)) {
        if (this.hasChildren()) {
          this.getChildrenEl().style.display = '';
        }
      }
    },
    hideChildren: function () {
      if (!this.tree.animateCollapse(this.getChildrenEl(), this)) {
        this.getChildrenEl().style.display = 'none';
      }
    },
    getElId: function () {
      return 'ygtv' + this.index;
    },
    getChildrenElId: function () {
      return 'ygtvc' + this.index;
    },
    getToggleElId: function () {
      return 'ygtvt' + this.index;
    },
    getEl: function () {
      return b.get(this.getElId());
    },
    getChildrenEl: function () {
      return b.get(this.getChildrenElId());
    },
    getToggleEl: function () {
      return b.get(this.getToggleElId());
    },
    getContentEl: function () {
      return b.get(this.contentElId);
    },
    collapse: function () {
      if (!this.expanded) {
        return;
      }
      var d = this.tree.onCollapse(this);
      if (false === d) {
        return;
      }
      d = this.tree.fireEvent('collapse', this);
      if (false === d) {
        return;
      }
      if (!this.getEl()) {
        this.expanded = false;
      } else {
        this.hideChildren();
        this.expanded = false;
        this.updateIcon();
      }
      d = this.tree.fireEvent('collapseComplete', this);
    },
    expand: function (f) {
      if (this.isLoading || (this.expanded && !f)) {
        return;
      }
      var d = true;
      if (!f) {
        d = this.tree.onExpand(this);
        if (false === d) {
          return;
        }
        d = this.tree.fireEvent('expand', this);
      }
      if (false === d) {
        return;
      }
      if (!this.getEl()) {
        this.expanded = true;
        return;
      }
      if (!this.childrenRendered) {
        this.getChildrenEl().innerHTML = this.renderChildren();
      } else {
      }
      this.expanded = true;
      this.updateIcon();
      if (this.isLoading) {
        this.expanded = false;
        return;
      }
      if (!this.multiExpand) {
        var g = this.getSiblings();
        for (var e = 0; g && e < g.length; ++e) {
          if (g[e] != this && g[e].expanded) {
            g[e].collapse();
          }
        }
      }
      this.showChildren();
      d = this.tree.fireEvent('expandComplete', this);
    },
    updateIcon: function () {
      if (this.hasIcon) {
        var d = this.getToggleEl();
        if (d) {
          d.className = d.className.replace(/\bygtv(([tl][pmn]h?)|(loading))\b/gi, this.getStyle());
        }
      }
      d = b.get('ygtvtableel' + this.index);
      if (d) {
        if (this.expanded) {
          b.replaceClass(d, 'ygtv-collapsed', 'ygtv-expanded');
        } else {
          b.replaceClass(d, 'ygtv-expanded', 'ygtv-collapsed');
        }
      }
    },
    getStyle: function () {
      if (this.isLoading) {
        return 'ygtvloading';
      } else {
        var e = this.nextSibling ? 't' : 'l';
        var d = 'n';
        if (this.hasChildren(true) || (this.isDynamic() && !this.getIconMode())) {
          d = this.expanded ? 'm' : 'p';
        }
        return 'ygtv' + e + d;
      }
    },
    getHoverStyle: function () {
      var d = this.getStyle();
      if (this.hasChildren(true) && !this.isLoading) {
        d += 'h';
      }
      return d;
    },
    expandAll: function () {
      var d = this.children.length;
      for (var e = 0; e < d; ++e) {
        var f = this.children[e];
        if (f.isDynamic()) {
          break;
        } else {
          if (!f.multiExpand) {
            break;
          } else {
            f.expand();
            f.expandAll();
          }
        }
      }
    },
    collapseAll: function () {
      for (var d = 0; d < this.children.length; ++d) {
        this.children[d].collapse();
        this.children[d].collapseAll();
      }
    },
    setDynamicLoad: function (d, e) {
      if (d) {
        this.dataLoader = d;
        this._dynLoad = true;
      } else {
        this.dataLoader = null;
        this._dynLoad = false;
      }
      if (e) {
        this.iconMode = e;
      }
    },
    isRoot: function () {
      return this == this.tree.root;
    },
    isDynamic: function () {
      if (this.isLeaf) {
        return false;
      } else {
        return !this.isRoot() && (this._dynLoad || this.tree.root._dynLoad);
      }
    },
    getIconMode: function () {
      return this.iconMode || this.tree.root.iconMode;
    },
    hasChildren: function (d) {
      if (this.isLeaf) {
        return false;
      } else {
        return this.children.length > 0 || (d && this.isDynamic() && !this.dynamicLoadComplete);
      }
    },
    toggle: function () {
      if (!this.tree.locked && (this.hasChildren(true) || this.isDynamic())) {
        if (this.expanded) {
          this.collapse();
        } else {
          this.expand();
        }
      }
    },
    getHtml: function () {
      this.childrenRendered = false;
      return [
        '<div class="ygtvitem" id="',
        this.getElId(),
        '">',
        this.getNodeHtml(),
        this.getChildrenHtml(),
        '</div>',
      ].join('');
    },
    getChildrenHtml: function () {
      var d = [];
      d[d.length] = '<div class="ygtvchildren" id="' + this.getChildrenElId() + '"';
      if (!this.expanded || !this.hasChildren()) {
        d[d.length] = ' style="display:none;"';
      }
      d[d.length] = '>';
      if ((this.hasChildren(true) && this.expanded) || (this.renderHidden && !this.isDynamic())) {
        d[d.length] = this.renderChildren();
      }
      d[d.length] = '</div>';
      return d.join('');
    },
    renderChildren: function () {
      var d = this;
      if (this.isDynamic() && !this.dynamicLoadComplete) {
        this.isLoading = true;
        this.tree.locked = true;
        if (this.dataLoader) {
          setTimeout(function () {
            d.dataLoader(d, function () {
              d.loadComplete();
            });
          }, 10);
        } else {
          if (this.tree.root.dataLoader) {
            setTimeout(function () {
              d.tree.root.dataLoader(d, function () {
                d.loadComplete();
              });
            }, 10);
          } else {
            return 'Error: data loader not found or not specified.';
          }
        }
        return '';
      } else {
        return this.completeRender();
      }
    },
    completeRender: function () {
      var e = [];
      for (var d = 0; d < this.children.length; ++d) {
        e[e.length] = this.children[d].getHtml();
      }
      this.childrenRendered = true;
      return e.join('');
    },
    loadComplete: function () {
      this.getChildrenEl().innerHTML = this.completeRender();
      if (this.propagateHighlightDown) {
        if (this.highlightState === 1 && !this.tree.singleNodeHighlight) {
          for (var d = 0; d < this.children.length; d++) {
            this.children[d].highlight(true);
          }
        } else {
          if (this.highlightState === 0 || this.tree.singleNodeHighlight) {
            for (d = 0; d < this.children.length; d++) {
              this.children[d].unhighlight(true);
            }
          }
        }
      }
      this.dynamicLoadComplete = true;
      this.isLoading = false;
      this.expand(true);
      this.tree.locked = false;
    },
    getAncestor: function (e) {
      if (e >= this.depth || e < 0) {
        return null;
      }
      var d = this.parent;
      while (d.depth > e) {
        d = d.parent;
      }
      return d;
    },
    getDepthStyle: function (d) {
      return this.getAncestor(d).nextSibling ? 'ygtvdepthcell' : 'ygtvblankdepthcell';
    },
    getNodeHtml: function () {
      var e = [];
      e[e.length] =
        '<table id="ygtvtableel' +
        this.index +
        '" border="0" cellpadding="0" cellspacing="0" class="ygtvtable ygtvdepth' +
        this.depth;
      e[e.length] = ' ygtv-' + (this.expanded ? 'expanded' : 'collapsed');
      if (this.enableHighlight) {
        e[e.length] = ' ygtv-highlight' + this.highlightState;
      }
      if (this.className) {
        e[e.length] = ' ' + this.className;
      }
      e[e.length] = '"><tr class="ygtvrow">';
      for (var d = 0; d < this.depth; ++d) {
        e[e.length] =
          '<td class="ygtvcell ' + this.getDepthStyle(d) + '"><div class="ygtvspacer"></div></td>';
      }
      if (this.hasIcon) {
        e[e.length] = '<td id="' + this.getToggleElId();
        e[e.length] = '" class="ygtvcell ';
        e[e.length] = this.getStyle();
        e[e.length] = '"><a href="#" class="ygtvspacer">&#160;</a></td>';
      }
      e[e.length] = '<td id="' + this.contentElId;
      e[e.length] = '" class="ygtvcell ';
      e[e.length] = this.contentStyle + ' ygtvcontent" ';
      e[e.length] = this.nowrap ? ' nowrap="nowrap" ' : '';
      e[e.length] = ' >';
      e[e.length] = this.getContentHtml();
      e[e.length] = '</td></tr></table>';
      return e.join('');
    },
    getContentHtml: function () {
      return '';
    },
    refresh: function () {
      this.getChildrenEl().innerHTML = this.completeRender();
      if (this.hasIcon) {
        var d = this.getToggleEl();
        if (d) {
          d.className = d.className.replace(/\bygtv[lt][nmp]h*\b/gi, this.getStyle());
        }
      }
    },
    toString: function () {
      return this._type + ' (' + this.index + ')';
    },
    _focusHighlightedItems: [],
    _focusedItem: null,
    _canHaveFocus: function () {
      return this.getEl().getElementsByTagName('a').length > 0;
    },
    _removeFocus: function () {
      if (this._focusedItem) {
        a.removeListener(this._focusedItem, 'blur');
        this._focusedItem = null;
      }
      var d;
      while ((d = this._focusHighlightedItems.shift())) {
        b.removeClass(d, YAHOO.widget.TreeView.FOCUS_CLASS_NAME);
      }
    },
    focus: function () {
      var f = false,
        d = this;
      if (this.tree.currentFocus) {
        this.tree.currentFocus._removeFocus();
      }
      var e = function (g) {
        if (g.parent) {
          e(g.parent);
          g.parent.expand();
        }
      };
      e(this);
      b.getElementsBy(
        function (g) {
          return /ygtv(([tl][pmn]h?)|(content))/.test(g.className);
        },
        'td',
        d.getEl().firstChild,
        function (h) {
          b.addClass(h, YAHOO.widget.TreeView.FOCUS_CLASS_NAME);
          if (!f) {
            var g = h.getElementsByTagName('a');
            if (g.length) {
              g = g[0];
              g.focus();
              d._focusedItem = g;
              a.on(g, 'blur', function () {
                d.tree.fireEvent('focusChanged', { oldNode: d.tree.currentFocus, newNode: null });
                d.tree.currentFocus = null;
                d._removeFocus();
              });
              f = true;
            }
          }
          d._focusHighlightedItems.push(h);
        }
      );
      if (f) {
        this.tree.fireEvent('focusChanged', { oldNode: this.tree.currentFocus, newNode: this });
        this.tree.currentFocus = this;
      } else {
        this.tree.fireEvent('focusChanged', { oldNode: d.tree.currentFocus, newNode: null });
        this.tree.currentFocus = null;
        this._removeFocus();
      }
      return f;
    },
    getNodeCount: function () {
      for (var d = 0, e = 0; d < this.children.length; d++) {
        e += this.children[d].getNodeCount();
      }
      return e + 1;
    },
    getNodeDefinition: function () {
      if (this.isDynamic()) {
        return false;
      }
      var g,
        d = c.merge(this.data),
        f = [];
      if (this.expanded) {
        d.expanded = this.expanded;
      }
      if (!this.multiExpand) {
        d.multiExpand = this.multiExpand;
      }
      if (this.renderHidden) {
        d.renderHidden = this.renderHidden;
      }
      if (!this.hasIcon) {
        d.hasIcon = this.hasIcon;
      }
      if (this.nowrap) {
        d.nowrap = this.nowrap;
      }
      if (this.className) {
        d.className = this.className;
      }
      if (this.editable) {
        d.editable = this.editable;
      }
      if (!this.enableHighlight) {
        d.enableHighlight = this.enableHighlight;
      }
      if (this.highlightState) {
        d.highlightState = this.highlightState;
      }
      if (this.propagateHighlightUp) {
        d.propagateHighlightUp = this.propagateHighlightUp;
      }
      if (this.propagateHighlightDown) {
        d.propagateHighlightDown = this.propagateHighlightDown;
      }
      d.type = this._type;
      for (var e = 0; e < this.children.length; e++) {
        g = this.children[e].getNodeDefinition();
        if (g === false) {
          return false;
        }
        f.push(g);
      }
      if (f.length) {
        d.children = f;
      }
      return d;
    },
    getToggleLink: function () {
      return 'return false;';
    },
    setNodesProperty: function (d, g, f) {
      if (d.charAt(0) != '_' && !c.isUndefined(this[d]) && !c.isFunction(this[d])) {
        this[d] = g;
      } else {
        this.data[d] = g;
      }
      for (var e = 0; e < this.children.length; e++) {
        this.children[e].setNodesProperty(d, g);
      }
      if (f) {
        this.refresh();
      }
    },
    toggleHighlight: function () {
      if (this.enableHighlight) {
        if (this.highlightState == 1) {
          this.unhighlight();
        } else {
          this.highlight();
        }
      }
    },
    highlight: function (e) {
      if (this.enableHighlight) {
        if (this.tree.singleNodeHighlight) {
          if (this.tree._currentlyHighlighted) {
            this.tree._currentlyHighlighted.unhighlight(e);
          }
          this.tree._currentlyHighlighted = this;
        }
        this.highlightState = 1;
        this._setHighlightClassName();
        if (!this.tree.singleNodeHighlight) {
          if (this.propagateHighlightDown) {
            for (var d = 0; d < this.children.length; d++) {
              this.children[d].highlight(true);
            }
          }
          if (this.propagateHighlightUp) {
            if (this.parent) {
              this.parent._childrenHighlighted();
            }
          }
        }
        if (!e) {
          this.tree.fireEvent('highlightEvent', this);
        }
      }
    },
    unhighlight: function (e) {
      if (this.enableHighlight) {
        this.tree._currentlyHighlighted = null;
        this.highlightState = 0;
        this._setHighlightClassName();
        if (!this.tree.singleNodeHighlight) {
          if (this.propagateHighlightDown) {
            for (var d = 0; d < this.children.length; d++) {
              this.children[d].unhighlight(true);
            }
          }
          if (this.propagateHighlightUp) {
            if (this.parent) {
              this.parent._childrenHighlighted();
            }
          }
        }
        if (!e) {
          this.tree.fireEvent('highlightEvent', this);
        }
      }
    },
    _childrenHighlighted: function () {
      var f = false,
        e = false;
      if (this.enableHighlight) {
        for (var d = 0; d < this.children.length; d++) {
          switch (this.children[d].highlightState) {
            case 0:
              e = true;
              break;
            case 1:
              f = true;
              break;
            case 2:
              f = e = true;
              break;
          }
        }
        if (f && e) {
          this.highlightState = 2;
        } else {
          if (f) {
            this.highlightState = 1;
          } else {
            this.highlightState = 0;
          }
        }
        this._setHighlightClassName();
        if (this.propagateHighlightUp) {
          if (this.parent) {
            this.parent._childrenHighlighted();
          }
        }
      }
    },
    _setHighlightClassName: function () {
      var d = b.get('ygtvtableel' + this.index);
      if (d) {
        d.className = d.className.replace(
          /\bygtv-highlight\d\b/gi,
          'ygtv-highlight' + this.highlightState
        );
      }
    },
  };
  YAHOO.augment(YAHOO.widget.Node, YAHOO.util.EventProvider);
})();
YAHOO.widget.RootNode = function (a) {
  this.init(null, null, true);
  this.tree = a;
};
YAHOO.extend(YAHOO.widget.RootNode, YAHOO.widget.Node, {
  _type: 'RootNode',
  getNodeHtml: function () {
    return '';
  },
  toString: function () {
    return this._type;
  },
  loadComplete: function () {
    this.tree.draw();
  },
  getNodeCount: function () {
    for (var a = 0, b = 0; a < this.children.length; a++) {
      b += this.children[a].getNodeCount();
    }
    return b;
  },
  getNodeDefinition: function () {
    for (var c, a = [], b = 0; b < this.children.length; b++) {
      c = this.children[b].getNodeDefinition();
      if (c === false) {
        return false;
      }
      a.push(c);
    }
    return a;
  },
  collapse: function () {},
  expand: function () {},
  getSiblings: function () {
    return null;
  },
  focus: function () {},
});
(function () {
  var b = YAHOO.util.Dom,
    c = YAHOO.lang,
    a = YAHOO.util.Event;
  YAHOO.widget.TextNode = function (f, e, d) {
    if (f) {
      if (c.isString(f)) {
        f = { label: f };
      }
      this.init(f, e, d);
      this.setUpLabel(f);
    }
  };
  YAHOO.extend(YAHOO.widget.TextNode, YAHOO.widget.Node, {
    labelStyle: 'ygtvlabel',
    labelElId: null,
    label: null,
    title: null,
    href: null,
    target: '_self',
    _type: 'TextNode',
    setUpLabel: function (d) {
      if (c.isString(d)) {
        d = { label: d };
      } else {
        if (d.style) {
          this.labelStyle = d.style;
        }
      }
      this.label = d.label;
      this.labelElId = 'ygtvlabelel' + this.index;
    },
    getLabelEl: function () {
      return b.get(this.labelElId);
    },
    getContentHtml: function () {
      var d = [];
      d[d.length] = this.href ? '<a' : '<span';
      d[d.length] = ' id="' + c.escapeHTML(this.labelElId) + '"';
      d[d.length] = ' class="' + c.escapeHTML(this.labelStyle) + '"';
      if (this.href) {
        d[d.length] = ' href="' + c.escapeHTML(this.href) + '"';
        d[d.length] = ' target="' + c.escapeHTML(this.target) + '"';
      }
      if (this.title) {
        d[d.length] = ' title="' + c.escapeHTML(this.title) + '"';
      }
      d[d.length] = ' >';
      d[d.length] = c.escapeHTML(this.label);
      d[d.length] = this.href ? '</a>' : '</span>';
      return d.join('');
    },
    getNodeDefinition: function () {
      var d = YAHOO.widget.TextNode.superclass.getNodeDefinition.call(this);
      if (d === false) {
        return false;
      }
      d.label = this.label;
      if (this.labelStyle != 'ygtvlabel') {
        d.style = this.labelStyle;
      }
      if (this.title) {
        d.title = this.title;
      }
      if (this.href) {
        d.href = this.href;
      }
      if (this.target != '_self') {
        d.target = this.target;
      }
      return d;
    },
    toString: function () {
      return YAHOO.widget.TextNode.superclass.toString.call(this) + ': ' + this.label;
    },
    onLabelClick: function () {
      return false;
    },
    refresh: function () {
      YAHOO.widget.TextNode.superclass.refresh.call(this);
      var d = this.getLabelEl();
      d.innerHTML = this.label;
      if (d.tagName.toUpperCase() == 'A') {
        d.href = this.href;
        d.target = this.target;
      }
    },
  });
})();
YAHOO.widget.MenuNode = function (c, b, a) {
  YAHOO.widget.MenuNode.superclass.constructor.call(this, c, b, a);
  this.multiExpand = false;
};
YAHOO.extend(YAHOO.widget.MenuNode, YAHOO.widget.TextNode, { _type: 'MenuNode' });
(function () {
  var b = YAHOO.util.Dom,
    c = YAHOO.lang,
    a = YAHOO.util.Event;
  var d = function (h, g, f, e) {
    if (h) {
      this.init(h, g, f);
      this.initContent(h, e);
    }
  };
  YAHOO.widget.HTMLNode = d;
  YAHOO.extend(d, YAHOO.widget.Node, {
    contentStyle: 'ygtvhtml',
    html: null,
    _type: 'HTMLNode',
    initContent: function (f, e) {
      this.setHtml(f);
      this.contentElId = 'ygtvcontentel' + this.index;
      if (!c.isUndefined(e)) {
        this.hasIcon = e;
      }
    },
    setHtml: function (f) {
      this.html = c.isObject(f) && 'html' in f ? f.html : f;
      var e = this.getContentEl();
      if (e) {
        if (f.nodeType && f.nodeType == 1 && f.tagName) {
          e.innerHTML = '';
        } else {
          e.innerHTML = this.html;
        }
      }
    },
    getContentHtml: function () {
      if (typeof this.html === 'string') {
        return this.html;
      } else {
        d._deferredNodes.push(this);
        if (!d._timer) {
          d._timer = window.setTimeout(function () {
            var e;
            while ((e = d._deferredNodes.pop())) {
              e.getContentEl().appendChild(e.html);
            }
            d._timer = null;
          }, 0);
        }
        return '';
      }
    },
    getNodeDefinition: function () {
      var e = d.superclass.getNodeDefinition.call(this);
      if (e === false) {
        return false;
      }
      e.html = this.html;
      return e;
    },
  });
  d._deferredNodes = [];
  d._timer = null;
})();
(function () {
  var b = YAHOO.util.Dom,
    c = YAHOO.lang,
    a = YAHOO.util.Event,
    d = YAHOO.widget.Calendar;
  YAHOO.widget.DateNode = function (g, f, e) {
    YAHOO.widget.DateNode.superclass.constructor.call(this, g, f, e);
  };
  YAHOO.extend(YAHOO.widget.DateNode, YAHOO.widget.TextNode, {
    _type: 'DateNode',
    calendarConfig: null,
    fillEditorContainer: function (g) {
      var h,
        f = g.inputContainer;
      if (c.isUndefined(d)) {
        b.replaceClass(g.editorPanel, 'ygtv-edit-DateNode', 'ygtv-edit-TextNode');
        YAHOO.widget.DateNode.superclass.fillEditorContainer.call(this, g);
        return;
      }
      if (g.nodeType != this._type) {
        g.nodeType = this._type;
        g.saveOnEnter = false;
        g.node.destroyEditorContents(g);
        g.inputObject = h = new d(f.appendChild(document.createElement('div')));
        if (this.calendarConfig) {
          h.cfg.applyConfig(this.calendarConfig, true);
          h.cfg.fireQueue();
        }
        h.selectEvent.subscribe(
          function () {
            this.tree._closeEditor(true);
          },
          this,
          true
        );
      } else {
        h = g.inputObject;
      }
      g.oldValue = this.label;
      h.cfg.setProperty('selected', this.label, false);
      var i = h.cfg.getProperty('DATE_FIELD_DELIMITER');
      var e = this.label.split(i);
      h.cfg.setProperty(
        'pagedate',
        e[h.cfg.getProperty('MDY_MONTH_POSITION') - 1] +
          i +
          e[h.cfg.getProperty('MDY_YEAR_POSITION') - 1]
      );
      h.cfg.fireQueue();
      h.render();
      h.oDomContainer.focus();
    },
    getEditorValue: function (f) {
      if (c.isUndefined(d)) {
        return f.inputElement.value;
      } else {
        var h = f.inputObject,
          g = h.getSelectedDates()[0],
          e = [];
        e[h.cfg.getProperty('MDY_DAY_POSITION') - 1] = g.getDate();
        e[h.cfg.getProperty('MDY_MONTH_POSITION') - 1] = g.getMonth() + 1;
        e[h.cfg.getProperty('MDY_YEAR_POSITION') - 1] = g.getFullYear();
        return e.join(h.cfg.getProperty('DATE_FIELD_DELIMITER'));
      }
    },
    displayEditedValue: function (g, e) {
      var f = e.node;
      f.label = g;
      f.getLabelEl().innerHTML = g;
    },
    getNodeDefinition: function () {
      var e = YAHOO.widget.DateNode.superclass.getNodeDefinition.call(this);
      if (e === false) {
        return false;
      }
      if (this.calendarConfig) {
        e.calendarConfig = this.calendarConfig;
      }
      return e;
    },
  });
})();
(function () {
  var e = YAHOO.util.Dom,
    f = YAHOO.lang,
    b = YAHOO.util.Event,
    d = YAHOO.widget.TreeView,
    c = d.prototype;
  d.editorData = {
    active: false,
    whoHasIt: null,
    nodeType: null,
    editorPanel: null,
    inputContainer: null,
    buttonsContainer: null,
    node: null,
    saveOnEnter: true,
    oldValue: undefined,
  };
  c.validator = null;
  c._initEditor = function () {
    this.createEvent('editorSaveEvent', this);
    this.createEvent('editorCancelEvent', this);
  };
  c._nodeEditing = function (m) {
    if (m.fillEditorContainer && m.editable) {
      var i,
        k,
        l,
        j,
        h = d.editorData;
      h.active = true;
      h.whoHasIt = this;
      if (!h.nodeType) {
        h.editorPanel = i = this.getEl().appendChild(document.createElement('div'));
        e.addClass(i, 'ygtv-label-editor');
        i.tabIndex = 0;
        l = h.buttonsContainer = i.appendChild(document.createElement('div'));
        e.addClass(l, 'ygtv-button-container');
        j = l.appendChild(document.createElement('button'));
        e.addClass(j, 'ygtvok');
        j.innerHTML = ' ';
        j = l.appendChild(document.createElement('button'));
        e.addClass(j, 'ygtvcancel');
        j.innerHTML = ' ';
        b.on(l, 'click', function (q) {
          var r = b.getTarget(q),
            o = d.editorData,
            p = o.node,
            n = o.whoHasIt;
          if (e.hasClass(r, 'ygtvok')) {
            b.stopEvent(q);
            n._closeEditor(true);
          }
          if (e.hasClass(r, 'ygtvcancel')) {
            b.stopEvent(q);
            n._closeEditor(false);
          }
        });
        h.inputContainer = i.appendChild(document.createElement('div'));
        e.addClass(h.inputContainer, 'ygtv-input');
        b.on(i, 'keydown', function (q) {
          var p = d.editorData,
            n = YAHOO.util.KeyListener.KEY,
            o = p.whoHasIt;
          switch (q.keyCode) {
            case n.ENTER:
              b.stopEvent(q);
              if (p.saveOnEnter) {
                o._closeEditor(true);
              }
              break;
            case n.ESCAPE:
              b.stopEvent(q);
              o._closeEditor(false);
              break;
          }
        });
      } else {
        i = h.editorPanel;
      }
      h.node = m;
      if (h.nodeType) {
        e.removeClass(i, 'ygtv-edit-' + h.nodeType);
      }
      e.addClass(i, ' ygtv-edit-' + m._type);
      e.setStyle(i, 'display', 'block');
      e.setXY(i, e.getXY(m.getContentEl()));
      i.focus();
      m.fillEditorContainer(h);
      return true;
    }
  };
  c.onEventEditNode = function (h) {
    if (h instanceof YAHOO.widget.Node) {
      h.editNode();
    } else {
      if (h.node instanceof YAHOO.widget.Node) {
        h.node.editNode();
      }
    }
    return false;
  };
  c._closeEditor = function (j) {
    var h = d.editorData,
      i = h.node,
      k = true;
    if (!i || !h.active) {
      return;
    }
    if (j) {
      k = h.node.saveEditorValue(h) !== false;
    } else {
      this.fireEvent('editorCancelEvent', i);
    }
    if (k) {
      e.setStyle(h.editorPanel, 'display', 'none');
      h.active = false;
      i.focus();
    }
  };
  c._destroyEditor = function () {
    var h = d.editorData;
    if (h && h.nodeType && (!h.active || h.whoHasIt === this)) {
      b.removeListener(h.editorPanel, 'keydown');
      b.removeListener(h.buttonContainer, 'click');
      h.node.destroyEditorContents(h);
      document.body.removeChild(h.editorPanel);
      h.nodeType =
        h.editorPanel =
        h.inputContainer =
        h.buttonsContainer =
        h.whoHasIt =
        h.node =
          null;
      h.active = false;
    }
  };
  var g = YAHOO.widget.Node.prototype;
  g.editable = false;
  g.editNode = function () {
    this.tree._nodeEditing(this);
  };
  g.fillEditorContainer = null;
  g.destroyEditorContents = function (h) {
    b.purgeElement(h.inputContainer, true);
    h.inputContainer.innerHTML = '';
  };
  g.saveEditorValue = function (h) {
    var j = h.node,
      k,
      i = j.tree.validator;
    k = this.getEditorValue(h);
    if (f.isFunction(i)) {
      k = i(k, h.oldValue, j);
      if (f.isUndefined(k)) {
        return false;
      }
    }
    if (
      this.tree.fireEvent('editorSaveEvent', { newValue: k, oldValue: h.oldValue, node: j }) !==
      false
    ) {
      this.displayEditedValue(k, h);
    }
  };
  g.getEditorValue = function (h) {};
  g.displayEditedValue = function (i, h) {};
  var a = YAHOO.widget.TextNode.prototype;
  a.fillEditorContainer = function (i) {
    var h;
    if (i.nodeType != this._type) {
      i.nodeType = this._type;
      i.saveOnEnter = true;
      i.node.destroyEditorContents(i);
      i.inputElement = h = i.inputContainer.appendChild(document.createElement('input'));
    } else {
      h = i.inputElement;
    }
    i.oldValue = this.label;
    h.value = this.label;
    h.focus();
    h.select();
  };
  a.getEditorValue = function (h) {
    return h.inputElement.value;
  };
  a.displayEditedValue = function (j, h) {
    var i = h.node;
    i.label = j;
    i.getLabelEl().innerHTML = j;
  };
  a.destroyEditorContents = function (h) {
    h.inputContainer.innerHTML = '';
  };
})();
YAHOO.widget.TVAnim = (function () {
  return {
    FADE_IN: 'TVFadeIn',
    FADE_OUT: 'TVFadeOut',
    getAnim: function (b, a, c) {
      if (YAHOO.widget[b]) {
        return new YAHOO.widget[b](a, c);
      } else {
        return null;
      }
    },
    isValid: function (a) {
      return YAHOO.widget[a];
    },
  };
})();
YAHOO.widget.TVFadeIn = function (a, b) {
  this.el = a;
  this.callback = b;
};
YAHOO.widget.TVFadeIn.prototype = {
  animate: function () {
    var e = this;
    var d = this.el.style;
    d.opacity = 0.1;
    d.filter = 'alpha(opacity=10)';
    d.display = '';
    var c = 0.4;
    var b = new YAHOO.util.Anim(this.el, { opacity: { from: 0.1, to: 1, unit: '' } }, c);
    b.onComplete.subscribe(function () {
      e.onComplete();
    });
    b.animate();
  },
  onComplete: function () {
    this.callback();
  },
  toString: function () {
    return 'TVFadeIn';
  },
};
YAHOO.widget.TVFadeOut = function (a, b) {
  this.el = a;
  this.callback = b;
};
YAHOO.widget.TVFadeOut.prototype = {
  animate: function () {
    var d = this;
    var c = 0.4;
    var b = new YAHOO.util.Anim(this.el, { opacity: { from: 1, to: 0.1, unit: '' } }, c);
    b.onComplete.subscribe(function () {
      d.onComplete();
    });
    b.animate();
  },
  onComplete: function () {
    var a = this.el.style;
    a.display = 'none';
    a.opacity = 1;
    a.filter = 'alpha(opacity=100)';
    this.callback();
  },
  toString: function () {
    return 'TVFadeOut';
  },
};
YAHOO.register('treeview', YAHOO.widget.TreeView, { version: '@VERSION@', build: '@BUILD@' });
