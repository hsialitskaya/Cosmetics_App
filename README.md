# 💄 💅🏼 Cosmetic Recommendation Platform 💅🏼 💄 
The Cosmetic Recommendation App is a full-stack web application built using JavaScript for both the frontend and backend. The app recommends cosmetics based on the user's skin type, allowing users to input their skin concerns and preferences. It includes features like adding cosmetics to favorites and suggesting websites tailored to the user's skin type. The platform integrates MQTT for real-time communication, a broker for handling messages, WebSocket (WS) for live updates, and TLS protocol for secure connections. The application aims to create a personalized, interactive, and secure experience for users seeking the right skincare products.


<img width="1436" src="https://github.com/user-attachments/assets/2e373b98-80ab-4bca-b1a4-36ccf1939e4f" />
<img width="1437" src="https://github.com/user-attachments/assets/041a47a1-2f8e-4fe8-a031-6a620bafd0c2" />
<img width="1435" src="https://github.com/user-attachments/assets/6d45f6dc-16ba-44ce-b793-ba1b2535247f" />
<img width="1432" src="https://github.com/user-attachments/assets/643fdb26-00ad-4916-8e5f-83a30c9d17f7" />
<img width="1417" src="https://github.com/user-attachments/assets/2068dbb7-82cb-4595-a2c9-a68acf2abb4a" />
<img width="1428" src="https://github.com/user-attachments/assets/4308d219-e2f2-4d43-8e57-24c6c20e2369" />
<img width="1412" src="https://github.com/user-attachments/assets/0f84952d-1d4f-471c-86ff-d05fdbe09ed9" />
<img width="1435" src="https://github.com/user-attachments/assets/96dc8eee-0cf2-481c-bb75-a86a6a2d460c" />


# 💻 Technologies Used

Cosmetic Recommendation Platform is built using the following technologies:

📍 JavaScript    
📍 HTML, CSS  
📍 Express.js, bcrypt.js, cors      
📍 MQTT, WebSocket (WS), TLS     
📍 Nginx    



# 🏁 Getting Started

To get started with the Cosmetic Recommendation Platform, follow these steps:

1️⃣ Clone the Repository   

Download the repository to your local machine by running the following command in your terminal:  

```bash
git clone https://github.com/hsialitskaya/Cosmetics_App.git Cosmetics_App
```

2️⃣ Install Dependencies  

Ensure you have Node.js installed on your system. Then, navigate to the project directory and install the required dependencies:
```bash
cd Cosmetics_App
npm install
```
3️⃣ Generate TLS Certificate   

Since the application uses a secure TLS connection, you need to generate a TLS certificate on your machine. Follow these steps:

Generate the certificate by running the following command in your terminal:
```bash
openssl req -x509 -newkey rsa:4096 -keyout tls/klucz.key -out tls/certyfikat.crt -days 365
```
This will create the following files:

tls/certyfikat.crt (the certificate),
tls/klucz.key (the private key),
tls/klucz_haslo.key (the password-protected private key, which can be generated with a password if needed).
Make sure that all these files are located in the tls/ folder in your project directory.

4️⃣ Add the Certificate to Trusted   

5️⃣ Configure MQTT Broker (Mosquitto)   

If you haven't already, install Mosquitto and start the broker with WebSockets and TLS enabled.

Install Mosquitto (Linux/macOS):
```bash
sudo apt install mosquitto mosquitto-clients  # Ubuntu/Debian  
brew install mosquitto  # macOS
```

Start the Broker
```bash
mosquitto
```

6️⃣ Run the Serwer    

Start the backend server by running the following command in your terminal:
```bash
cd backend
node app.js
```
This will launch the app locally, and you can view it in your browser at **https://localhost:5001**.


## License
Pokémons Explorer is licensed under the MIT License. See [LICENSE](https://github.com/hsialitskaya/Cosmetics_App/blob/main/LICENSE) for more information.    

Happy coding and enjoy creating the perfect skincare experience! 🎉
