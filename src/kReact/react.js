/*
  createElement(type,props,...children)
*/
function setChild(child) {
  return (typeof child !== "object") ? { type: "string", inner: child } : child;
}
/*通过 createElement 来生成我们的虚拟DOM */
function createElement(type, props, ...child) {
  delete props.__source;
  delete props.__self;
  let key;
  let children = [];
  if (props.key !== undefined) {
    key = props.key;
    delete props.key;
  }

  child.forEach(item => {
    if (Array.isArray(item)) {
      item.forEach(subItem => {
        children.push(setChild(subItem));
      })
    } else {
      children.push(setChild(item));
    }
  });
  if (typeof type === "function") {//组件
    props.children = children;
    return {
      type,
      props,
      key
    }
  }
  return {
    type,
    props,
    children,
    key
  }
}
/* 类组件的父类 */

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
    this.__nextState = [];
    this.__timer = 0;
  }
  setState(newState) {
    this.__nextState.push(newState);
    clearTimeout(this.__timer);
    this.__timer = setTimeout(() => {
      this.updater();// 更新组件 
    });
  }
}
export default {
  createElement,
  Component
}
