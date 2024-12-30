import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { bookSeats, fetchSeats, resetSeats } from "./apiService";

const App = () => {
  const ROWS = 11; // Total rows
  const SEATS_PER_ROW = 7; // Seats per row
  const TOTAL_SEATS = ROWS * SEATS_PER_ROW; // Total seats

  // State variables
  const [seats, setSeats] = useState(Array(TOTAL_SEATS).fill("available"));
  const [numSeats, setNumSeats] = useState(""); // Number of seats to book
  const [isBookingLoading, setIsBookingLoading] = useState(false); // Booking loading state
  const [isResetLoading, setIsResetLoading] = useState(false); // Reset loading state

  useEffect(() => {
    const loadSeats = async () => {
      setIsBookingLoading(true); // Show loader when loading seats
      try {
        const seatData = await fetchSeats();
        setSeats(seatData?.map((seat) => seat.status));
      } catch (error) {
        console.error(error);
        alert("Error loading seat data. Please try again later.");
      } finally {
        setIsBookingLoading(false); // Hide loader when seats are loaded
      }
    };

    loadSeats();
  }, []);

  // Handle seat booking logic
  const handleBookSeats = async () => {
    const n = parseInt(numSeats);

    if (isNaN(n) || n <= 0) {
      alert("Please enter a valid number of seats.");
      return;
    }

    const updatedSeats = [...seats];
    let bookedSeats = [];
    let seatsToBook = n;

    // Step 1: Try to book all seats in one row
    for (let row = 0; row < ROWS; row++) {
      const rowStart = row * SEATS_PER_ROW;
      const rowEnd = rowStart + SEATS_PER_ROW;
      const currentRow = updatedSeats.slice(rowStart, rowEnd);

      // Find available seats in the current row
      const availableSeats = currentRow.reduce((indices, seat, index) => {
        if (seat === "available") indices.push(index + rowStart);
        return indices;
      }, []);

      // If the row can fully accommodate the request
      if (availableSeats.length >= seatsToBook) {
        for (let i = 0; i < seatsToBook; i++) {
          updatedSeats[availableSeats[i]] = "booked";
          bookedSeats.push(availableSeats[i]);
        }
        seatsToBook = 0; // Booking is complete
        break;
      }
    }

    // Step 2: If no single row can accommodate, book across rows
    if (seatsToBook > 0) {
      for (let row = 0; row < ROWS; row++) {
        const rowStart = row * SEATS_PER_ROW;
        const rowEnd = rowStart + SEATS_PER_ROW;
        const currentRow = updatedSeats.slice(rowStart, rowEnd);

        const availableSeats = currentRow.reduce((indices, seat, index) => {
          if (seat === "available") indices.push(index + rowStart);
          return indices;
        }, []);

        for (let i = 0; i < availableSeats.length && seatsToBook > 0; i++) {
          updatedSeats[availableSeats[i]] = "booked";
          bookedSeats.push(availableSeats[i]);
          seatsToBook--;
        }

        if (seatsToBook === 0) break;
      }
    }

    if (seatsToBook > 0) {
      alert("Not enough seats available to fulfill your booking.");
      return;
    }

    setIsBookingLoading(true); 
    try {
      await bookSeats(bookedSeats?.map((seat) => seat + 1)); 
      setSeats(updatedSeats);
      alert(
        `Successfully booked seats: ${bookedSeats
          ?.map((i) => i + 1)
          .join(", ")}`
      );
      setNumSeats(""); 
    } catch (error) {
      console.error("Error booking seats:", error);
      alert("Failed to book seats. Please try again later.");
    } finally {
      setIsBookingLoading(false); 
    }
  };


  const handleReset = async () => {
    setIsResetLoading(true); 
    try {
      await resetSeats(); 
      const refreshedSeats = await fetchSeats(); 
      setSeats(refreshedSeats?.map((seat) => seat.status)); 
      alert("All bookings have been reset.");
    } catch (error) {
      console.error("Error resetting seats:", error);
      alert("Failed to reset bookings.");
    } finally {
      setIsResetLoading(false); 
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        jusitfyContent: "space-between",
      }}
    >
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Ticket Booking
      </Typography>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#e6e6e6",
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "space-around",
          gap: "2rem",
          jusitfyContent: "space-between",
        }}
      >
        {isBookingLoading ? (
          <CircularProgress />
        ) : ( 
          <>
            {/* Seat Grid */}
            <Box
              sx={{
                maxWidth: 600,
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "10px",
                marginBottom: "2rem",
              }}
            >
              {seats?.map((seat, index) => (
                <Button
                  key={index}
                  variant="contained"
                  sx={{
                    backgroundColor: seat === "available" ? "green" : "red",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor:
                        seat === "available" ? "darkgreen" : "darkred",
                    },
                    borderRadius: "8px",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>

            {/* Booking Form */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <TextField
                variant="outlined"
                label="Enter number of seats"
                type="number"
                value={numSeats}
                onChange={(e) => setNumSeats(e.target.value)}
                sx={{ width: "300px" }}
              />
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBookSeats}
                  disabled={isBookingLoading} // Disable when loading
                >
                  {isBookingLoading ? <CircularProgress size={24} /> : "Book"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleReset}
                  disabled={isResetLoading} // Disable when loading
                >
                  {isResetLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Reset Booking"
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default App;
