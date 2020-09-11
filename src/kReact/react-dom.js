import diff from "./diff";

// 根据虚拟DOM生成视图，并将视图挂载到 container
function render(vdom,container) {
  let node = createNode(vdom);
  container.appendChild(node);
}
// 根据虚拟DOM创建真实DOM
function createNode(vdom) {
  let node;
  if(vdom.type === "string"){//文本节点
    node = document.createTextNode(vdom.inner);
  } else if(typeof vdom.type === "function"){ // 组件
    node = createClass(vdom);
  } else { // 元素节点
    node = document.createElement(vdom.type);
    // 添加属性
    createProps(node,vdom.props)
    // 创建子节点
    createChild(node,vdom.children);
  }
  vdom.__dom = node;
  return node;
}
// 创建组件
function createClass(cmp) {
  cmp._cmp = new cmp.type(cmp.props);// 将组件实例化
  cmp._vdom = cmp._cmp.render(); // 获取该组件的虚拟DOM
  let node = createNode(cmp._vdom);
  /*
    这里执行挂载流程相关的生命周期
  */
  cmp._cmp.updater = function() {
    // let nextState = Object.assign({},cmp._cmp.state,...cmp._cmp.__nextState);
    // let isUpdater = true;
    // if(cmp.shouldComponentUpdater){
    //   isUpdater = cmp.shouldComponentUpdater(cmp.props,nextState)
    // }
    // if(isUpdater){
    //   cmp._cmp.state = nextState;
    //   let newNode  = cmp._cmp.render();
    //   // diff 的过程进行更新

    // }
    // if(cmp.componentDidUpdater){

    // }
    // 执行更新流程相关的生命周期函数
    Object.assign(cmp._cmp.state,...cmp._cmp.__nextState);
    let newVnode = cmp._cmp.render();
    cmp._vdom = diff(cmp._vdom,newVnode,createNode);
  }
  return node;
}

// 创建子节点
function createChild(node,children) {
  children.forEach(childNode => {
      render(childNode,node);
  });
}
let pxAttr = ["width","height","left","top"];
// 添加属性
function createProps(node,props) {
  for(let s in props){
    if(s === "children"){
        continue;
    }
    if(s === "style"){
        for(let sty in props[s]){
            let val = props[s][sty];
            if(pxAttr.includes(sty)){
                val = isNaN(val)?val:val+"px";
            }
            node.style[sty] = val;
        }
    } else if(s.slice(0,2) === "on"){
        node[s.toLocaleLowerCase()] = props[s]; 
    } else {
      node[s] = props[s]; 
    }
  }
}
export default {
  render
}