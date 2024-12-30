import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const fetchSeats = async () => {
  const res = await axios.get(`${BASE_URL}/seats`);
  return res.data;
};

// Book seats

export const bookSeats = async (seatNumbers) => {
  const res = await axios.post(`${BASE_URL}/book`, { seatNumbers });
  return res.data;
};

// Reset seats
export const resetSeats = async () => {
  const res = await axios.post(`${BASE_URL}/reset`);
  return res.data;
};
