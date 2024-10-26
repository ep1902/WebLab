import React, { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";

const TicketInfo = () => {
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketInfo, setTicketInfo] = useState(null);
  const uuid = searchParams.get("uuid");
  console.log("cao");
  console.log(uuid);
  console.log("bella");

  const location = useLocation();

  console.log(searchParams.get("uuid"));
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem("returnUrl", location.pathname);
      loginWithRedirect({
        redirectUri: `https://weblabfrontend.onrender.com/ticketInfo/details?uuid=${uuid}`, // Trenutni URL stranice
      });
    } else if (isAuthenticated) {
      fetch(`https://weblabbackend.onrender.com/getTicketInfo/${uuid}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setTicketInfo(data);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div>
      <h1>Informacije o ulaznici</h1>
      <p>Prijavljeni korisnik: {user.name}</p>
      <>
        {ticketInfo ? (
          <div>
            <p>OIB: {ticketInfo.vatin}</p>
            <p>First name: {ticketInfo.firstname}</p>
            <p>Last name: {ticketInfo.lastname}</p>
          </div>
        ) : (
          <div>Ticket with this id doesn't exist</div>
        )}
        <LogoutButton></LogoutButton>
      </>
    </div>
  );
};

export default TicketInfo;
