const socket = new WebSocket("wss://localhost:5001");

socket.onopen = () => {
  console.log("Połączono z WebSocket");
};

socket.onerror = (error) => {
  console.error("Błąd WebSocket:", error);
};

socket.onclose = () => {
  console.log("Połączenie zamknięte");
};

export default socket;
