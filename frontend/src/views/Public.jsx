import React, { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const [ticketCount, setTicketCount] = useState(null);
  const { user, isAuthenticated } = useAuth0();
  fetch(`https://weblabbackend.onrender.com/getTicketCount`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      setTicketCount(data.count);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
  console.log(ticketCount);
  return (
    <>
      <div>
        <h1>Home Page</h1>
        <p>Welcome to the Home page!</p>
        {isAuthenticated ? <p>Name: {user.name}</p> : null}
        {ticketCount ? (
          <div>Current ticket count is: {ticketCount}</div>
        ) : (
          <div></div>
        )}
      </div>
      {isAuthenticated ? (
        <LogoutButton></LogoutButton>
      ) : (
        <LoginButton></LoginButton>
      )}
    </>
  );
};

export default Home;
