// hi there O_o
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Link, Route, Switch} from "react-router-dom";

class BookList extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {books: [], nodeName: ''};
    }

    componentDidMount() {
        let nodeName = '';
        fetch('http://0.0.0.0:4000/api/books')
            .then(function(resp) {
                nodeName = resp.headers.get('X-Node-Name');
                return resp.json();
            })
            .then((myJson) => {
                this.setState({books: myJson, nodeName: nodeName});
            });
    }
    
    render() {
        let barr = [];
        for(let b of this.state.books) {
            barr.push(<li key={b.bookId}><Link to={`/books/${b.bookId}`}>{b.title}</Link></li>);
        }
        return (
            <div>
                <ul>
                    {barr}
                </ul>
                {
                    this.state.nodeName ? (<span>Node name = {this.state.nodeName}</span>) : null
                }
            </div>
        );
    }
}

class Book extends React.Component {
    
    constructor(props) {
        super(props);
        
        if (props.book) {
            this.state = {book: props.book};
        } else {
            this.state = {book: {}};
        }
    }
    
    componentDidMount() {
        let bookId;
        let nodeName = '';
        let fromRedis = '';
        if (this.props.match) {
            let bookIdPar = this.props.match.params.number;
            bookId = parseInt(bookIdPar, 10);
        }
        
        if (isNaN(bookId)) {
            return;
        }
        
        fetch(`http://0.0.0.0:4000/api/books/${bookId}`)
            .then(function(resp) {
                nodeName = resp.headers.get('X-Node-Name');
                fromRedis = resp.headers.get('X-From-Redis');
                return resp.json();
            })
            .then((respJson) => {
                 this.setState({book: respJson, fromRedis: fromRedis, nodeName: nodeName});
            });
    }
    
    render() {
        let b = this.state.book;
        return (
            <div>
                <ul>
                <li>{b.title}</li>
                <li>{b.authors}</li>
                <li>{b.category}</li>
                <li>{b.isbn}</li>
                <li>{b.description}</li>
                </ul>
                
                {this.state.nodeName ? 
                     (<span>Node name = {this.state.nodeName}</span>)   
                    : null
                } 
                <br />
                { this.state.fromRedis ?
                    (<span>From Redis = {this.state.fromRedis}</span>)    
                    : null
                }
            </div>
        );
    }
}

function App() {
    return (
        <div>
            <Header />
            <Main />
        </div>
    )
}

function Header() {
    return (
        <header>
            <nav>
                <ul>
                    <li><Link to='/'>Home</Link></li>
                    <li><Link to='/books'>List</Link></li>
                    <li><Link to='/search'>Search</Link></li>
                </ul>
            </nav>
        </header>
    )
}

function Main() {
    return (
        <main>
            <Switch>
                <Route exact path='/' component={Home} />
                <Route path='/books' component={BookListParent} />
                <Route path='/search' component={Search} />
            </Switch>
        </main>
    );
}

function BookListParent() {
    return (
        <div>
              <Switch>
                  <Route exact path='/books' component={BookList}/>
                  <Route path='/books/:number' component={Book} />
              </Switch>  
        </div>
    );
}

class Search extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {books: [], query: ''};
    }
    
    handleClick() {
        if (this.state.query.length === 0) {
            return;
        }

        fetch(`http://0.0.0.0:4000/api/books/search?query=${this.state.query}`)
            .then(function(resp) {return resp.json();})
            .then((respJson) => {
                this.setState({books: respJson});
            });
        
    }
    
    getInputValue(event) {
        this.setState({books: [], query: event.target.value});
    }
    
    render() {
        var books = [];
        for(let bo of this.state.books) {
            books.push(<Book key={bo.bookId} book={bo}></Book>);
        }
        
        return (
            <div>
                <input placeholder="Type 'atlas' and click 'Go!' :D" name="query" type="text" onChange={ (evt) => this.getInputValue(evt) } style={{width: '300px'}}/>
                <button onClick={() => this.handleClick()}>Go!</button>
                <br />
                {books}
            </div>
        );
    }
}

function Home() {
    return (
        <div>
            <h6>O_o</h6>
        </div>
    );
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ,document.getElementById('root')
);
