import React from './kReact/react';
import List from './List';
class App extends React.Component {
    state = {
        count: 1,
        data: [
            {
                id: 1,
                title:"数组第一项"
            }
        ]
    }
    countHandler = () => {
        let { count, data } = this.state;
        ++count;
        data.push({
            id: Date.now(),
            title: '这是第' + count + '项'
        });
        this.setState({
            count,
            data
        })
    }
    removeHandler = ( id ) => {
        let { data } = this.state;
        console.log(data.filter(item=>{
            return item.id !== id;
        }),id);
        this.setState({
            data: data.filter(item=>{
                return item.id !== id;
            })
        })
    }
    moveHandler = ({ target }) => {
        let { data } = this.state;
        let { index } = target.dataset;
        let now = data.splice(index, 1)[0];
        if (index == 0) {
            data.push(now);
        } else {
            data.splice(index - 1, 0, now);
        }
        this.setState({
            data
        })
    }
    render() {
        let { count, data } = this.state;
   
        return <div className={"box" + count}>
            <List
                data={data}
                moveHandler={this.moveHandler}
                removeHandler={this.removeHandler}
            />
            <button onClick={this.countHandler}>递增</button>
        </div>
    }
}
export default App;
