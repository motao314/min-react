import React from './kReact/react';
import Li from './Li';
class List extends React.Component {
    render(){
        let {data} = this.props;
        return <ul>{
                data.map((item,index)=>{
                    return <Li 
                        {...this.props}
                        key={item.id}
                        index= {index}
                        data={item}
                    />
                })
            }</ul>
    }
}
export default List;
