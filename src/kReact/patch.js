export default function patch(patches) {
    //console.log(patches);
    patches.forEach(p => {
        switch (p.type) {
            case "text":
                p.node.textContent = p.newText;
                break;
            case "replace":
                p.oldNode.parentNode.replaceChild(p.newNode, p.oldNode);
                break;
            case "remove":
                p.node.remove();
                break;
            case "attr":
                setAttr(p.node, p.newProps)
                break;
            case "move":
            case "insert":
                if (p.after) {
                    p.parent.insertBefore(p.node, p.after);
                } else {
                    p.parent.appendChild(p.node);
                }
                break;
        }
    });
}
let pxAttr = ["width","height","left","top"];
function setAttr(node, newProps) {
    for (let s in newProps) {
        if (s === "children") {
            continue;
        }
        if(newProps[s] === null){
            delete node[s];
        }
        if (s === "style") {
            for (let sty in newProps[s]) {
                let val = newProps[s][sty];
                if (pxAttr.includes(sty)) {
                    val = isNaN(val) ? val : val + "px";
                }
                node.style[sty] = val;
            }
        } else if (s.slice(0, 2) === "on") {
            node[s.toLocaleLowerCase()] = newProps[s];
        } else {
            node[s] = newProps[s];
        }
    }
}
