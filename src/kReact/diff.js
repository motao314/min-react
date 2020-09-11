import patch from "./patch";
/*
  收集需要更新的内容
  patches = [
      {
        type: "repalce"// 替换节点
      }, {
        type: "text" // 更新文本节点
      }, {
        type: "attr" // 更新属性
      }, {
        type: "remove"// 删除节点
      }, {
        type: "insert"// 插入节点
      }, {
        type: "move" // 移动节点
      }
  ]
*/
function diff(oldTree, newTree, createNode) {
  return diffNode(oldTree, newTree, createNode)
}

function diffNode(oldNode, newNode, createNode) {
  //console.log(oldNode, newNode);
  let newVdom = oldNode;//假设无更新
  let patches = [];
  let parent = oldNode.__dom.parentNoe;
  if ((!oldNode) && (!newNode)) {
    return newVdom;
  }
  if (oldNode.type !== oldNode.type) { //当新老 type 不一致时，代表节点已经改变需要整体替换
    //console.log("替换节点");
    newVdom = newNode;
    let oldDOM = oldNode.__dom;
    let newDom = createNode(newNode);
    patches.push({
      type: "replace",
      oldNode: oldDOM,
      parent,
      newNode: newDom
    });
    oldNode.__dom = newDom;
  } else if (oldNode.type === "string") { //当节点是文本节点时
    if (oldNode.inner !== newNode.inner) { // 文本节点内容不一致
      patches.push({
        type: "text",
        node: oldNode.__dom,
        newText: newNode.inner
      });
      newVdom.inner = newNode.inner;
    }
  } else if (typeof oldNode.type === "function") { // 组件更新
    //console.log("组件对比");
    newVdom = diffCmp(oldNode, newNode, createNode);
  } else { // 元素节点对比
    //console.log("对比节点属性");
    let propsPatches = diffProps(oldNode.props, newNode.props);
    if (Object.keys(propsPatches).length > 0) {
      patches.push({
        type: "attr",
        node: oldNode.__dom,
        newProps: propsPatches
      });
      newVdom.props = newNode.props;
    }
    newVdom.children = diffChildren(oldNode.children, newNode.children, createNode,newVdom.__dom);

    //console.log("对比节点的子元素");
  }
  if (patches.length > 0) {
    patch(patches);
  }
  return newVdom;
}

function diffCmp(oldCmp, newCmp, createNode) {
  /*
      判断组件是否需要更新
  */
  if (Object.keys(diffProps(oldCmp.props, newCmp.props)).length > 0) { // props 如果有不一样才进行组件更新
    // 调用 组件的生命周期函数，开始组件更新

    // 更新组件
    oldCmp._cmp.props = newCmp.props; //更新 props

    // 生成新的虚拟DOM
    let newVnode = oldCmp._cmp.render();
    oldCmp._vdom = diffNode(oldCmp._vdom, newVnode, createNode);
  }
  return oldCmp;
}

function diffChildren(oldChild, newChild, createNode,parent) {
  let newChildren = newChild;
  let oldKeyChild = setKey(oldChild);
  let newKeyChild = setKey(newChild);
  let lastIndex = 0;
  let patches = [];
  // 循环新列表
  for (let s in newKeyChild) {
    if (oldKeyChild[s]) {
      // 对比顺序
      if (oldKeyChild[s].index < lastIndex) { // 顺序有改变
        let node = oldKeyChild[s].__dom;
        let prevNode = newChildren[newKeyChild[s].index - 1];
        let after = prevNode && prevNode.__dom.nextSibling;
        patches.push({
          type: "move",
          node,
          parent,
          after
        })
      } else {
        lastIndex = oldKeyChild[s].index;
      }
      newChildren[newKeyChild[s].index].__dom = oldKeyChild[s].__dom;
      newChildren[newKeyChild[s].index] = diffNode(oldKeyChild[s], newKeyChild[s], createNode);
    } else {
      // 添加节点
      newKeyChild[s].__dom = createNode(newKeyChild[s]);
      let node = newKeyChild[s].__dom;
      let prevNode = newChildren[newKeyChild[s].index - 1];
      let after = prevNode && prevNode.__dom.nextSibling;
      patches.push({
        type: "insert",
        node,
        parent,
        after
      })

    }
  }
  for (let s in oldKeyChild) {
   
    if (!newKeyChild[s]) {
      // 删除节点
      //console.log(oldKeyChild,newKeyChild);
      patches.push({
        type: "remove",
        node: oldKeyChild[s].__dom
      });
    }
  }
  if (patches.length > 0) {
    patch(patches);
  }

  return newChildren;
}

function setKey(child) {
  let keyChild = {};
  child.forEach((item, index) => {
    let key = item.key;
    key = key !== undefined ? key : index;
    keyChild[key] = item;
    keyChild[key].index = index;
  });
  return keyChild;
}

function diffProps(oldProps, newProps) {
  let patches = {};
  for (let s in oldProps) {
    if (newProps[s] !== undefined) {
      if (newProps[s] !== oldProps[s]) {
        patches[s] = newProps[s];
      }
    } else {
      patches[s] = null;
    }
  }

  for (let s in newProps) {
    if (oldProps[s] !== undefined) {
      patches[s] = newProps[s];
    }
  }

  return patches;
}


export default diff;
