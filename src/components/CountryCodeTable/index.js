import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { map } from 'ramda'
// I have added Button 
import { Row, Table, Button } from 'react-bootstrap'

/*

  In this code challenge, I saw this application is using react-bootstrap that I might want to use. 
  I reference their documentation. - I actually learned how to use react-bootstrap yay!
  https://react-bootstrap.github.io/getting-started/introduction/

  I would like to implement 3 features if time allows.
  feature 1: Load more function (it will show few items first then as you click load more button, it will show more data on view) 
  feature 2: ascending and Descending order of showing list   
  feature 3: search function 

  feature 1: 
    the state will have end number which allows determining where to stop showing the array. 
    so I can use slice() to limit the array before use .map()

  feature 2: 
    ascending and Descending function. 
    Brainstorming : 
      - Array need to be sorted before the loop through at the map. 
      [Problems] 
        -How can I sort the array? 
          - since thi.props.externalData is an array, it can use array.sort() function. 
            - potential problem: how can I take care of the same string or slightly different string. 
            - I need to write compare function since sort() can take compare function to define sorting rule. 
            - I did a little googling about the problem and found the following article, 
            http://www.c-sharpcorner.com/UploadFile/fc34aa/sort-json-object-array-based-on-a-key-attribute-in-javascrip/
        - externalData is props and specs defined the value as const. 
          - I assume the author of the app does not want me to touch the variable.
          - potential workaround: 
            - create a state in here - but it will duplicate the data so it might not the best solution...; 
            this is the only solution I can come up with right now let me know if you have a better option in the future. 
        - I have a problem using externalData at componentDidMount. I think initialiseApp hasn't gotten data 

  ----------------------------------------------------------------------------------------------------------------------
      there is a problem using externalData, I have changed the approach to making the sorting function 
      I will still use the sortBy function but I will sort at getRow since it is the only place data does not strict by props or state

      - the second method worked well, however, sorted by number then it will give an issue.
        - this happens because an array is sorted by string not number 
        - solution: remove the + mark from the strings, convert to number then run sort function. 

  feature 3: 
    time's up! Aborted! 
      - I think I could be done like following. 
      - create input, take whatever input to a function that searches the partial or full string. 
      - probably, I could push the satisfied rows in an array. 
      - then display them. 
      - but here is the potential problem. As I had earlier, I might have to use "data" as nice way. So mostly I can make it happen is inside of getRow.
      - If I could use node js then I might call API to obtain necessary data but the method also comes with give-and-take :S
*/

class CountryCodeTable extends Component {
  /*
    constrctor() 
      - I need this for duplicate data. explained above :)
  */
  constructor(){
    super();
    this.state = {};
  }
  componentDidMount () {
    this.props.initialiseApp();  
    // [feature 1] initialize the end value so that it can show some content in the list   
    this.setEndState();
  }
  /*
    [feature 2]
    setData assign data to the state.
    end: this will help for pagination, let's say we have 10 items by default.
  */
  setSortState(direction='asc', arg='name'){
    this.setState({      
      order:direction,
      prop: arg
    });
  }
  /*
    [feature 1]
    setEndState()
    end: tracks last item in the data array.
    increase: defines how many items which can increase at one click on the load more button.
  */
  setEndState(end=10){
    this.setState({
      end: end,
      increase: 10
    })
  }

  /*
  [feature 1]
    I have added data.slice(0,this.state.end). It will limit displaying array size. 

  [feature 2]
    I added a switch statement to sort data by stored state value. 
    asc: if state.order is asc, it will use ascending order version of the compare function 
    dec: if state.order is dec, it will use descending order version of the compare function
    [Note]: 
      this function has not finished. I still have problem sorting when it deals with dial code. 
      It can solve by converting a string to int and sort it as the number. 
  */

