function createElement(type,props={},...child){
    delete props.__self;
    delete props.__source;
    let children = [];
    let key = props.key;
    for(let i = 0; i < child.length; i++){
        if(Array.isArray(child[i])){
            child[i].forEach(item => {
                children.push(item);
            });
        } else {
            children.push(child[i]);
        }
    }
    children.forEach((item,index)=>{
        //console.log(item,index);
        if(typeof item !== "object"){
            children[index] = {
                type: "text",
                inner: item
            }
        }
    })
    return {
        type,
        props,
        children,
        key
    }
}

class Component {
    constructor(props){
        this.props = props;
        this.state = {};
    }
    setState(newState){
        this.state = {...this.state,...newState};
        this.updater();
    }
}

let React = {
    createElement,
    Component
};

export default React;