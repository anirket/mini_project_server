const express = require("express");
const app = express();
const { PORT } = require("./constants/config")
const routes = require('./Routes/route');
const cors = require("cors");
const server = require("http").createServer(app);
const fs = require("fs");


const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methos: ["GET", "POST"]
    }
});



//middlewares
app.use("/", routes)
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
server.listen(PORT, () => {
    console.log(`SERVER running on ${PORT}`);
});


//socket connection


io.on("connection", (socket) => {
    let roomsize = {
        "JAVASCRIPT": 0,
        "PYTHON": 0,
        "C++": 0
    }
    socket.on('join_room', (data) => {
        socket.join(data.room);
        getroomsize();
        sendoldchats(data);
    })



    socket.on('message', (data) => {
        addmessagestojson(data);
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
        getroomsize();
    })

    socket.on("edit_message", (data) => {

        //make changes in file here
        editmessage(data);

        io.in(data.roomname).emit('trigger_edit', data);
    })
    socket.on("delete_message", (data) => {
        deletemessageinroom(data);

        //emit in other rooms
        io.in(data.roomname).emit('trigger_delete', data);
    })


    //get number of people in each room
    function getroomsize() {
        Object.keys(roomsize).map((roomname) => {
            if (io.sockets.adapter.rooms.get(roomname)) {
                var roomsizevalue = io.sockets.adapter.rooms.get(roomname).size
                roomsize[roomname] = roomsizevalue;
            }
        })
        io.emit("room_size", roomsize);
    }


    //adding message to JSON files
    function addmessagestojson(data) {
        if (data.roomname === "JAVASCRIPT") {
            const datatoread = fs.readFileSync('./Database/javascript.json');
            const jsondata = JSON.parse(datatoread);
            const javascript_array = jsondata.javascript_messages;
            const new_javascript_array = [...javascript_array, data];

            fs.writeFile('./Database/javascript.json', JSON.stringify({ "javascript_messages": new_javascript_array }, null, 2), () => {
                io.in(data.roomname).emit('recieve_message', data);
                console.log("data added");
            });
        }
        else if (data.roomname === "PYTHON") {
            const datatoread = fs.readFileSync('./Database/python.json');
            const jsondata = JSON.parse(datatoread);
            const python_array = jsondata.python_messages;
            const new_python_array = [...python_array, data];

            fs.writeFile('./Database/python.json', JSON.stringify({ "python_messages": new_python_array }, null, 2), () => {
                io.in(data.roomname).emit('recieve_message', data);
                console.log("data added");
            });
        }
        else {
            const datatoread = fs.readFileSync('./Database/cplusplus.json');
            const jsondata = JSON.parse(datatoread);
            const cplusplus_array = jsondata.cplusplus_messages;
            const new_cplusplus_array = [...cplusplus_array, data];

            fs.writeFile('./Database/cplusplus.json', JSON.stringify({ "cplusplus_messages": new_cplusplus_array }, null, 2), () => {
                io.in(data.roomname).emit('recieve_message', data);
                console.log("data added");
            });
        }
    }


    //Editing in JSON files
    function editmessage(data) {
        if (data.roomname === "JAVASCRIPT") {
            const datatoread = fs.readFileSync('./Database/javascript.json');
            const jsondata = JSON.parse(datatoread);
            const javascript_array = jsondata.javascript_messages;

            //sequential searh message
            javascript_array.map((messages) => {
                if (messages.id === data.editmsgid) {
                    messages.message = data.editmsg;
                    messages.edited = true;
                }
            })
            fs.writeFile('./Database/javascript.json', JSON.stringify({ "javascript_messages": javascript_array }, null, 2), () => {
                console.log("data updated");
            });


        }
        else if (data.roomname === "PYTHON") {
            const datatoread = fs.readFileSync('./Database/python.json');
            const jsondata = JSON.parse(datatoread);
            const python_array = jsondata.python_messages;

            //sequential search message
            python_array.map((messages) => {
                if (messages.id === data.editmsgid) {
                    messages.message = data.editmsg;
                    messages.edited = true;
                }
            })
            fs.writeFile('./Database/python.json', JSON.stringify({ "python_messages": python_array }, null, 2), () => {
                console.log("data updated");
            });
        }
        else {
            const datatoread = fs.readFileSync('./Database/cplusplus.json');
            const jsondata = JSON.parse(datatoread);
            const cplusplus_array = jsondata.cplusplus_messages;


            //sequential search message
            cplusplus_array.map((messages) => {
                if (messages.id === data.editmsgid) {
                    messages.message = data.editmsg;
                    messages.edited = true;
                }
            })

            fs.writeFile('./Database/cplusplus.json', JSON.stringify({ "cplusplus_messages": cplusplus_array }, null, 2), () => {
                console.log("data updated");
            });
        }
    }


    function deletemessageinroom(data) {
        if (data.roomname === "JAVASCRIPT") {
            const datatoread = fs.readFileSync('./Database/javascript.json');
            const jsondata = JSON.parse(datatoread);
            const javascript_array = jsondata.javascript_messages;

            //sequential searh message
            javascript_array.map((messages, index) => {
                if (messages.id === data.id) {
                    javascript_array.splice(index, 1);
                }
            })



            fs.writeFile('./Database/javascript.json', JSON.stringify({ "javascript_messages": javascript_array }, null, 2), () => {
                console.log("data deleted");
            });


        }
        else if (data.roomname === "PYTHON") {
            const datatoread = fs.readFileSync('./Database/python.json');
            const jsondata = JSON.parse(datatoread);
            const python_array = jsondata.python_messages;

            //sequential search message
            python_array.map((messages, index) => {
                if (messages.id === data.id) {
                    python_array.splice(index, 1);
                }
            })
            fs.writeFile('./Database/python.json', JSON.stringify({ "python_messages": python_array }, null, 2), () => {
                console.log("data deleted");
            });
        }
        else {
            const datatoread = fs.readFileSync('./Database/cplusplus.json');
            const jsondata = JSON.parse(datatoread);
            const cplusplus_array = jsondata.cplusplus_messages;


            //sequential search message
            cplusplus_array.map((messages, index) => {
                if (messages.id === data.id) {
                    cplusplus_array.splice(index, 1);
                }
            })

            fs.writeFile('./Database/cplusplus.json', JSON.stringify({ "cplusplus_messages": cplusplus_array }, null, 2), () => {
                console.log("data deleted");
            });
        }
    }

    function sendoldchats(data) {
        if (data.room === "JAVASCRIPT") {
            const datatoread = fs.readFileSync('./Database/javascript.json');
            const jsondata = JSON.parse(datatoread);
            const javascript_array = jsondata.javascript_messages;
            io.in(data.room).emit('old_chats', javascript_array);
        }
        else if (data.room === "PYTHON") {
            const datatoread = fs.readFileSync('./Database/python.json');
            const jsondata = JSON.parse(datatoread);
            const python_array = jsondata.python_messages;
            io.in(data.room).emit('old_chats', python_array);
        }
        else {
            const datatoread = fs.readFileSync('./Database/cplusplus.json');
            const jsondata = JSON.parse(datatoread);
            const cplusplus_array = jsondata.cplusplus_messages;
            io.in(data.room).emit('old_chats', cplusplus_array);
        }

    }

})