  getRows (data) {    
    switch(this.state.order){
      case 'asc':
        data.sort(this.compareASC(this.state.prop));
        break;
      case 'dec': 
        data.sort(this.compareDESC(this.state.prop));
        break;
    }
    return map(
      ({ name, code, dialCode }) => (
        <tr key={code}>
          <td>{name}</td>
          <td>{code}</td>
          <td>{dialCode}</td>
        </tr>
      ),
      data.slice(0,this.state.end)
    )
  }
  /*
    getTable()
    [feature 1]
      I have added a button to load more. the event handler will call loadmore() once click 

    [feature 2]
      I have added 2 buttons in each column, ASC and DESC. it. 
      - I think it can be simpler and cleaner if I have a time, I could make helperComponent and add both buttons in one JSX tag.
        But i didn't do it since I didn't have enough time at this time :( 
  */
  getTable (data) {
    return data ? (
      <section>
        <Table striped responsive>
          <thead>
            <tr>
              <th>
                Name
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'asc','name')}>ASC</Button>
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'dec','name')}>DESC</Button>
              </th>
              <th>
                Code
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'asc','code')}>ASC</Button>
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'dec','code')}>DESC</Button>
              </th>
              <th>
                Dial Code
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'asc','dialCode')}>ASC</Button>
                <Button bsStyle="info" onClick={this.sortBy.bind(this,'dec','dialCode')}>DESC</Button>
              </th>
            </tr>
          </thead>
          <tbody>{this.getRows(this.props.externalData)}</tbody>
        </Table>
        <Button bsStyle="primary" onClick={this.loadmore.bind(this)}>Load More</Button>
      </section>
    ) : (
      <p>Loading data</p>
    )
  }

  /*
    loadmore()
    e: int, it defines a limit for displaying items.
      I have to careful to pick the range of it since e cannot be bigger than original data size and cannot go negative number
  */
  loadmore(){
    let e = this.state.end + this.state.increase;
    if(e > this.props.externalData.length){
      e = this.props.externalData.length;
    }
    if(e < 0){
      e = 0;
    }
    this.setEndState(e);
  }


  /*
    sortBy(arg)
      arg: string, tells which type of order has selected 
      prop: string, tells which properties are targeted. 
  */

  sortBy(arg,prop){    
    this.setSortState(arg,prop);
    /* Following was created at first proach at feature 2

      I was going to copy the props.externalData to state.externalData then run sorting. AS I mentioned above. This method was bad decision 
      but until I got error, that was the only thing I could think of within the time limit.
      However, React doesn't like to have setState inside of render(). ( this was good to know, How I set up app is slightly different so I've never faced this problem)

    */
    // let data = this.state.externalData;
    // switch(arg){
    //   case 'asc':

    //       data.sort(this.compareASC(prop));
    //     break;
    //   case 'dec':
    //       data.sort(this.compareDESC(prop));
    //     break;
    // }
    // this.setSortState(data);
  }

  /*
    [feature 2]
    compareASC(prop)
    prop: this hold property name of data set which you want to sort for. 
  */

  compareASC(prop){
    return function(a,b){
        if(a[prop] > b[prop]){
        return 1;
      }
      else if (a[prop] < b[prop]){
        return -1;
      }
      return 0;
    }
  }
  /*
    [feature 2]
    compareDESC(prop)
    prop: this holds property name of dataset which you want to sort for. 
    In order to make desc order, just invert the logic of ASC. then it should sort as desc order :)   
  */
  compareDESC(prop){
    return function(a,b){
      if(a[prop] < b[prop]){
        return 1;
      }
      else if (a[prop] > b[prop]){
        return -1;
      }
      return 0;
    }
  }
  
  /*
    render()
    I kept render() as is.
  */

  render () {
    
    return (
      <div>
        <Row key='header-row'>
          <h1>Country Calling Codes</h1>
        </Row>
        <Row key='body-row'>{this.getTable(this.props.externalData)}</Row>,
      </div>
    )
  }
}

CountryCodeTable.propTypes = {
  externalData: PropTypes.array,
  initialiseApp: PropTypes.func.isRequired
}

export default CountryCodeTable
