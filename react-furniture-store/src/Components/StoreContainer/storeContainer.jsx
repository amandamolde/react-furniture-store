import React, { Component } from "react"
import Title from "../Title/title.jsx"
import ShoppingCart from "../ShoppingCart/shoppingCart.jsx"
import ItemCarousel from "../ItemCarousel/itemCarousel.jsx"
import ItemCardContainer from "../ItemCardContainer/itemCardContainer.jsx"
import { Link } from 'react-router-dom';

class StoreContainer extends Component {
    constructor () {
        super(),
        this.state = {
            items: [],
            shoppingCart: [],
            totalCost: 0,
            purchaseComplete: false,
        }
    };
    componentDidMount(){
        this.getItems().then((items) => {
            this.setState({
                items: items.data
            })
        }).catch((err) => {
            console.log(err);
        });
    };
    getItems = async () => {
        const items = await fetch('http://localhost:9000/api/v1/items', {
            credentials: 'include',
            method: "GET" 
        });
        const itemsJson = await items.json();
        console.log(itemsJson);
        return itemsJson;
    };
    // addItem = async (item, e) => {
    //     e.preventDefault();

    //     try {
    //         const createItem = await fetch('http://localhost:9000/api/v1/items', {
    //             method: 'POST',
    //             credentials: 'include',
    //             body: JSON.stringify(item),
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         const parsedResponse = await createItem.json();

    //         this.setState({items: [...this.state.items, parsedResponse.data]});
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };
    handleIncrement = (item) => {
        const newItemsArray = [...this.state.items]
        const index = newItemsArray.indexOf(item);
        newItemsArray[index] = {...item};
        newItemsArray[index].count++;
        this.setState({items : newItemsArray});  
    };
    handleReset = () =>{
        console.log("event reset called")
        const items = this.state.items.map(item => {
            item.value =0;
            return item;
        })
        this.setState({items})
    };
    handleDelete =(counterId)=> {
        console.log("event delete called", counterId)
        const counters = this.state.counters.filter(counter => counter.id !== counterId)
        this.setState({counters})
    };
     //Patrick ADD here--------------------------------
     addToCart = (item) => {
        console.log("event added item to cart")
        const newCartArray = [...this.state.shoppingCart]
        const newCartItem = {...item};
        newCartArray.push(newCartItem)
        this.setState({shoppingCart : newCartArray});  
    };
    handleItemClick = async (item) => {
    
        await this.addToCart(item);
        this.calculateTotal();
    }
    calculateTotal = () => {
        let total = 0
        this.state.shoppingCart.map(item => {
            total += item.price
            console.log(total)
            return total
        })
        this.setState({totalCost : total})
        
    }
    checkOut = async (checkout, e) => {
        console.log("checkout called")
        console.log(checkout)
        e.preventDefault();
        try {
            const createCheckout = await fetch('http://localhost:9000/checkout/', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(checkout),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const parsedResponse = await createCheckout.json();
        
            console.log(parsedResponse);
    
        } catch (err) {
            console.log(err, "error");
        }
    };
    async submit(ev) {
        console.log("checkout form submitted")
        let {token} = await this.props.stripe.createToken({name: "Name"});
        let response = await fetch("http://localhost:9000/charge", {
          method: "POST",
          headers: {"Content-Type": "text/plain"},
          body: token.id
        });
      
        if (response.ok) this.setState({purchaseComplete: true});
        console.log("Submit was completed")
    }
    userHasScopes = (scopes) => {
        const grantedScopes = JSON.parse(localStorage.getItem('scopes')).split(' ');
        return scopes.every(scope => grantedScopes.includes(scope));
    }

    isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
        let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    render(){
        const isAuthenticated = this.isAuthenticated;
        const userHasScopes = this.userHasScopes;
        return(
            <div>
                <h1> Store Container </h1>
                <Title />
                <ShoppingCart item={this.state.items} shoppingCart={this.state.shoppingCart} totalCost={this.state.totalCost} onReset = {this.state.handleReset}
                onDelete = {this.state.handleDelete}
                checkOut = {this.checkOut}
                submit = {this.submit}    
                />
                
                <ItemCarousel 
                    item={this.state.items}
                />

                <ItemCardContainer 
                    item={this.state.items}
                    // onIncrement={this.handleIncrement}
                    // addToCart={this.addToCart}
                    // calculateTotal={this.calculateTotal}
                    handleItemClick={this.handleItemClick}
                />

                {
                    isAuthenticated() && userHasScopes(['write:messages']) && (
                        <Link to='/admin'>Manage Inventory</Link>
                    )
                }

                
            </div>
        )   
    }
}

export default StoreContainer;