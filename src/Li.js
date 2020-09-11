import React from './kReact/react';
class Li extends React.Component {
    remove=()=>{
        let {data,removeHandler} = this.props;
        removeHandler(data.id);
    }
    render(){
        let {data} = this.props;
        console.log(data);
        return <li>
            {data.title}
            <button onClick={this.remove}>删除</button>
        </li>
    }
}
export default Li;
