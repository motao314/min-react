import diff from "./diff";
import patch from "./patch";

function render(vnode,parent){
    let node = createNode(vnode);
    parent.appendChild(node);
}
// createNode 将虚拟node 创建为真实的DOM node
function createNode(vnode){
    let node = null;
    //console.log(vnode);
    if(typeof vnode.type === "function"){
        node = createClass(vnode);
    }else if(vnode.type === "text"){
        node = document.createTextNode(vnode.inner);
    } else {
        node = document.createElement(vnode.type);
    }
    vnode._dom = node;
    vnode.children&&(appendChild(node,vnode.children));
    vnode.props&&(appendProps(node,vnode.props));
    return node;
}
// 添加组件
function createClass(vnode){
    let component = new vnode.type(vnode.props);
    let cmpNode = component.render();
    component.base = createNode(cmpNode);
    vnode._cmp = component;
    vnode._vdom = cmpNode;
    component.updater  = function(){
        let newCmpNode = vnode._cmp.render();
        vnode._vdom = diff(vnode._vdom,newCmpNode,patch,createNode);
        console.log(vnode._vdom);
        /*
            更新视图：
            1. diff 对比新老虚拟DOM，找到差异点
            2. 根据差异点生成补丁包
            3. 根据补丁包更新 真实DOM 
        */
    };
    
    return component.base;
}

// 添加子节点
function appendChild(parent,children){
    children.forEach(vnode => {
        render(vnode,parent);
    });
}
// 添加属性
function appendProps(node,props){
    for(let k in props){
        if(k === "className"){
            node.className = props[k];
        } else if(k === "style"){
            for(let attr in props[k]){
                node.style[attr] = props[k][attr];
            }
        } else if(k.substr(0,2) === "on"){
            node.addEventListener(k.substr(2).toLocaleLowerCase(),props[k]);
        } else {
            node.setAttribute(k,props[k]);
        }
    }
}

let ReactDOM = {
    render
};
export default ReactDOM;