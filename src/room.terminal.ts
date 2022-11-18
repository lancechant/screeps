export function roomTerminal(room: Room) {
    if (room.terminal && (Game.time % 10 === 0)) {
        if (room.terminal.store[RESOURCE_ENERGY] >= 2000 && room.terminal.store[RESOURCE_HYDROGEN] >= 200) {
            var orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_HYDROGEN
                && order.type == ORDER_BUY && Game.market.calcTransactionCost(200, room.name, order.roomName!) < 400);
            console.log("hydrogen order found ", orders.length);
            if (orders.length > 0) {
                orders.sort((a,b) => b.price - a.price);
                console.log("possible best price", orders[0].price);
                if (orders[0].price >= 5) {
                    var results = Game.market.deal(orders[0].id, 200, room.name);
                    if (results == OK) {
                        console.log("SOLD")
                    }
                }
            }
        }
        // else if (room.terminal.store[RESOURCE_ENERGY] >= 2000) {
        //     var orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY
        //         && order.type == ORDER_BUY && Game.market.calcTransactionCost(1000, room.name, order.roomName!) < 800);
        //     console.log("energy order found ", orders.length);
        //     if (orders.length > 0) {
        //         orders.sort((a,b) => b.price - a.price);
        //         console.log("possible best price", orders[0].price);
        //         if (orders[0].price >= 5) {
        //             var results = Game.market.deal(orders[0].id, 1000, room.name);
        //             if (results == OK) {
        //                 console.log("SOLD")
        //             }
        //         }
        //     }
        // }
    }
}