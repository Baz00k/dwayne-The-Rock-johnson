let socket;

(function() {
    socket = io();
    socket.connect();  

    main();
})();