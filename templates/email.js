/*
* Email Messsage templates
*/

// Dependencies


//Handler for tokens
_messages ={}

_messages.afterCheckout = (data) => {
    console.log(data)
    return ({
        "subject": `Pizza order Receipt ${data.orderId}`,
        "html": `
        <html>
            <head>
                <title>Order succesful</title>
            </head>
            <body>
            <h3>Thank you for you purhcase</h3>
            <h4>Order is coming</h4>
            <p>
                <a href="${data.receiptUrl}">Link to your receipt</a>
            </p>
            </body>
        </html>`,
        "text": `Order succesful. Thank you for you purhcase.  Receipt link: ${data.receiptUrl}
    `})
};


module.exports = _messages;