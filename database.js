var mysql = require('mysql')

var con = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"oracle",
    database:"projectwb"
})

con.connect(function(err){
    if(!err) {
        console.log("Connected to the Database")
    } else{
        console.log("Error connecting to Database: "+ err.stack)
    }
});

function searchProducts(query) {
    const sql = "SELECT * FROM menuitems";
    const params = [`%${query}%`];

    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function saveOrderToDatabase(userId, cart) {
    const orderInsertQuery = 'INSERT INTO orders (user_id, product_id, quantity, total_price, OrderDate) VALUES (?, ?, ?, ?, NOW())';
    
    let totalOrderPrice = 0;

    cart.forEach(item => {
        const values = [userId, item.productId, item.quantity, item.price * item.quantity];
        totalOrderPrice += item.price * item.quantity;

        con.query(orderInsertQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting order into the database:', err);
            } else {
                console.log('Order inserted successfully');
            }
        });
    });

    return { cart, totalOrderPrice }; 
}

async function getItemById(con, itemId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * from menuitems WHERE menuitemid = ?'; 

        con.query(query, [itemId], (error, results) => {
            if (error) {
                console.error('Error fetching item by ID:', error);
                reject(error);
            } else {
                const item = results[0];
                resolve(item);
            }
        });
    });
}

function saveOrderToDatabase(userId, cart) {
    const orderInsertQuery = 'INSERT INTO orders (userID, total_price, order_date) VALUES (?, ?, NOW())';
    
    let totalOrderPrice = 0;

    return new Promise((resolve, reject) => {
        con.query(orderInsertQuery, [userId, totalOrderPrice], (err, orderResult) => {
            if (err) {
                console.error('Error inserting order into the database:', err);
                reject(err);
            } else {
                const orderId = orderResult.insertId;

                const orderItemInsertQuery = 'INSERT INTO order_items (order_id, menuitemID, quantity, price) VALUES (?, ?, ?, ?)';
                cart.forEach(item => {
                    const values = [orderId, item.MenuItemID, item.quantity, item.price];
                    totalOrderPrice += item.price * item.quantity;

                    con.query(orderItemInsertQuery, values, (err, itemResult) => {
                        if (err) {
                            console.error('Error inserting order item into the database:', err);
                            reject(err);
                        }
                    });
                });
                
                resolve({ orderId, totalOrderPrice });
            }
        });
    });
}

module.exports = {con, searchProducts, saveOrderToDatabase, getItemById};