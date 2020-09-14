export default function patch(patches){
    //console.log(patches);
    patches.forEach(p=>{
        switch(p.type){
            case "text":
                p.node.textContent = p.newText;
                break;
            case "replace":
                p.oldNode.parentNode.replaceChild(p.newNode,p.oldNode);
                break;
            case "remove":
                p.node.remove();
                break;
            case "attr":
                setAttr(p.node,p.newProps)
                break;
            case "move":
            case "insert":
                if(p.after){
                    p.parent.insertBefore(p.node,p.after);
                } else {
                    p.parent.appendChild(p.node);
                }
                break;
        }
    });
}

function setAttr(node,newProps){
    for(let k in newProps){
        if(typeof newProps[k] === "object"){
            setAttr(node[k],newProps[k]);
        } else if (k === "className"){
            node[k] = newProps[k]?newProps[k]:"";
        } else if(newProps[k] === null){
            if(node.tagName){
                node.removeAttibute(k);
            } else {
                delete node[k]
            }
        } else {
            node.setAttribute(k,newProps[k]);
        }
    }
}