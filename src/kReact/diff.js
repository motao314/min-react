
function diff(oldTree, newTree,patch,createNode) {
    return diffNode(oldTree, newTree, patch,createNode);
    //return patches;
}
function isTextNode(vnode) {
    return vnode.type === "text";
}
function diffNode(oldNode, newNode, patch,createNode) {
    let patches = [];
    let newVnode = oldNode;
    if ((!oldNode) && (!newNode)) {
        return newVnode;
    }
    /*
        判断节点是否删除
    */
    if (oldNode && (!newNode)) {
        // 有旧节点，没有新节点删除节点
        patches.push({
            type: "remove",
            node: oldNode._dom
        })
        newVnode = null;
    } else if (isTextNode(oldNode) && isTextNode(newNode)) {
        //都是文本节点时
        if (oldNode.inner !== newNode.inner) {
            // 新老文本不一样，替换文本节点
            patches.push({
                type: "text",
                newText: newNode.inner,
                node: oldNode._dom
            })
            newVnode.inner = newNode.inner;
        }
    } else if (oldNode.type !== newNode.type) {
        // 两个节点的，节点类型不一样，替换节点
        newNode._dom = createNode(newNode);
        patches.push({
            type: "replace",
            newNode: newNode._dom,
            oldNode: oldNode._dom
        });
        newVnode = newNode;
    } else if(typeof oldNode.type === "function"){
        newVnode = diffComponent(oldNode,newNode,patch,createNode)
    } else {
        // 节点一样时，要考虑，子节点的对比，属性的对比
        let propsPatches =  diffProps(oldNode.props,newNode.props);
        if(Object.keys(propsPatches).length > 0){
            patches.push({
                type: "attr",
                newProps: propsPatches,
                node: oldNode._dom
            });
            newVnode.props = newNode.props;
        }
        newVnode.children = diffChildren(oldNode.children,newNode.children,patch,createNode);
    }
    if(patches.length > 0){
       // 完成节点的更新
       patch(patches);
    }   
    return newVnode;
}
// 组件更新
function diffComponent(oldCmp,newCmp,patch,createNode){
    oldCmp._cmp.props = newCmp.props;
    let oldNode =  oldCmp._vdom;
    let newNode = oldCmp._cmp.render();
    oldCmp._vdom = diffNode(oldNode,newNode,patch,createNode);
    return oldCmp;
}
// 列表对比
function diffChildren(oldChildren,newChildren,patch,createNode){
    let oldKeyChildren = setKeyChildren(oldChildren);
    let newKeyChildren = setKeyChildren(newChildren);
    let lastIndex = 0;
    let newVChildren = newChildren;
    let patches = [];
    let parent = oldChildren[0]._dom.parentNode;
    for(let k in newKeyChildren){
        if(oldKeyChildren[k]){//老列表中也有对应项
            newKeyChildren[k]._dom = oldKeyChildren[k]._dom;
            newVChildren[newKeyChildren[k]._index] = diffNode(oldKeyChildren[k],newKeyChildren[k],patch,createNode);
            // 元素位置是否发生过移动
            /*
                lastIndex = 0;
                old: {a:a,index:0},{b:b,index:1},{c:c,index:2}
                //new: a x b v c
                new: b x a v c

                后边元素的下标一定大于前边元素，如果后边的元素下边小于前边的元素，说明位置有变化
            */
             if(oldKeyChildren[k]._index < lastIndex){ //位置有变化
                 //console.log("位置有变化",newKeyChildren[k]);
                 let prev = newChildren[newKeyChildren[k]._index-1];
                 let after = (prev&&prev._dom.nextSibling);
                 patches.push({
                    type:"move",
                    node: newKeyChildren[k]._dom,
                    parent,
                    after
                 });
             } else {
                 lastIndex = oldKeyChildren[k]._index;
             }
        } else {//没有对应项 添加
            //console.log("插入新节点",newKeyChildren[k]);
            newVChildren[newKeyChildren[k]._index]._dom = createNode(newKeyChildren[k]);
            let prev = newChildren[newKeyChildren[k]._index-1];
            let after = (prev&&prev.nextSibling);
            patches.push({
                type:"insert",
                node: newKeyChildren[k]._dom,
                parent,
                after
            });
        }
    }
    for(let k in oldKeyChildren){
        if(newKeyChildren[k]===undefined){
            //console.log("删除节点",oldKeyChildren[k]);
            patches.push({
                type:"remove",
                node: oldKeyChildren[k]._dom
            });
        }
    }
    // 完成更新
    if(patches.length>0){
        patch(patches);
    }
    return newVChildren;
}
// 将虚拟DOM数组
function setKeyChildren(vnodeList){
    let keyObj = {};
    vnodeList.forEach((item,index) => {
        let key = item.key===undefined?index:item.key;
        keyObj[key] = item;
        keyObj[key]._index = index;
    });
    return keyObj;
}

// 属性对比
function diffProps(oldProps={},newProps={}){
    let propsPatches = {};
    // 新加 修改
    for(let s in newProps){
        if(typeof newProps[s] === "object"){
            let childPatches = diffProps(oldProps[s],newProps[s]);
            if(Object.keys(childPatches).length > 0){
                propsPatches[s] = childPatches;
            }
        } else {
            if(newProps[s] !== oldProps[s]){
                propsPatches[s] = newProps[s];
            }
        }
    }
    // 删除
    let newPropsKeys = Object.keys(newProps);
    for(let s in oldProps){
        if(!newPropsKeys.includes(s)){
            propsPatches[s] = null;
        }
    }
    return propsPatches;
}
export default diff;
